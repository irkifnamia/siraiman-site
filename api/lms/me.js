'use strict';
const {getUser,json}=require('../../lib/lms');
module.exports=async(req,res)=>{
 if(req.method!=='GET') return json(res,405,{error:'Method not allowed'});
 try{const u=await getUser(req);if(!u)return json(res,401,{error:'Not signed in'});
 return json(res,200,{user:{role:u.role,matric_number:u.matric_number||null,full_name:u.full_name||null,nickname:u.nickname||null}});}
 catch(e){console.error('Profile failed',e.message);return json(res,503,{error:'Service temporarily unavailable'});}
};
