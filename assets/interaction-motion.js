import {reducedMotion} from './effects.js';
const running=new Set(),byElement=new WeakMap(),decorations=new Set();
export function clearInteractionMotion(){
 for(const animation of running)animation.cancel();running.clear();
 for(const element of decorations)element.remove();decorations.clear();
}
export function stopElementMotion(element){byElement.get(element)?.cancel();}
export function motion(element,frames,{duration=360,delay=0}={}){
 if(!element||!element.isConnected||reducedMotion())return null;
 byElement.get(element)?.cancel();
 const animation=element.animate(frames,{duration,delay,easing:'cubic-bezier(.22,1,.36,1)'});
 running.add(animation);byElement.set(element,animation);
 animation.finished.catch(()=>{}).finally(()=>{running.delete(animation);if(byElement.get(element)===animation)byElement.delete(element);});
 return animation;
}
export function revealArtifact(element,reverse=false){
 motion(element,[{opacity:.15,transform:`perspective(1000px) rotateY(${reverse?55:-55}deg) scale(.97)`},{opacity:1,transform:'perspective(1000px) rotateY(0deg) scale(1)'}],{duration:430});
}
export function dealCards(root){
 [...root.querySelectorAll('.artifact-swipe-card')].reverse().forEach((card,i)=>{
  motion(card,[{opacity:0,transform:`translateY(22px) rotate(${8-i*5}deg) scale(.94)`},{opacity:1,transform:getComputedStyle(card).transform}],{duration:360,delay:i*45});
 });
}
export function revealAnswer(element){motion(element,[{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:260});}
/** Called only after a newly earned, GPS-validated stamp has been saved. */
export function celebrateStamp(stamp){
 if(!stamp)return;
 stamp.scrollIntoView({block:'center',behavior:'instant'});
 if(reducedMotion())return;
 motion(stamp,[{opacity:0,transform:'scale(1.38) rotate(-14deg)'},{opacity:1,transform:'scale(.94) rotate(2deg)',offset:.65},{opacity:1,transform:'scale(1) rotate(0deg)'}],{duration:650});
 const parent=stamp.parentElement,box=stamp.getBoundingClientRect(),bounds=parent.getBoundingClientRect();
 for(let i=0;i<8;i++){
  const dot=document.createElement('span');dot.className='stamp-spark';dot.setAttribute('aria-hidden','true');dot.textContent=i%2?'✦':'·';
  dot.style.left=`${box.left-bounds.left+box.width/2}px`;dot.style.top=`${box.top-bounds.top+box.height/2}px`;parent.append(dot);decorations.add(dot);
  const angle=i*Math.PI/4,dx=Math.cos(angle)*box.width*.65,dy=Math.sin(angle)*box.height*.6;
  const animation=motion(dot,[{opacity:0,transform:'translate(-50%,-50%) scale(.4)'},{opacity:1,offset:.2,transform:`translate(calc(-50% + ${dx*.45}px),calc(-50% + ${dy*.45}px)) scale(1)`},{opacity:0,transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.6)`}],{duration:650,delay:240});
  if(animation)animation.finished.catch(()=>{}).finally(()=>{dot.remove();decorations.delete(dot);});else{dot.remove();decorations.delete(dot);}
 }
}
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches)clearInteractionMotion();});

document.addEventListener("toggle",event=>{
 const details=event.target;if(!details.matches?.("details.artifact-challenge")||!details.open)return;
 [...details.children].filter(child=>child.tagName!=="SUMMARY").forEach((child,i)=>motion(child,[{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}],{duration:260,delay:i*25}));
},true);
