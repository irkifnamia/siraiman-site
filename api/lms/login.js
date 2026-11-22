'use strict';
const crypto=require('node:crypto');
const {db,digest,verifyPassword,json,sameOrigin,setCookie}=require('../../lib/lms');
module.exports=async(req,res)=>{
 if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
 if(!sameOrigin(req)) return json(res,403,{error:'Invalid request origin'});
 const identifier=typeof req.body?.matric_number==='string'?req.body.matric_number.trim():'';
 const matric=identifier.toUpperCase();
 const password=req.body?.password;
 if(!/^[A-Za-z0-9._-]{6,40}$/.test(identifier)||typeof password!=='string'||password.length>128) return json(res,400,{error:'Invalid credentials'});
 if(!process.env.AUTH_PEPPER) return json(res,503,{error:'Authentication is not configured'});
 const key=crypto.createHmac('sha256',process.env.AUTH_PEPPER).update(identifier.toLowerCase()).digest('hex');
 try{
  const p=db();
  const count=await p.query("SELECT count(*)::int AS n FROM auth_login_attempts WHERE identifier_hash=$1 AND attempted_at>now()-interval '15 minutes' AND succeeded=false",[key]);
  if(count.rows[0].n>=5) return json(res,429,{error:'Too many attempts. Try again later.'});
  const r=await p.query("SELECT u.id,u.password_hash,u.role FROM app_users u JOIN students s ON s.id=u.student_id WHERE upper(s.matric_number)=$1 AND u.status='active' LIMIT 1",[matric]);
  let user=r.rows[0];
  if(!user){
   // Support teacher login only when the teacher identifier migration is present.
   const col=await p.query("SELECT 1 FROM information_schema.columns WHERE table_name='app_users' AND column_name='login_identifier'");
   if(col.rowCount){const t=await p.query("SELECT id,password_hash,role FROM app_users WHERE lower(login_identifier)=$1 AND role='teacher' AND status='active' LIMIT 1",[identifier.toLowerCase()]);user=t.rows[0];}
  }
  const ok=user?.password_hash?verifyPassword(password,user.password_hash):false;
  await p.query("INSERT INTO auth_login_attempts(identifier_hash,succeeded) VALUES($1,$2)",[key,ok]);
  if(!ok) return json(res,401,{error:'Invalid credentials'});
  const token=crypto.randomBytes(32).toString('hex');
  await p.query("INSERT INTO auth_sessions(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '12 hours')",[user.id,digest(token)]);
  setCookie(res,token,43200);
  return json(res,200,{ok:true,role:user.role});
 }catch(e){console.error('Login failed',e.message);return json(res,503,{error:'Service temporarily unavailable'});}
};
