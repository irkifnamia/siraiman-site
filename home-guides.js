document.addEventListener('DOMContentLoaded', () => {
 const content=window.SIR_AIMAN_CONTENT;
 document.querySelectorAll('.syllabus-inline').forEach(root=>{
  const subject=content?.subjects?.find(item=>item.id===root.dataset.subject);
  root.replaceChildren();
  if(!subject){root.textContent='Syllabus unavailable.';return;}
  // Show only source-verified syllabus entries; do not display stale placeholder notices.
  subject.chapters.forEach(ch=>{
   const details=document.createElement('details');details.className='syllabus-chapter';
   const summary=document.createElement('summary');summary.textContent=ch.title;details.append(summary);
   const ul=document.createElement('ul');ch.subchapters.forEach(sc=>{const li=document.createElement('li');li.textContent=sc.title;ul.append(li)});if(ch.subchapters.length)details.append(ul);else{const p=document.createElement('p');p.className='guide-note';p.textContent='Subchapter details are being verified against the source notes.';details.append(p)}root.append(details);
  });
 });
});