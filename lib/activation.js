'use strict';
const crypto=require('node:crypto');
function enabled(){return process.env.LMS_ACTIVATION_ENABLED==='true';}
function generateCode(){return crypto.randomBytes(18).toString('hex').toUpperCase();}
function codeHash(code){if(!process.env.AUTH_PEPPER)throw new Error('AUTH_PEPPER missing');return crypto.createHmac('sha256',process.env.AUTH_PEPPER).update('activation:'+code).digest('hex');}
function identityHash(matric){if(!process.env.AUTH_PEPPER)throw new Error('AUTH_PEPPER missing');return crypto.createHmac('sha256',process.env.AUTH_PEPPER).update('activation-attempt:'+matric).digest('hex');}
function normalizedCode(value){if(typeof value!=='string')return null;const v=value.replace(/[-\s]/g,'').toUpperCase();return /^[A-F0-9]{36}$/.test(v)?v:null;}
module.exports={enabled,generateCode,codeHash,identityHash,normalizedCode};
