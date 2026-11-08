/** Hide the page chrome on downward reading; reveal promptly on reversal. */
export function initScrollNavigation(){
 const header=document.querySelector('.app-header'),tabs=document.querySelector('.app-tabbar');
 if(!header||!tabs)return;
 const root=document.documentElement;
 let last=0,distance=0,direction=0,frame=0,width=innerWidth,headerHeight=header.offsetHeight;
 const y=()=>Math.max(0,Math.min(scrollY,Math.max(0,root.scrollHeight-innerHeight)));
 const blocked=()=>!!document.querySelector('dialog[open]')||root.classList.contains('quick-nav-scroll-locked')||document.querySelector('#language-trigger')?.getAttribute('aria-expanded')==='true';
 function show(){root.classList.remove('navigation-concealed');}
 function reset(){show();last=y();distance=0;direction=0;}
 function update(){
  frame=0;const current=y(),delta=current-last;last=current;
  if(blocked()||current<=headerHeight+12){reset();return;}
  if(Math.abs(delta)<1)return;
  const nextDirection=Math.sign(delta);
  if(nextDirection!==direction){direction=nextDirection;distance=0;}
  distance+=Math.abs(delta);
  if(direction>0&&distance>=24)root.classList.add('navigation-concealed');
  else if(direction<0&&distance>=8)show();
 }
 window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
 window.addEventListener('resize',()=>{if(innerWidth!==width){width=innerWidth;reset();}},{passive:true});
 new ResizeObserver(()=>{headerHeight=header.offsetHeight;}).observe(header);
 window.addEventListener('oceo-before-route-change',reset);
 window.addEventListener('oceo-route-change',reset);
 window.addEventListener('pageshow',reset);
 document.addEventListener('focusin',event=>{if(header.contains(event.target)||tabs.contains(event.target))reset();});
 // Scroll locking temporarily changes window.scrollY. Rebase on both opening
 // and closing, so a restored page offset is not mistaken for a downward swipe.
 new MutationObserver(records=>{
  if(records.some(record=>record.target.matches('dialog,#language-trigger')))reset();
 }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','aria-expanded']});
 reset();
}
