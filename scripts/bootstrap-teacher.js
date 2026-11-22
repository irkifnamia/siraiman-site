#!/usr/bin/env node
'use strict';
// Offline, interactive-only bootstrap. NEVER run in CI or a hosted request handler.
// This script does not generate or store a teacher account unless deliberately run
// by the verified project owner in a trusted local environment.
const readline=require('node:readline/promises');
const {stdin,stdout}=require('node:process');
const {db,hashPassword}=require('../lib/lms');
async function hiddenPrompt(prompt){
 stdout.write(prompt);
 const wasRaw=stdin.isRaw;
 let value='';
 stdin.setRawMode(true);stdin.resume();
 try{
  return await new Promise((resolve,reject)=>{
   function onData(chunk){
    const bytes=Buffer.from(chunk);
    for(const byte of bytes){
     if(byte===3){stdin.off('data',onData);reject(new Error('Cancelled'));return}
     if(byte===10||byte===13){stdin.off('data',onData);stdout.write('\\n');resolve(value);return}
     if(byte===127||byte===8){value=value.slice(0,-1);continue}
     if(byte>=32&&byte<=126&&value.length<128)value+=String.fromCharCode(byte);
    }
   }
   stdin.on('data',onData);
  });
 }finally{stdin.setRawMode(Boolean(wasRaw));}
}
async function main(){
 if(!stdin.isTTY||!stdout.isTTY)throw new Error('Run in an interactive terminal only');
 if(process.env.LMS_BOOTSTRAP_TEACHER!=='YES')throw new Error('Set LMS_BOOTSTRAP_TEACHER=YES for a one-time, locally approved bootstrap');
 const rl=readline.createInterface({input:stdin,output:stdout});
 try{
  const login=(await rl.question('Teacher login ID (not a student matric number): ')).trim().toLowerCase();
  if(!/^[a-z][a-z0-9._-]{5,39}$/.test(login))throw new Error('Login must be 6-40 characters, starting with a letter');
  const password=await hiddenPrompt('Teacher password (12-128 characters, hidden): ');
  const confirm=await hiddenPrompt('Confirm password (hidden): ');
  if(password!==confirm)throw new Error('Passwords differ');
  const confirmation=await rl.question('Type CREATE TEACHER to confirm: ');
  if(confirmation!=='CREATE TEACHER')throw new Error('Cancelled');
  const hash=hashPassword(password);
  const client=await db().connect();
  try{
   await client.query('BEGIN');
   await client.query('SELECT pg_advisory_xact_lock(8932131)');
   const existing=await client.query("SELECT count(*)::int AS n FROM app_users WHERE role='teacher'");
   if(existing.rows[0].n!==0)throw new Error('A teacher already exists. Bootstrap is single-use.');
   await client.query("INSERT INTO app_users(login_identifier,role,password_hash,status,activated_at,password_changed_at) VALUES($1,'teacher',$2,'active',now(),now())",[login,hash]);
   await client.query('COMMIT');
   stdout.write('Teacher account created. Do not share your password.\n');
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }finally{rl.close()}
}
main().catch(e=>{console.error('Bootstrap aborted:',e.message);process.exitCode=1});
