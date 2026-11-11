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

function resourceTitle(r){if(r.type!=='infographic')return r.title;const chapterNumber=(r.chapter||'').match(/-(\d+)$/)?.[1]||'?';const subNumber=(r.subchapter||'').match(/-(\d+)-(\d+)$/);const sc=subNumber?subNumber[1]+'.'+subNumber[2]:'?';const num=(r.id||'').match(/infographic-(\d+)$/)?.[1]||'1';return `${r.subject} / ${sc} / Infographic ${num}`}
function render(){
 const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const arr=D.resources.filter(r=>{if(r.subject!==id)return false;const c=ch(r.chapter),sc=subch(c,r.subchapter);const text=[resourceTitle(r),r.title,r.description,r.type,c?.title,sc?.title,...(r.tags||[])].join(' ').toLowerCase();return(type.value==='all'||r.type===type.value)&&(chapter.value==='all'||r.chapter===chapter.value)&&(sub.value==='all'||r.subchapter===sub.value)&&terms.every(t=>text.includes(t))});
 results.replaceChildren();count.textContent=arr.length+' resources';$('empty').hidden=arr.length>0;
 arr.forEach(r=>{
  const card=n('details');card.className='result resource-accordion';
  const summary=n('summary');const info=n('div');info.className='resource-summary-text';
  const tag=n('span',({infographic:'INFOGRAPHIC',video:'VIDEO',solution:'WORKED EXAMPLE & SOLUTION'})[r.type]||r.type);tag.className='tag';
  info.append(tag,n('h3',resourceTitle(r)));summary.append(info);card.append(summary);
  const panel=n('div');panel.className='resource-panel';
  card.addEventListener('toggle',()=>{if(card.open&&!panel.dataset.loaded){populate(panel,r);panel.dataset.loaded='true'}});
  card.append(panel);results.append(card);
 });
}
function populate(body,r){
 if(r.type==='infographic'){
  const u=resolveImage(r.url);
  if(!u){body.append(n('p','Infographic image unavailable.'));return}
  const tools=n('div');tools.className='image-tools';
  const viewport=n('div');viewport.className='image-viewport';viewport.tabIndex=0;viewport.setAttribute('aria-label','Scrollable infographic image');
  const img=n('img');img.src=u.href;img.alt=resourceTitle(r);img.className='infographic-image';img.draggable=false;
  img.onerror=()=>viewport.replaceChildren(n('p','Unable to load this infographic. Please check the image file.'));
  let zoom=1;const status=n('span','100%');status.className='zoom-status';status.setAttribute('aria-live','polite');
  const setZoom=next=>{zoom=Math.max(.5,Math.min(3,Math.round(next*10)/10));img.style.width=(zoom*100)+'%';status.textContent=Math.round(zoom*100)+'%'};
  const control=(label,action)=>{const b=n('button',label);b.type='button';b.className='image-tool';b.onclick=action;return b};
  tools.append(control('− Zoom out',()=>setZoom(zoom-.25)),status,control('+ Zoom in',()=>setZoom(zoom+.25)),control('Reset',()=>{setZoom(1);viewport.scrollTo({top:0,left:0})}));
  const download=n('a','↓ Download');download.className='image-tool download-tool';download.href=u.href;download.download=resourceTitle(r).replace(/[^a-z0-9_-]+/gi,'-')+'.'+(u.pathname.split('.').pop().match(/^(png|jpe?g|webp|gif)$/i)?.[0]||'png');download.rel='noopener';tools.append(download);
  viewport.append(img);body.append(tools,viewport);
 }else if(r.type==='solution'&&Array.isArray(r.steps)){
  r.steps.forEach(s=>{const box=n('div');box.className='step';box.append(n('strong',s.title),n('p',s.detail));body.append(box)});
 }else if(r.url){
  try{const u=new URL(r.url,location.href);if(['https:','http:'].includes(u.protocol)){const a=n('a','Open material ↗');a.className='btn';a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';body.append(a)}}catch(e){}
 }else{body.append(n('p',r.description||'Material not yet available.'))}
}
function resolveImage(url){if(!url)return null;try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)?u:null}catch(e){return null}}

search.oninput=render;type.onchange=render;chapter.onchange=()=>{updateSub();render()};sub.onchange=render;
$('clear').onclick=()=>{search.value='';type.value='all';chapter.value='all';updateSub();render()};

render();
});