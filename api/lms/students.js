'use strict';
const {db,getUser,json}=require('../../lib/lms');
module.exports=async(req,res)=>{
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 try{
  const user=await getUser(req);
  if(!user)return json(res,401,{error:'Not signed in'});
  if(user.role!=='teacher')return json(res,403,{error:'Teacher access required'});
  const result=await db().query(`SELECT s.matric_number,s.full_name,s.nickname,s.study_system,c.code AS class_code
   FROM students s JOIN enrollments e ON e.student_id=s.id JOIN classes c ON c.id=e.class_id
   JOIN semesters se ON se.id=e.semester_id JOIN academic_sessions a ON a.id=se.academic_session_id
   WHERE a.code='2026/2027' AND se.semester_number=2 ORDER BY c.code,s.full_name LIMIT 200`);
  return json(res,200,{students:result.rows});
 }catch(e){console.error('Roster failed',e.message);return json(res,503,{error:'Service temporarily unavailable'});}
};
