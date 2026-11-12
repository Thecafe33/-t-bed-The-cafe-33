// The collecting desk: earned stamps overlap like a fresh pile and can be dragged by finger,
// mouse or arrow keys. Arrangement stays on this device and also shapes the "letter" export.
import {stampSVG,ghostStampSVG,deskLayout} from './stamp-art.js';

const KEY='oceo-stamp-desk-v1';
export function readDesk(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}}
function writeDesk(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch{/* Arrangement is a convenience only. */}}
export function clearDesk(){try{localStorage.removeItem(KEY);}catch{/* ignore */}}

export function mountStampDesk(desk,{earned,collection,locale='vi',date='',label=n=>n,reduced=false}){
 if(!earned.length){desk.hidden=true;return;}
 desk.hidden=false;
 let saved=readDesk(),layout=deskLayout(earned,saved),top=layout.items.length;
 desk.innerHTML=layout.items.map(i=>`<button type="button" class="desk-stamp" data-place="${i.place.id}" data-desk-id="${i.place.id}" aria-label="${label(i.place.name)}">${stampSVG(i.place,{collection,locale,mark:true,date,localImages:true,id:`desk-${i.place.id}`})}</button>`).join('');
 const nodes=new Map([...desk.querySelectorAll('.desk-stamp')].map(n=>[n.dataset.deskId,n]));
 const place=()=>{
  const u=desk.clientWidth||340;desk.style.height=`${layout.height*u}px`;
  for(const i of layout.items){const n=nodes.get(i.place.id);n.style.width=`${i.w*u}px`;n.style.left=`${i.x*u}px`;n.style.top=`${i.y*u}px`;n.style.setProperty('--r',`${i.r}deg`);n.style.zIndex=i.z;}
 };
 const persist=()=>{saved={};for(const i of layout.items)saved[i.place.id]={x:+i.x.toFixed(4),y:+i.y.toFixed(4),r:i.r,z:i.z};writeDesk(saved);};
 const item=id=>layout.items.find(i=>i.place.id===id);
 const raise=(i,n)=>{i.z=++top;n.style.zIndex=i.z;};
 place();
 new ResizeObserver(place).observe(desk);
 let drag=null,suppress=false;
 desk.addEventListener('pointerdown',ev=>{
  const n=ev.target.closest('.desk-stamp');if(!n||ev.button>0)return;
  const i=item(n.dataset.deskId),u=desk.clientWidth;
  drag={n,i,u,id:ev.pointerId,sx:ev.clientX,sy:ev.clientY,ox:i.x,oy:i.y,moved:false};
  n.setPointerCapture(ev.pointerId);
 });
 desk.addEventListener('pointermove',ev=>{
  if(!drag||ev.pointerId!==drag.id)return;
  const dx=ev.clientX-drag.sx,dy=ev.clientY-drag.sy;
  if(!drag.moved){if(Math.hypot(dx,dy)<7)return;drag.moved=true;raise(drag.i,drag.n);drag.n.classList.add('lifted');}
  ev.preventDefault();
  const i=drag.i;i.x=Math.min(1-i.w+.04,Math.max(-.04,drag.ox+dx/drag.u));i.y=Math.min(layout.height-i.h,Math.max(-.02,drag.oy+dy/drag.u));
  drag.n.style.left=`${i.x*drag.u}px`;drag.n.style.top=`${i.y*drag.u}px`;
 });
 const end=ev=>{
  if(!drag||ev.pointerId!==drag.id)return;
  if(drag.moved){suppress=true;drag.n.classList.remove('lifted');drag.i.r=Math.max(-12,Math.min(12,drag.i.r+Math.round((Math.random()-.5)*6)));drag.n.style.setProperty('--r',`${drag.i.r}deg`);persist();setTimeout(()=>{suppress=false;},350);}
  drag=null;
 };
 desk.addEventListener('pointerup',end);desk.addEventListener('pointercancel',end);
 // A drag ends with a click on the same button; it must not open the place.
 desk.addEventListener('click',ev=>{if(suppress){ev.stopPropagation();ev.preventDefault();suppress=false;}},true);
 desk.addEventListener('keydown',ev=>{
  const n=ev.target.closest('.desk-stamp'),d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[ev.key];
  if(!n||!d)return;ev.preventDefault();
  const i=item(n.dataset.deskId),u=desk.clientWidth;raise(i,n);
  i.x=Math.min(1-i.w+.04,Math.max(-.04,i.x+d[0]*.04));i.y=Math.min(layout.height-i.h,Math.max(-.02,i.y+d[1]*.04));
  n.style.left=`${i.x*u}px`;n.style.top=`${i.y*u}px`;persist();
 });
 return {reset(){clearDesk();saved={};layout=deskLayout(earned,{});top=layout.items.length;
  if(!reduced)desk.classList.add('settling');place();setTimeout(()=>desk.classList.remove('settling'),450);}};
}
export function ghostRow(places){return places.map(p=>`<li>${ghostStampSVG(p,{width:92})}</li>`).join('');}
