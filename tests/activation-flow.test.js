'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {generateCode,normalizedCode,codeHash,enabled}=require('../lib/activation');
const {hashPassword,verifyPassword}=require('../lib/lms');
test('codes have high entropy and unique values',()=>{
 const codes=new Set(Array.from({length:100},generateCode));
 assert.equal(codes.size,100);
 for(const code of codes)assert.equal(normalizedCode(code),code);
});
test('code hashing is keyed and does not reveal code',()=>{
 const prior=process.env.AUTH_PEPPER;process.env.AUTH_PEPPER='test-only-secret';
 const code=generateCode(),hashed=codeHash(code);
 assert.match(hashed,/^[a-f0-9]{64}$/);assert.equal(hashed.includes(code),false);
 if(prior===undefined)delete process.env.AUTH_PEPPER;else process.env.AUTH_PEPPER=prior;
});
test('password hashing is salted and verifies',()=>{
 const password='An-example-secure-passphrase!';
 const a=hashPassword(password),b=hashPassword(password);
 assert.notEqual(a,b);assert.ok(verifyPassword(password,a));assert.ok(!verifyPassword('incorrect',a));
});
test('activation is explicitly gated',()=>{
 const prior=process.env.LMS_ACTIVATION_ENABLED;
 delete process.env.LMS_ACTIVATION_ENABLED;assert.equal(enabled(),false);
 process.env.LMS_ACTIVATION_ENABLED='false';assert.equal(enabled(),false);
 process.env.LMS_ACTIVATION_ENABLED='true';assert.equal(enabled(),true);
 if(prior===undefined)delete process.env.LMS_ACTIVATION_ENABLED;else process.env.LMS_ACTIVATION_ENABLED=prior;
});
