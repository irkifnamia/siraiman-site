document.addEventListener('DOMContentLoaded',()=>{
const data=window.SIR_AIMAN_CONTENT||{subjects:[],resources:[]};
const viewer=document.getElementById('home-viewer'),body=document.getElementById('home-viewer-content');
const make=(tag,txt)=>{const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;return e};
document.querySelectorAll('.materials-browser').forEach(root=>{
 const id=root.dataset.subject,subject=data.subjects.find(s=>s.id===id);if(!subject)return;
 const search=root.querySelector('[data-search]'),type=root.querySelector('[data-type]'),chapter=root.querySelector('[data-chapter]'),sub=root.querySelector('[data-subchapter]'),results=root.querySelector('[data-results]'),count=root.querySelector('[data-count]');
 const option=(v,t)=>{const o=make('option',t);o.value=v;return o};
 subject.chapters.forEach(c=>chapter.append(option(c.id,c.title)));
 function updateSub(){sub.replaceChildren(option('all','All subchapters'));subject.chapters.filter(c=>chapter.value==='all'||c.id===chapter.value).forEach(c=>c.subchapters.forEach(s=>sub.append(option(s.id,c.title+' · '+s.title))))}
 function label(r){if(r.type!=='infographic')return r.title;const m=r.subchapter.match(/-(\d+)-(\d+)$/),num=r.id.match(/infographic-(\d+)$/);return r.subject+' / '+(m?m[1]+'.'+m[2]:'?')+' / Infographic '+(num?num[1]:'1')}
 function open(r){body.replaceChildren(make('h2',label(r)));if(r.type==='infographic'){
 const tools=make('div');tools.className='image-tools';const viewport=make('div');viewport.className='image-viewport';viewport.tabIndex=0;const img=make('img');img.src=new URL(r.url,location.href).href;img.alt=label(r);img.className='infographic-image';img.onerror=()=>viewport.replaceChildren(make('p','Unable to load infographic.'));
 let zoom=1;const status=make('span','100%');status.className='zoom-status';function setZoom(v){zoom=Math.max(.5,Math.min(3,v));img.style.width=zoom*100+'%';status.textContent=Math.round(zoom*100)+'%'}
 function button(t,fn){const b=make('button',t);b.className='image-tool';b.onclick=fn;return b}
 tools.append(button('− Zoom out',()=>setZoom(Math.max(.5,zoom-.25))),status,button('+ Zoom in',()=>setZoom(Math.min(3,zoom+.25))),button('Reset',()=>setZoom(1)));
 const a=make('a','↓ Download');a.className='image-tool download-tool';a.href=img.src;a.download=label(r).replace(/[^a-z0-9_-]+/gi,'-')+'.png';tools.append(a);viewport.append(img);body.append(tools,viewport);
 }else if(r.type==='solution'&&Array.isArray(r.steps)){r.steps.forEach(s=>{const box=make('div');box.className='step';box.append(make('strong',s.title),make('p',s.detail));body.append(box)})}else if(r.url){const a=make('a','Open material ↗');a.className='btn';a.href=new URL(r.url,location.href).href;a.target='_blank';a.rel='noopener noreferrer';body.append(a)}viewer.showModal()}
 function render(){const terms=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);const arr=data.resources.filter(r=>{if(r.subject!==id)return false;const c=subject.chapters.find(c=>c.id===r.chapter),sc=c?.subchapters.find(s=>s.id===r.subchapter);const hay=[label(r),r.title,r.description,c?.title,sc?.title,...(r.tags||[])].join(' ').toLowerCase();return(type.value==='all'||type.value===r.type)&&(chapter.value==='all'||chapter.value===r.chapter)&&(sub.value==='all'||sub.value===r.subchapter)&&terms.every(t=>hay.includes(t))});count.textContent=arr.length+' resources';results.replaceChildren();if(!arr.length){results.append(make('p','No matching materials available yet.'));return}arr.forEach(r=>{const card=make('article');card.className='result';const tag=make('div',({infographic:'INFOGRAPHIC',video:'VIDEO',solution:'WORKED EXAMPLE & SOLUTION'})[r.type]||r.type);tag.className='tag';const title=make('h3',label(r));const btn=make('button','View resource →');btn.onclick=()=>open(r);card.append(tag,title,btn);results.append(card)})}
 search.oninput=render;type.onchange=render;chapter.onchange=()=>{updateSub();render()};sub.onchange=render;root.querySelector('[data-clear]').onclick=()=>{search.value='';type.value='all';chapter.value='all';updateSub();render()};updateSub();render();
});
document.getElementById('home-viewer-close').onclick=()=>viewer.close();viewer.onclick=e=>{if(e.target===viewer)viewer.close()};
});