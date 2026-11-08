/** Directional page chrome with hysteresis and one state change per transition. */
export function initScrollNavigation(){
 const header=document.querySelector('.app-header'),tabs=document.querySelector('.app-tabbar');
 if(!header||!tabs)return;
 const root=document.documentElement;
 let frame=0,timer=0,width=innerWidth,headerHeight=header.offsetHeight;
 let concealed=root.classList.contains('navigation-concealed'),changedAt=-Infinity;
 let peak=0,trough=0,height=innerHeight;
 const maxScroll=()=>Math.max(0,root.scrollHeight-innerHeight);
 const y=()=>Math.max(0,Math.min(scrollY,maxScroll()));
 const blocked=()=>!!document.querySelector('dialog[open]')||root.classList.contains('quick-nav-scroll-locked')||document.querySelector('#language-trigger')?.getAttribute('aria-expanded')==='true';
 function rebase(){peak=trough=y();height=innerHeight;}
 function setConcealed(next){
  if(concealed===next)return;
  concealed=next;changedAt=performance.now();
  root.classList.toggle('navigation-concealed',next);rebase();
 }
 function reset(){clearTimeout(timer);timer=0;setConcealed(false);rebase();}
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 function change(next){
  if(next===concealed)return;
  const remaining=180-(performance.now()-changedAt);
  if(remaining>0){
   if(!timer)timer=setTimeout(()=>{timer=0;schedule();},Math.ceil(remaining));
  }else{clearTimeout(timer);timer=0;setConcealed(next);}
 }
 function update(){
  frame=0;const current=y();
  if(blocked()||current<=8){reset();return;}
  // Browser toolbar/keyboard resizing is not a change of scroll direction.
  if(height!==innerHeight){rebase();return;}
  if(concealed){
   peak=Math.max(peak,current);
   if(peak-current>=20)change(false);
  }else{
   trough=Math.min(trough,current);
   if(current>headerHeight+20&&current-trough>=36)change(true);
  }
 }
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',()=>{
  if(innerWidth!==width){width=innerWidth;reset();}
  else{clearTimeout(timer);timer=0;rebase();}
 },{passive:true});
 new ResizeObserver(()=>{headerHeight=header.offsetHeight;}).observe(header);
 window.addEventListener('oceo-before-route-change',reset);
 window.addEventListener('oceo-route-change',reset);
 window.addEventListener('pageshow',reset);
 document.addEventListener('focusin',event=>{if(header.contains(event.target)||tabs.contains(event.target))reset();});
 new MutationObserver(records=>{
  if(records.some(record=>record.target.matches('dialog,#language-trigger')&&record.oldValue!==record.target.getAttribute(record.attributeName)))reset();
 }).observe(document.body,{subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['open','aria-expanded']});
 reset();
}
