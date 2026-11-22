'use strict';
const {db,json}=require('../../lib/lms');
module.exports=async(req,res)=>{
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 try{
  const r=await db().query("SELECT (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('app_users','auth_sessions','student_activation_codes','student_activation_attempts'))::int AS tables");
  if(Number(r.rows[0]?.tables)!==4)return json(res,503,{ok:false,status:'schema_not_ready'});
  return json(res,200,{ok:true,status:'ready',activation_enabled:process.env.LMS_ACTIVATION_ENABLED==='true'});
 }catch(e){console.error('LMS health check failed',e.message);return json(res,503,{ok:false,status:'unavailable'});}
};
