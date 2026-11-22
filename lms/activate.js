'use strict';const $=id=>document.getElementById(id);
$('activate-form').addEventListener('submit',async e=>{
 e.preventDefault();const btn=e.currentTarget.querySelector('button');const notice=$('notice');
 if($('password').value!==$('confirm').value){notice.textContent='Passwords do not match';return}
 btn.disabled=true;notice.textContent='Checking activation details…';
 try{const r=await fetch('/api/lms/activation-redeem',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({matric_number:$('matric').value,activation_code:$('code').value,password:$('password').value})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Activation failed');$('activate-form').reset();notice.textContent='Account activated. Return to the LMS sign-in page.';}
 catch(err){notice.textContent=err.message}finally{btn.disabled=false}
});
