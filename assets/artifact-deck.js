import {artifactsForPlaces} from './artifacts.js';
import {artifactListHTML,artifactStackHTML} from './artifact-view.js';
import {reducedMotion,playEffect} from './effects.js';

/** Pointer gestures only affect this finite browsing deck, never GPS/profile data. */
export function mountArtifactDeck({root,dialog,state,places,onOpen}){
 const abort=new AbortController(),options={signal:abort.signal};
 let disposed=false,busy=false,gesture=null,animation=null,suppressUntil=0;
 const find=selector=>root.querySelector(selector);
 const filtered=()=>artifactsForPlaces(places).filter(a=>state.selected==='all'||a.placeId===state.selected);
 function sync(){state.setItems(filtered().map(a=>a.id));}
 function render({focus=null,enter=false}={}){
  if(disposed)return;
  sync();const list=state.view==='list';
  find('#artifact-site-filter').value=state.selected;
  find('#artifact-random').setAttribute('aria-pressed',String(state.random));
  find('#artifact-random').disabled=state.total<2;
  find('#artifact-shuffle').disabled=state.total<1;
  find('#artifact-view-toggle').textContent=list?'Chồng thẻ':'Danh sách';
  find('#artifact-deck-progress').textContent=list?`${state.total} thẻ`:`Thẻ ${state.total?Math.min(state.index+1,state.total):0} / ${state.total}`;
  find('#artifact-presentation').innerHTML=list?artifactListHTML(places,state.selected):artifactStackHTML(state,places);
  if(focus)find(focus)?.focus({preventScroll:true});
  const card=find('[data-deck-active]');
  if(enter&&card&&!reducedMotion())card.animate([{opacity:.65,transform:'translateY(5px) scale(.985)'},{opacity:1,transform:'translateY(0) rotate(-1deg) scale(1)'}],{duration:160,easing:'ease-out'});
 }
 async function next(direction=1,keyboardFocus=false){
  if(disposed||busy||state.complete||state.view!=='deck')return;
  busy=true;const card=find('[data-deck-active]');
  try{
   if(card&&!reducedMotion()){
    const distance=Math.max(360,root.clientWidth+70)*direction;
    animation=card.animate([{transform:card.style.transform||'rotate(-1deg)',opacity:1},{transform:`translate(${distance}px, 20px) rotate(${direction*15}deg)`,opacity:0}],{duration:190,easing:'cubic-bezier(.3,.05,.6,1)',fill:'forwards'});
    await animation.finished;
   }
   if(disposed)return;
   state.next();playEffect('paper');render({enter:true,focus:keyboardFocus?(state.complete?'#artifact-open':'#artifact-next'):null});
  }catch{/* A closing dialog cancels the in-flight discard. */}
  finally{busy=false;animation=null;}
 }
 function snap(card){
  if(!card||disposed)return;
  card.style.removeProperty('--swipe-strength');
  if(!reducedMotion())card.animate([{transform:card.style.transform||'rotate(-1deg)'},{transform:'rotate(-1deg)'}],{duration:160,easing:'ease-out'});
  card.style.removeProperty('transform');card.classList.remove('is-dragging');
 }
 root.addEventListener('change',event=>{
  if(event.target.id!=='artifact-site-filter'||busy)return;
  state.selected=event.target.value;sync();render({focus:'#artifact-site-filter'});
 },options);
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||busy)return;
  switch(button.id){
   case 'artifact-shuffle':state.shuffle();render({focus:'#artifact-shuffle',enter:true});playEffect('paper');break;
   case 'artifact-random':state.setRandom(!state.random);render({focus:'#artifact-random',enter:true});break;
   case 'artifact-view-toggle':state.view=state.view==='deck'?'list':'deck';render({focus:'#artifact-view-toggle'});break;
   case 'artifact-previous':state.previous();render({focus:state.index?'#artifact-previous':'#artifact-open',enter:true});break;
   case 'artifact-next':void next(1,true);break;
   case 'artifact-open':if(state.current)onOpen(state.current);else if(state.total){state.shuffle();render({enter:true});}break;
  }
 },options);
 root.addEventListener('click',event=>{
  if(event.target.closest('[data-deck-active]')&&(busy||performance.now()<suppressUntil)){
   event.preventDefault();event.stopImmediatePropagation();
  }
 },{...options,capture:true});
 root.addEventListener('pointerdown',event=>{
  const card=event.target.closest('[data-deck-active]');
  if(!card||busy||!event.isPrimary||event.button!==0)return;
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
  const angle=reducedMotion()?0:g.dx/g.card.offsetWidth*12;
  g.card.style.transform=`translate(${g.dx}px, ${g.dy*.15}px) rotate(${angle}deg)`;
  g.card.style.setProperty('--swipe-strength',String(Math.min(1,Math.abs(g.dx)/90)));
 },{...options,passive:false});
 function release(event,cancelled=false){
  if(!gesture||gesture.id!==event.pointerId)return;
  const g=gesture;gesture=null;
  if(g.card.hasPointerCapture(event.pointerId))g.card.releasePointerCapture(event.pointerId);
  if(g.axis!=='horizontal'){if(g.axis==='vertical')suppressUntil=performance.now()+400;return;}
  suppressUntil=performance.now()+400;
  const threshold=Math.max(48,Math.min(85,g.card.offsetWidth*.24));
  if(!cancelled&&Math.abs(g.dx)>=threshold&&Math.abs(g.dx)>Math.abs(g.dy)*1.2)void next(Math.sign(g.dx));
  else snap(g.card);
 }
 root.addEventListener('pointerup',event=>release(event),options);
 root.addEventListener('pointercancel',event=>release(event,true),options);
 // Touch first captures an inner icon implicitly. Moving capture to the card
 // loses that child capture without ending the swipe.
 root.addEventListener('lostpointercapture',event=>{if(gesture?.id===event.pointerId&&event.target===gesture.card)release(event,true);},options);
 dialog.addEventListener('keydown',event=>{
  if(disposed||state.view!=='deck'||event.target.closest('input,select,textarea')||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='ArrowRight'){event.preventDefault();void next(1,true);}
  if(event.key==='ArrowLeft'&&!busy){event.preventDefault();state.previous();render({enter:true,focus:'#artifact-open'});}
 },options);
 render();
 return {destroy(){disposed=true;gesture=null;animation?.cancel();abort.abort();}};
}
