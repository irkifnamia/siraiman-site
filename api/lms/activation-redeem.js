'use strict';
const {db,hashPassword,json,sameOrigin}=require('../../lib/lms');
const {enabled,codeHash,identityHash,normalizedCode}=require('../../lib/activation');
module.exports=async(req,res)=>{
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!sameOrigin(req))return json(res,403,{error:'Invalid origin'});
 if(!enabled())return json(res,503,{error:'Student activation is not enabled'});
 const matric=typeof req.body?.matric_number==='string'?req.body.matric_number.trim().toUpperCase():'';
 const code=normalizedCode(req.body?.activation_code);
 const password=req.body?.password;
 if(!/^[A-Z0-9]{6,24}$/.test(matric)||!code||typeof password!=='string'||password.length<12||password.length>128)return json(res,400,{error:'Invalid activation details'});
 try{
  const key=identityHash(matric),p=db();
  const attempts=await p.query("SELECT count(*)::int AS n FROM student_activation_attempts WHERE identifier_hash=$1 AND attempted_at>now()-interval '15 minutes' AND succeeded=false",[key]);
  if(attempts.rows[0].n>=5)return json(res,429,{error:'Too many attempts. Try again later'});
  const client=await p.connect();
  try{
   await client.query('BEGIN');
   // Serialize issuance and redemption on the same student row, preventing reissue races.
   const student=await client.query('SELECT id FROM students WHERE upper(matric_number)=$1 FOR UPDATE',[matric]);
   const found=student.rows.length?await client.query(`SELECT id AS code_id,student_id FROM student_activation_codes
    WHERE student_id=$1 AND code_hash=$2 AND used_at IS NULL AND revoked_at IS NULL AND expires_at>now() FOR UPDATE`,[student.rows[0].id,codeHash(code)]):{rows:[]};
   if(!found.rows.length){
    await client.query('INSERT INTO student_activation_attempts(identifier_hash,succeeded) VALUES($1,false)',[key]);
    await client.query('COMMIT');
    return json(res,400,{error:'Invalid or expired activation details'});
   }
   const studentId=found.rows[0].student_id;
   const current=await client.query('SELECT id,status FROM app_users WHERE student_id=$1 FOR UPDATE',[studentId]);
   if(current.rows[0]?.status==='active'){await client.query('ROLLBACK');return json(res,409,{error:'Account already active'});}
   const hashed=hashPassword(password);
   if(current.rows.length){
    await client.query("UPDATE app_users SET password_hash=$1,status='active',activated_at=now(),password_changed_at=now() WHERE id=$2",[hashed,current.rows[0].id]);
   }else{
    await client.query("INSERT INTO app_users(student_id,role,password_hash,status,activated_at,password_changed_at) VALUES($1,'student',$2,'active',now(),now())",[studentId,hashed]);
   }
   await client.query('UPDATE student_activation_codes SET used_at=now() WHERE id=$1',[found.rows[0].code_id]);
   await client.query('UPDATE student_activation_codes SET revoked_at=now() WHERE student_id=$1 AND used_at IS NULL AND revoked_at IS NULL',[studentId]);
   await client.query('INSERT INTO student_activation_attempts(identifier_hash,succeeded) VALUES($1,true)',[key]);
   await client.query('COMMIT');
   return json(res,200,{ok:true,message:'Account activated. You can now sign in.'});
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }catch(e){console.error('Activation redemption failed',e.message);return json(res,503,{error:'Service temporarily unavailable'});}
};
