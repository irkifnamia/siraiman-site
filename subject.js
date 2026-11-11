document.addEventListener('DOMContentLoaded',()=>{
const D=window.SIR_AIMAN_CONTENT||{subjects:[],resources:[]};const id=document.body.dataset.subject;
const subject=D.subjects.find(s=>s.id===id);if(!subject)return;
const $=x=>document.getElementById(x);const n=(tag,text)=>{let e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
const chapter=$('chapter'),sub=$('subchapter'),type=$('type'),search=$('search'),results=$('results'),count=$('count');
function option(value,label){let o=n('option',label);o.value=value;return o}
function ch(id){return subject.chapters.find(c=>c.id===id)}
function subch(c,id){return c?.subchapters.find(s=>s.id===id)}
function updateSub(){const prev=sub.value;sub.replaceChildren(option('all','All subchapters'));subject.chapters.filter(c=>chapter.value==='all'||chapter.value===c.id).forEach(c=>c.subchapters.forEach(s=>sub.append(option(s.id,c.title+' · '+s.title))));sub.value=Array.from(sub.options).some(o=>o.value===prev)?prev:'all'}
subject.chapters.forEach(c=>chapter.append(option(c.id,c.title)));updateSub();

function resourceTitle(r){if(r.type!=='infographic')return r.title;const chapterNumber=(r.chapter||'').match(/-(\d+)$/)?.[1]||'?';const subNumber=(r.subchapter||'').match(/-(\d+)-(\d+)$/);const sc=subNumber?subNumber[1]+'.'+subNumber[2]:'?';const num=(r.id||'').match(/infographic-(\d+)$/)?.[1]||'1';return `${r.subject} // C ${Number(chapterNumber)} // SC ${sc} // Infographic ${num}`}
function render(){const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);const arr=D.resources.filter(r=>{if(r.subject!==id)return false;const c=ch(r.chapter),sc=subch(c,r.subchapter);const text=[r.title,r.description,r.type,c?.title,sc?.title,...(r.tags||[])].join(' ').toLowerCase();return(type.value==='all'||r.type===type.value)&&(chapter.value==='all'||r.chapter===chapter.value)&&(sub.value==='all'||r.subchapter===sub.value)&&terms.every(t=>text.includes(t))});results.replaceChildren();count.textContent=arr.length+' resources';$('empty').hidden=arr.length>0;arr.forEach(r=>{const card=n('article');card.className='result';const tag=n('div',({infographic:'Infographic',video:'Video',solution:'Worked example & solution'})[r.type]||r.type);tag.className='tag';card.append(tag,n('h3',resourceTitle(r)));if(r.type!=='infographic')card.append(n('p',r.description||''),n('p',(ch(r.chapter)?.title||'')+' · '+(subch(ch(r.chapter),r.subchapter)?.title||'')));const btn=n('button','View resource →');btn.onclick=()=>open(r);card.append(btn);results.append(card)})}
function open(r){
 const body=$('viewer-content');body.replaceChildren(n('h2',resourceTitle(r)));if(r.type!=='infographic'&&r.description)body.append(n('p',r.description));
 if(r.type==='infographic'){
  const u=resolveImage(r.url);
  if(!u){body.append(n('p','Infographic image unavailable.'));$('viewer').showModal();return;}
  const tools=n('div');tools.className='image-tools';
  const viewport=n('div');viewport.className='image-viewport';viewport.tabIndex=0;viewport.setAttribute('aria-label','Scrollable infographic image');
  const img=n('img');img.src=u.href;img.alt=r.title;img.className='infographic-image';img.draggable=false;
  img.onerror=()=>{viewport.replaceChildren(n('p','Unable to load this infographic. Please check the image file.'))};
  let zoom=1;
  const status=n('span','100%');status.className='zoom-status';status.setAttribute('aria-live','polite');
  const setZoom=(next)=>{zoom=Math.max(.5,Math.min(3,Math.round(next*10)/10));img.style.width=(zoom*100)+'%';status.textContent=Math.round(zoom*100)+'%'};
  const control=(label,action)=>{const b=n('button',label);b.type='button';b.className='image-tool';b.onclick=action;return b};
  tools.append(control('− Zoom out',()=>setZoom(zoom-.25)),status,control('+ Zoom in',()=>setZoom(zoom+.25)),control('Reset',()=>{setZoom(1);viewport.scrollTo({top:0,left:0})}));
  const download=n('a','↓ Download');download.className='image-tool download-tool';download.href=u.href;download.download=(r.title||'infographic').replace(/[^a-z0-9_-]+/gi,'-')+'.'+(u.pathname.split('.').pop().match(/^(png|jpe?g|webp|gif)$/i)?.[0]||'png');download.rel='noopener';tools.append(download);
  viewport.append(img);body.append(tools,viewport);
 }else if(r.type==='solution'&&Array.isArray(r.steps)){
  r.steps.forEach(s=>{const box=n('div');box.className='step';box.append(n('strong',s.title),n('p',s.detail));body.append(box)});
 }else if(r.url){
  try{const u=new URL(r.url,location.href);if(['https:','http:'].includes(u.protocol)){const a=n('a','Open material ↗');a.className='btn';a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';body.append(a)}}catch(e){}
 }
 $('viewer').showModal();
}
function resolveImage(url){if(!url)return null;try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?u:null}catch(e){return null}}

search.oninput=render;type.onchange=render;chapter.onchange=()=>{updateSub();render()};sub.onchange=render;
$('clear').onclick=()=>{search.value='';type.value='all';chapter.value='all';updateSub();render()};
$('close').onclick=()=>$('viewer').close();$('viewer').onclick=e=>{if(e.target===$('viewer'))e.target.close()};
render();
});