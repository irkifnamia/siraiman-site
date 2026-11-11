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
const list=$('chapter-list');subject.chapters.forEach(c=>{let details=n('details');details.className='chapter';let summary=n('summary',c.title),ul=n('ul');c.subchapters.forEach(s=>ul.append(n('li',s.title)));details.append(summary,ul);list.append(details)});
function render(){const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);const arr=D.resources.filter(r=>{if(r.subject!==id)return false;const c=ch(r.chapter),sc=subch(c,r.subchapter);const text=[r.title,r.description,r.type,c?.title,sc?.title,...(r.tags||[])].join(' ').toLowerCase();return(type.value==='all'||r.type===type.value)&&(chapter.value==='all'||r.chapter===chapter.value)&&(sub.value==='all'||r.subchapter===sub.value)&&terms.every(t=>text.includes(t))});results.replaceChildren();count.textContent=arr.length+' resources';$('empty').hidden=arr.length>0;arr.forEach(r=>{const card=n('article');card.className='result';const tag=n('div',({infographic:'Infographic',video:'Video',solution:'Worked example & solution'})[r.type]||r.type);tag.className='tag';card.append(tag,n('h3',r.title),n('p',r.description||''),n('p',(ch(r.chapter)?.title||'')+' · '+(subch(ch(r.chapter),r.subchapter)?.title||'')));const btn=n('button','View resource →');btn.onclick=()=>open(r);card.append(btn);results.append(card)})}
function open(r){const body=$('viewer-content');body.replaceChildren(n('h2',r.title),n('p',r.description||''));if(r.type==='solution'&&Array.isArray(r.steps)){r.steps.forEach(s=>{const box=n('div');box.className='step';box.append(n('strong',s.title),n('p',s.detail));body.append(box)})}else if(r.url){try{const u=new URL(r.url,location.href);if(['https:','http:'].includes(u.protocol)){const a=n('a','Open material ↗');a.className='btn';a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';body.append(a)}}catch(e){}}$('viewer').showModal()}
search.oninput=render;type.onchange=render;chapter.onchange=()=>{updateSub();render()};sub.onchange=render;
$('clear').onclick=()=>{search.value='';type.value='all';chapter.value='all';updateSub();render()};
$('close').onclick=()=>$('viewer').close();$('viewer').onclick=e=>{if(e.target===$('viewer'))e.target.close()};
render();
});