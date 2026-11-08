import {dealCards,stopElementMotion} from './interaction-motion.js';
import {artifactsForPlaces} from './artifacts.js';
import {artifactListHTML,artifactStackHTML} from './artifact-view.js';
import {reducedMotion,playEffect} from './effects.js';

/** A finite gallery. Browsing never changes GPS stamps or profile data. */
export function mountArtifactDeck({root,dialog,state,places,onOpen}){
 const abort=new AbortController(),options={signal:abort.signal};
 let disposed=false,busy=false,gesture=null,suppressUntil=0,frame=0;
 const animations=new Set();
 const find=selector=>root.querySelector(selector);
 const cards=()=>[...root.querySelectorAll('.artifact-swipe-card')];
 const filtered=()=>artifactsForPlaces(places).filter(a=>state.selected==='all'||a.placeId===state.selected);
 function pose(card,slot){
  const depth=Math.abs(slot),sign=Math.sign(slot),width=card.offsetWidth;
  const x=sign*width*(Math.min(depth,1)*.78+Math.max(0,depth-1)*.23);
  return {transform:`translate3d(${x}px,0,${-Math.min(depth,1)*125-Math.max(0,depth-1)*85}px) rotateY(${-sign*Math.min(depth,1)*46}deg)`,opacity:depth>2?Math.max(0,3-depth):1,zIndex:String(10-Math.round(depth*2))};
 }
 function layout(offset=0){
  for(const card of cards()){
   const slot=Number(card.dataset.deckLayer)-offset;
   Object.assign(card.style,pose(card,slot));
  }
 }
 function stop(){cancelAnimationFrame(frame);frame=0;for(const a of animations)a.cancel();animations.clear();for(const card of cards())stopElementMotion(card);}
 function render({focus=null,enter=false}={}){
  if(disposed)return;
  stop();state.setItems(filtered().map(a=>a.id));const list=state.view==='list';
  find('#artifact-site-filter').value=state.selected;
  find('#artifact-random').setAttribute('aria-pressed',String(state.random));
  find('#artifact-random').disabled=state.total<2;
  find('#artifact-shuffle').disabled=state.total<1;
  find('#artifact-view-toggle').textContent=list?'Chồng thẻ':'Danh sách';
  find('#artifact-deck-progress').textContent=list?`${state.total} thẻ`:`Thẻ ${state.total?Math.min(state.index+1,state.total):0} / ${state.total}`;
  find('#artifact-presentation').innerHTML=list?artifactListHTML(places,state.selected):artifactStackHTML(state,places);
  layout();if(focus)find(focus)?.focus({preventScroll:true});
  if(enter&&find('[data-deck-active]'))dealCards(root);
 }
 async function settle(offset,duration){
  cancelAnimationFrame(frame);frame=0;
  if(reducedMotion()){layout(offset);return;}
  const batch=cards().map(card=>{
   stopElementMotion(card);
   const from={transform:getComputedStyle(card).transform,opacity:getComputedStyle(card).opacity,zIndex:getComputedStyle(card).zIndex};
   const to=pose(card,Number(card.dataset.deckLayer)-offset);
   Object.assign(card.style,to);
   const a=card.animate([from,to],{duration,easing:'cubic-bezier(.22,.7,.18,1)'});
   animations.add(a);a.finished.then(()=>animations.delete(a),()=>animations.delete(a));return a.finished;
  });
  await Promise.all(batch);
 }
 async function move(step=1,keyboardFocus=false){
  if(disposed||busy||state.view!=='deck'||(step>0&&state.complete)||(step<0&&state.index===0))return;
  busy=true;
  try{
   await settle(step,620);
   if(disposed)return;
   if(step>0)state.next();else state.previous();
   playEffect('paper');render({focus:keyboardFocus?(state.complete?'#artifact-open':step>0?'#artifact-next':state.index?'#artifact-previous':'#artifact-open'):null});
  }catch{/* Closing or replacing the gallery cancels its entire transition. */}
  finally{busy=false;}
 }
 async function snap(){
  if(disposed)return;
  try{await settle(0,380);if(!disposed&&!gesture)layout();}catch{}
 }
 root.addEventListener('change',event=>{
  if(event.target.id!=='artifact-site-filter'||busy)return;
  state.selected=event.target.value;render({focus:'#artifact-site-filter'});
 },options);
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||busy)return;
  switch(button.id){
   case 'artifact-shuffle':state.shuffle();render({focus:'#artifact-shuffle',enter:true});playEffect('paper');break;
   case 'artifact-random':state.setRandom(!state.random);render({focus:'#artifact-random',enter:true});break;
   case 'artifact-view-toggle':state.view=state.view==='deck'?'list':'deck';render({focus:'#artifact-view-toggle'});break;
   case 'artifact-previous':void move(-1,true);break;
   case 'artifact-next':void move(1,true);break;
   case 'artifact-open':if(state.current)onOpen(state.current);else if(state.total){state.shuffle();render({enter:true});}break;
  }
 },options);
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-deck-active]')&&(busy||performance.now()<suppressUntil)){event.preventDefault();event.stopImmediatePropagation();}
 },{...options,capture:true});
 root.addEventListener('pointerdown',event=>{
  const card=event.target.closest('[data-deck-active]');
  if(!card||busy||!event.isPrimary||event.button!==0)return;
  stop();layout();
  gesture={id:event.pointerId,card,startX:event.clientX,startY:event.clientY,dx:0,dy:0,axis:null};
 },options);
 root.addEventListener('pointermove',event=>{
  if(!gesture||gesture.id!==event.pointerId)return;
  const g=gesture;g.dx=event.clientX-g.startX;g.dy=event.clientY-g.startY;
  if(!g.axis){
   if(Math.abs(g.dy)>10&&Math.abs(g.dy)>Math.abs(g.dx)*1.2)g.axis='vertical';
   else if(Math.abs(g.dx)>8&&Math.abs(g.dx)>Math.abs(g.dy)*1.2){g.axis='horizontal';g.card.setPointerCapture(event.pointerId);g.card.classList.add('is-dragging');}
  }
  if(g.axis!=='horizontal')return;
  if(event.cancelable)event.preventDefault();
  if(frame)return;
  frame=requestAnimationFrame(()=>{
   frame=0;if(!gesture)return;
   let offset=Math.max(-1,Math.min(1,-gesture.dx/(gesture.card.offsetWidth*.78)));
   if(state.index===0&&offset<0)offset*=.15;
   if(!reducedMotion())layout(offset);
  });
 },{...options,passive:false});
 function release(event,cancelled=false){
  if(!gesture||gesture.id!==event.pointerId)return;
  const g=gesture;gesture=null;cancelAnimationFrame(frame);frame=0;
  if(g.card.hasPointerCapture(event.pointerId))g.card.releasePointerCapture(event.pointerId);
  g.card.classList.remove('is-dragging');
  if(g.axis!=='horizontal'){if(g.axis==='vertical')suppressUntil=performance.now()+400;return;}
  suppressUntil=performance.now()+700;
  const threshold=Math.max(48,Math.min(85,g.card.offsetWidth*.24)),step=g.dx<0?1:-1;
  if(!cancelled&&Math.abs(g.dx)>=threshold&&Math.abs(g.dx)>Math.abs(g.dy)*1.2&&(step>0||state.index>0))void move(step);
  else void snap();
 }
 root.addEventListener('pointerup',event=>release(event),options);
 root.addEventListener('pointercancel',event=>release(event,true),options);
 root.addEventListener('lostpointercapture',event=>{if(gesture?.id===event.pointerId&&event.target===gesture.card)release(event,true);},options);
 dialog.addEventListener('keydown',event=>{
  if(disposed||state.view!=='deck'||event.target.closest('input,select,textarea')||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='ArrowRight'){event.preventDefault();void move(1,true);}
  if(event.key==='ArrowLeft'){event.preventDefault();void move(-1,true);}
 },options);
 const resize=new ResizeObserver(()=>{if(!disposed&&!busy&&!gesture)layout();});resize.observe(root);
 window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches){for(const a of animations)a.finish();}},options);
 render({enter:true});
 return {destroy(){disposed=true;gesture=null;stop();resize.disconnect();abort.abort();}};
}
