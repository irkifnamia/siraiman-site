const test=require('node:test');const assert=require('node:assert/strict');
const {generateCode,normalizedCode,codeHash,identityHash,enabled}=require('../lib/activation');
test('code uses 144 bits of randomness and correct shape',()=>{const a=generateCode(),b=generateCode();assert.match(a,/^[A-F0-9]{36}$/);assert.notEqual(a,b);assert.equal(normalizedCode(a.toLowerCase()),a)});
test('malformed codes are rejected',()=>{assert.equal(normalizedCode('123'),null);assert.equal(normalizedCode(null),null)});
test('hashing separates codes from identifiers',()=>{process.env.AUTH_PEPPER='test-pepper-only';assert.notEqual(codeHash('ABC'),identityHash('ABC'));delete process.env.AUTH_PEPPER});
test('activation disabled by default',()=>{delete process.env.LMS_ACTIVATION_ENABLED;assert.equal(enabled(),false)});
