'use strict';
const {db,getUser,json,sameOrigin}=require('../../lib/lms');
const {enabled,generateCode,codeHash}=require('../../lib/activation');
module.exports=async(req,res)=>{
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!sameOrigin(req))return json(res,403,{error:'Invalid origin'});
 if(!enabled())return json(res,503,{error:'Student activation is not enabled'});
 try{
  const teacher=await getUser(req);
  if(!teacher)return json(res,401,{error:'Sign in required'});
  if(teacher.role!=='teacher')return json(res,403,{error:'Teacher only'});
  const matric=typeof req.body?.matric_number==='string'?req.body.matric_number.trim().toUpperCase():'';
  if(!/^[A-Z0-9]{6,24}$/.test(matric))return json(res,400,{error:'Invalid matric number'});
  const client=await db().connect();
  try{
   await client.query('BEGIN');
   const student=await client.query('SELECT id FROM students WHERE upper(matric_number)=$1 FOR UPDATE',[matric]);
   if(!student.rows.length){await client.query('ROLLBACK');return json(res,404,{error:'Student not found'});}
   const id=student.rows[0].id;
   const existing=await client.query("SELECT id FROM app_users WHERE student_id=$1 AND status='active'",[id]);
   if(existing.rows.length){await client.query('ROLLBACK');return json(res,409,{error:'Account already active'});}
   await client.query('UPDATE student_activation_codes SET revoked_at=now() WHERE student_id=$1 AND used_at IS NULL AND revoked_at IS NULL',[id]);
   const code=generateCode();
   await client.query("INSERT INTO student_activation_codes(student_id,code_hash,created_by,expires_at) VALUES($1,$2,$3,now()+interval '48 hours')",[id,codeHash(code),teacher.id]);
   await client.query('COMMIT');
   return json(res,200,{matric_number:matric,activation_code:code,expires_in_hours:48,warning:'Shown once. Share privately with the intended student.'});
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }catch(e){console.error('Activation issue failed',e.message);return json(res,503,{error:'Service temporarily unavailable'});}
};
