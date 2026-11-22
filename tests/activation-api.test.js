'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const issue=require('../api/lms/activation-issue');
const redeem=require('../api/lms/activation-redeem');
function res(){
 const out={statusCode:200,headers:{}};
 out.status=n=>{out.statusCode=n;return out};
 out.setHeader=(k,v)=>{out.headers[k]=v;return out};
 out.json=x=>{out.body=x;return out};
 return out;
}
const origin={origin:'https://lms.example.test',host:'lms.example.test'};
test('issuance rejects non-POST requests before database access',async()=>{
 const r=res();await issue({method:'GET',headers:origin},r);
 assert.equal(r.statusCode,405);
});
test('redemption rejects non-POST requests before database access',async()=>{
 const r=res();await redeem({method:'GET',headers:origin},r);
 assert.equal(r.statusCode,405);
});
test('issuance rejects missing origin before database access',async()=>{
 const r=res();await issue({method:'POST',headers:{host:'lms.example.test'}},r);
 assert.equal(r.statusCode,403);
});
test('redemption rejects mismatched origin before database access',async()=>{
 const r=res();await redeem({method:'POST',headers:{...origin,origin:'https://evil.example.test'}},r);
 assert.equal(r.statusCode,403);
});
test('issuance disabled by default',async()=>{
 const old=process.env.LMS_ACTIVATION_ENABLED;
 delete process.env.LMS_ACTIVATION_ENABLED;
 try{const r=res();await issue({method:'POST',headers:origin,body:{}},r);assert.equal(r.statusCode,503)}
 finally{if(old===undefined)delete process.env.LMS_ACTIVATION_ENABLED;else process.env.LMS_ACTIVATION_ENABLED=old}
});
test('redemption disabled by default',async()=>{
 const old=process.env.LMS_ACTIVATION_ENABLED;
 delete process.env.LMS_ACTIVATION_ENABLED;
 try{const r=res();await redeem({method:'POST',headers:origin,body:{}},r);assert.equal(r.statusCode,503)}
 finally{if(old===undefined)delete process.env.LMS_ACTIVATION_ENABLED;else process.env.LMS_ACTIVATION_ENABLED=old}
});
test('invalid activation data is rejected before database access',async()=>{
 const old=process.env.LMS_ACTIVATION_ENABLED;process.env.LMS_ACTIVATION_ENABLED='true';
 try{const r=res();await redeem({method:'POST',headers:origin,body:{matric_number:'BAD',activation_code:'123',password:'short'}},r);assert.equal(r.statusCode,400)}
 finally{if(old===undefined)delete process.env.LMS_ACTIVATION_ENABLED;else process.env.LMS_ACTIVATION_ENABLED=old}
});
