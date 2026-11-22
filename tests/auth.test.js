const test=require('node:test');const assert=require('node:assert/strict');
const {hashPassword,verifyPassword,digest}=require('../lib/lms');
test('password hash verifies correct password',()=>{const hash=hashPassword('strong-example-password');assert.equal(verifyPassword('strong-example-password',hash),true);assert.equal(verifyPassword('incorrect-password',hash),false);assert.equal(hash.includes('strong-example-password'),false)});
test('rejects short passwords',()=>assert.throws(()=>hashPassword('short')));
test('digest is deterministic',()=>assert.equal(digest('a'),digest('a')));
