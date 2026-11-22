'use strict';
const {db,digest,cookies,json,sameOrigin,setCookie}=require('../../lib/lms');
module.exports=async(req,res)=>{
 if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
 if(!sameOrigin(req)) return json(res,403,{error:'Invalid request origin'});
 const token=cookies(req).lms_session;
 try{if(token&&/^[a-f0-9]{64}$/.test(token)) await db().query('UPDATE auth_sessions SET revoked_at=now() WHERE token_hash=$1',[digest(token)]);
 setCookie(res,'',0);return json(res,200,{ok:true});}
 catch(e){console.error('Logout failed',e.message);return json(res,503,{error:'Service temporarily unavailable'});}
};
