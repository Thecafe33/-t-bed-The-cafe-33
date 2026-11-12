import {icon} from './icons.js';
import {stopElementMotion} from './interaction-motion.js';
import {artifactsForPlaces} from './artifacts.js';
import {artifactListHTML,artifactStackHTML} from './artifact-view.js';
import {reducedMotion,playEffect} from './effects.js';
import {translateText} from './i18n.js';

/** Persistent cards, a continuous position and interruptible momentum. */
export function mountArtifactDeck({root,dialog,state,places}){
 const abort=new AbortController(),options={signal:abort.signal};
 let disposed=false,gesture=null,frame=0,wheelTimer=0,suppressUntil=0;
 let position=state.index,target=position,velocity=0,moving=false,pendingFocus=null;
 let entries=[],stack=null,stride=140;
 const find=s=>root.querySelector(s);
 const filtered=()=>artifactsForPlaces(places).filter(a=>state.selected==='all'||a.placeId===state.selected);
 const clamp=value=>Math.max(0,Math.min(Math.max(0,state.total-1),value));
 function paint(){
  if(!stack)return;
  stack.dataset.position=position.toFixed(4);
  for(const {element,index,width} of entries){
   const slot=index-position,depth=Math.abs(slot),sign=Math.sign(slot);
   const x=sign*width*(Math.min(depth,1)*.78+Math.max(0,depth-1)*.23);
   element.style.transform=`translate3d(${x}px,0,${-Math.min(depth,1)*125-Math.max(0,depth-1)*85}px) rotateY(${-sign*Math.min(depth,1)*46}deg)`;
   element.style.opacity=depth>2?String(Math.max(0,3-depth)):'1';
   element.style.zIndex=String(20-Math.round(depth*2));
  }
 }
 function stop(){
  cancelAnimationFrame(frame);frame=0;clearTimeout(wheelTimer);moving=false;pendingFocus=null;
  for(const {element} of entries)stopElementMotion(element);
 }
 function commit(index){
  const previous=state.index;state.index=clamp(Math.round(index));
  for(const {element,index:i} of entries){
   const active=i===state.index;
   element.dataset.deckLayer=String(i-state.index);
   element.inert=!active;element.tabIndex=active?0:-1;
   if(active){element.setAttribute('data-deck-active','');element.dataset.artifact=element.dataset.galleryId;element.removeAttribute('aria-hidden');}
   else{element.removeAttribute('data-deck-active');element.removeAttribute('data-artifact');element.setAttribute('aria-hidden','true');}
  }
  const status=find('#artifact-deck-progress');
  const label=state.view==='list'?`${state.total} thẻ`:`Thẻ ${state.total?state.index+1:0} / ${state.total}`;
  if(status.textContent!==translateText(label))status.textContent=translateText(label);
  if(previous!==state.index)playEffect('paper');
 }
 function measure(){
  for(const entry of entries)entry.width=entry.element.offsetWidth;
  stride=Math.max(100,(entries[0]?.width||280)*.48);
  paint();
 }
 function render({focus=null}={}){
  if(disposed)return;
  stop();gesture=null;state.setItems(filtered().map(a=>a.id));state.index=clamp(state.index);
  const list=state.view==='list';
  find('#artifact-site-filter').value=state.selected;
  find('#artifact-shuffle').disabled=state.total<2;
  const toggle=find('#artifact-view-toggle'),label=translateText(list?'Chồng thẻ':'Danh sách');
  toggle.innerHTML=icon(list?'cards':'list');
  toggle.setAttribute('aria-label',label);toggle.title=label;
  // Rebuild only when the collection/order or presentation changes, never on drag.
  find('#artifact-presentation').innerHTML=list?artifactListHTML(places,state.selected,state.order):artifactStackHTML(state,places);
  stack=find('.artifact-stack');
  entries=[...root.querySelectorAll('.artifact-swipe-card')].map(element=>({element,index:Number(element.dataset.galleryIndex),width:0}));
  position=target=state.index;velocity=0;measure();commit(state.index);
  if(focus)find(focus)?.focus({preventScroll:true});
 }
 function glide(destination,initialVelocity=0,focus=null){
  stop();target=clamp(Math.round(destination));velocity=initialVelocity;pendingFocus=focus;
  if(reducedMotion()||Math.abs(target-position)<.001){position=target;paint();commit(target);if(focus)find(focus)?.focus({preventScroll:true});return;}
  moving=true;let last=performance.now();
  function tick(now){
   if(disposed)return;
   const dt=Math.min(.032,(now-last)/1000);last=now;
   // A damped spring keeps velocity continuous, and can be grabbed at any frame.
   velocity+=(280*(target-position)-34*velocity)*dt;
   position+=velocity*dt;
   paint();
   if(Math.abs(position-target)<.002&&Math.abs(velocity)<.025){
    position=target;velocity=0;moving=false;frame=0;paint();commit(target);
    if(pendingFocus)find(pendingFocus)?.focus({preventScroll:true});pendingFocus=null;
   }else frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
 }
 function step(direction){
  if(state.view!=='deck'||!state.total)return;
  const next=clamp((moving?target:Math.round(position))+direction);
  glide(next,velocity,'[data-deck-active]');
 }
 root.addEventListener('change',event=>{
  if(event.target.id==='artifact-site-filter'){state.selected=event.target.value;render({focus:'#artifact-site-filter'});}
 },options);
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  switch(button.id){
   case 'artifact-shuffle':state.shuffle();render({focus:'#artifact-shuffle'});playEffect('paper');break;
   case 'artifact-view-toggle':state.view=state.view==='deck'?'list':'deck';render({focus:'#artifact-view-toggle'});break;
  }
 },options);
 root.addEventListener('click',event=>{
  if(event.target.closest('.artifact-stack')&&(moving||gesture||performance.now()<suppressUntil)){event.preventDefault();event.stopImmediatePropagation();}
 },{...options,capture:true});
 root.addEventListener('pointerdown',event=>{
  const surface=event.target.closest('.artifact-stack');
  if(!surface||!state.total||!event.isPrimary||event.button!==0)return;
  const wasMoving=moving;stop();
  if(wasMoving)suppressUntil=performance.now()+400;
  gesture={id:event.pointerId,surface,startX:event.clientX,startY:event.clientY,startPosition:position,startIndex:Math.round(position),dx:0,dy:0,axis:null,lastX:event.clientX,lastTime:event.timeStamp,velocity:0,desired:position};
 },options);
 root.addEventListener('pointermove',event=>{
  if(!gesture||gesture.id!==event.pointerId)return;
  const g=gesture;g.dx=event.clientX-g.startX;g.dy=event.clientY-g.startY;
  if(!g.axis){
   if(Math.abs(g.dy)>8&&Math.abs(g.dy)>Math.abs(g.dx)*1.2)g.axis='vertical';
   else if(Math.abs(g.dx)>6&&Math.abs(g.dx)>Math.abs(g.dy)*1.2){g.axis='horizontal';g.surface.setPointerCapture(event.pointerId);g.surface.classList.add('is-dragging');}
  }
  if(g.axis!=='horizontal')return;
  if(event.cancelable)event.preventDefault();
  const dt=event.timeStamp-g.lastTime;
  if(dt>0){const instantaneous=-(event.clientX-g.lastX)/stride/(dt/1000);g.velocity=g.velocity*.35+Math.max(-18,Math.min(18,instantaneous))*.65;}
  g.lastX=event.clientX;g.lastTime=event.timeStamp;
  const raw=g.startPosition-g.dx/stride;
  g.desired=raw<0?raw*.12:raw>state.total-1?state.total-1+(raw-state.total+1)*.12:raw;
  if(!frame)frame=requestAnimationFrame(()=>{frame=0;if(gesture){position=gesture.desired;paint();}});
 },{...options,passive:false});
 function release(event,cancelled=false){
  if(!gesture||gesture.id!==event.pointerId)return;
  const g=gesture;gesture=null;
  if(g.surface.hasPointerCapture(event.pointerId))g.surface.releasePointerCapture(event.pointerId);
  g.surface.classList.remove('is-dragging');
  if(g.axis!=='horizontal'){
   if(g.axis==='vertical'||Math.abs(position-Math.round(position))>.002){suppressUntil=performance.now()+250;glide(position);}
   return;
  }
  suppressUntil=performance.now()+300;
  position=g.desired;paint();
  const speed=event.timeStamp-g.lastTime>80||cancelled||reducedMotion()?0:g.velocity;
  glide(cancelled?g.startIndex:position+speed*.16,speed);
 }
 root.addEventListener('pointerup',event=>release(event),options);
 root.addEventListener('pointercancel',event=>release(event,true),options);
 root.addEventListener('lostpointercapture',event=>{if(gesture?.id===event.pointerId&&event.target===gesture.surface)release(event,true);},options);
 root.addEventListener('wheel',event=>{
  if(!event.target.closest('.artifact-stack')||!state.total||(!event.shiftKey&&Math.abs(event.deltaX)<=Math.abs(event.deltaY)))return;
  event.preventDefault();stop();suppressUntil=performance.now()+250;
  const unit=event.deltaMode===1?16:event.deltaMode===2?stack.clientWidth:1;
  position=clamp(position+(event.deltaX||event.deltaY)*unit/stride);paint();
  wheelTimer=setTimeout(()=>glide(position),80);
 },{...options,passive:false});
 dialog.addEventListener('keydown',event=>{
  if(state.view!=='deck'||event.target.closest('input,select,textarea')||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='ArrowRight'){event.preventDefault();step(1);}
  if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}
 },options);
 const resize=new ResizeObserver(()=>{if(!disposed)measure();});resize.observe(root);
 window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches&&moving)glide(target);},options);
 render();
 return {destroy(){state.index=clamp(Math.round(position));disposed=true;stop();gesture=null;resize.disconnect();abort.abort();}};
}
