'use strict';
const { Pool } = require('pg');
const crypto = require('node:crypto');
let pool;
function db() {
  if (!process.env.DATABASE_URL) throw new Error('LMS database is not configured');
  if (!pool) pool = new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true},max:4,connectionTimeoutMillis:5000});
  return pool;
}
function digest(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function safeEqual(a,b) { const x=Buffer.from(a||'');const y=Buffer.from(b||'');return x.length===y.length && crypto.timingSafeEqual(x,y); }
function verifyPassword(password,stored) {
  if(typeof password!=='string'||typeof stored!=='string') return false;
  const parts=stored.split('$');
  if(parts.length!==4||parts[0]!=='scrypt-v1'||!/^[a-f0-9]{32}$/.test(parts[1])||!/^[a-f0-9]{128}$/.test(parts[2])||parts[3]!=='64') return false;
  const candidate=crypto.scryptSync(password,Buffer.from(parts[1],'hex'),64,{N:16384,r:8,p:1}).toString('hex');
  return safeEqual(candidate,parts[2]);
}
function hashPassword(password) {
  if(typeof password!=='string'||password.length<12||password.length>128) throw new Error('Password must be 12-128 characters');
  const salt=crypto.randomBytes(16).toString('hex');
  return 'scrypt-v1$'+salt+'$'+crypto.scryptSync(password,Buffer.from(salt,'hex'),64,{N:16384,r:8,p:1}).toString('hex')+'$64';
}
function json(res,status,data){res.status(status).setHeader('Cache-Control','no-store').json(data);}
function sameOrigin(req) {
  const origin=req.headers.origin;
  if(!origin) return false;
  const host=req.headers['x-forwarded-host']||req.headers.host;
  try {const u=new URL(origin);return u.protocol==='https:' && u.host===host;}catch{return false;}
}
function cookies(req) {return Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split(/=(.*)/s).slice(0,2)).filter(p=>p[0]));}
async function getUser(req) {
  const token=cookies(req).lms_session;
  if(!token||!/^[a-f0-9]{64}$/.test(token)) return null;
  const r=await db().query(`SELECT u.id,u.role,u.student_id,s.matric_number,s.full_name,s.nickname
    FROM auth_sessions t JOIN app_users u ON u.id=t.user_id LEFT JOIN students s ON s.id=u.student_id
    WHERE t.token_hash=$1 AND t.revoked_at IS NULL AND t.expires_at>now() AND u.status='active' LIMIT 1`,[digest(token)]);
  return r.rows[0]||null;
}
function setCookie(res,token,maxAge) {
  res.setHeader('Set-Cookie','lms_session='+token+'; HttpOnly; Secure; SameSite=Strict; Path=/api/lms; Max-Age='+maxAge);
}
module.exports={db,digest,verifyPassword,hashPassword,json,sameOrigin,getUser,setCookie,cookies};
