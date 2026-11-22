'use strict';
const $=id=>document.getElementById(id);
async function request(path,options={}){
 const r=await fetch('/api/lms/'+path,{credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},...options});
 let data={};try{data=await r.json()}catch{}
 if(!r.ok)throw new Error(data.error||'Request failed');
 return data;
}
async function showDashboard(user){
 $('login-panel').classList.add('hidden');$('dashboard').classList.remove('hidden');
 $('welcome').textContent='Welcome, '+(user.nickname||user.full_name||'Student');
 $('role-info').textContent=user.role==='teacher'?'Teacher dashboard':'Student dashboard · '+(user.matric_number||'');
 if(user.role==='teacher'){
  $('teacher-section').classList.remove('hidden');
  try{const data=await request('students');$('roster-summary').textContent=data.students.length+' students enrolled in Semester 2, 2026/2027';}
  catch{$('roster-summary').textContent='Roster unavailable';}
 }
}
async function refresh(){try{const d=await request('me');await showDashboard(d.user)}catch{$('dashboard').classList.add('hidden');$('login-panel').classList.remove('hidden')}}
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault();const btn=e.currentTarget.querySelector('button');btn.disabled=true;$('login-notice').textContent='Signing in…';
 try{await request('login',{method:'POST',body:JSON.stringify({matric_number:$('matric').value,password:$('password').value})});$('password').value='';$('login-notice').textContent='';await refresh();}
 catch(err){$('login-notice').textContent=err.message}
 finally{btn.disabled=false}
});
$('logout').addEventListener('click',async()=>{try{await request('logout',{method:'POST',body:'{}'})}finally{location.reload()}});
refresh();
