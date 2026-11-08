import {icon,mark} from './icons.js';
import {reducedMotion} from './effects.js';
import {translateText} from './i18n.js';
const routes=[['explore','Khám phá','compass'],['map','Bản đồ','map'],['day','Chuyến đi','clock'],['pass','Bộ tem','passport'],['community','Góc kể','camera']];

export function initQuickNavigation(navigate){
 const brand=document.querySelector('.app-header .brand');
 const dialog=document.createElement('dialog');
 dialog.id='quick-navigation';dialog.setAttribute('aria-labelledby','quick-navigation-title');
 dialog.innerHTML=`<section class="quick-nav-sheet"><button type="button" class="quick-nav-close" aria-label="Đóng điều hướng nhanh">${icon('close')}</button><div class="quick-nav-brand" aria-hidden="true">${mark}</div><div class="quick-nav-wordmark" aria-hidden="true" data-no-translate>óc eo<span>TOWNWALK</span></div><h2 id="quick-navigation-title">Bạn muốn đi đâu?</h2><div class="quick-nav-grid">${routes.map(([id,label,symbol])=>`<button type="button" data-quick-route="${id}">${icon(symbol)}<span>${label}</span>${icon('arrowup')}</button>`).join('')}</div></section><div class="quick-nav-wave" aria-hidden="true"></div>`;
 document.body.append(dialog);
 brand.setAttribute('aria-haspopup','dialog');brand.setAttribute('aria-controls',dialog.id);brand.setAttribute('aria-expanded','false');brand.setAttribute('aria-label',translateText('Mở điều hướng nhanh'));
 let sequence=0,expectedTab=null,scrollLock=null;
 const animations=new Set(),wave=dialog.querySelector('.quick-nav-wave');
 function animate(element,frames,options={}){
  if(!element||reducedMotion())return null;
  const animation=element.animate(frames,{duration:380,easing:'cubic-bezier(.22,1,.36,1)',...options});
  animations.add(animation);
  // Retain filled animations until teardown so no invisible effect survives reopening.
  animation.finished.then(()=>{if(!['both','forwards'].includes(options.fill))animations.delete(animation);},()=>animations.delete(animation));
  return animation;
 }
 function lockScroll(){
  if(scrollLock)return;
  const body=document.body,properties=['position','top','left','right','width','overflow','padding-right'];
  const gap=innerWidth-document.documentElement.clientWidth,padding=parseFloat(getComputedStyle(body).paddingRight)||0;
  scrollLock={x:scrollX,y:scrollY,styles:properties.map(name=>[name,body.style.getPropertyValue(name),body.style.getPropertyPriority(name)])};
  document.documentElement.classList.add('quick-nav-scroll-locked');
  Object.assign(body.style,{position:'fixed',top:`-${scrollLock.y}px`,left:`-${scrollLock.x}px`,right:'0',width:'100%',overflow:'hidden',paddingRight:`${padding+gap}px`});
 }
 function unlockScroll(){
  if(!scrollLock)return;
  const saved=scrollLock;scrollLock=null;
  for(const [name,value,priority] of saved.styles){if(value)document.body.style.setProperty(name,value,priority);else document.body.style.removeProperty(name);}
  document.documentElement.classList.remove('quick-nav-scroll-locked');
  window.scrollTo({left:saved.x,top:saved.y,behavior:'instant'});
 }
 function cancelAnimations(){for(const animation of animations)animation.cancel();animations.clear();wave.removeAttribute('style');}
 function close(restore=true){
  sequence++;expectedTab=null;cancelAnimations();dialog.classList.remove('is-revealing');
  if(dialog.open)dialog.close();
  brand.classList.remove('quick-nav-origin-hidden');brand.setAttribute('aria-expanded','false');
  unlockScroll();if(restore)brand.focus({preventScroll:true});
 }
 function open(){
  if(dialog.open){close();return;}
  sequence++;cancelAnimations();expectedTab=null;
  // Measure the original before hiding it. Only its travelling replacement rotates.
  const from=brand.querySelector('.brand-mark').getBoundingClientRect();
  const current=document.body.dataset.tab;
  dialog.querySelectorAll('[data-quick-route]').forEach(button=>{if(button.dataset.quickRoute===current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  lockScroll();dialog.showModal();brand.setAttribute('aria-expanded','true');brand.classList.add('quick-nav-origin-hidden');
  const symbol=dialog.querySelector('.quick-nav-brand'),to=symbol.getBoundingClientRect();
  animate(symbol,[
   {transform:`translate(${from.x+from.width/2-to.x-to.width/2}px,${from.y+from.height/2-to.y-to.height/2}px) scale(${from.width/symbol.offsetWidth}) rotate(0deg)`},
   {offset:.76,transform:'translate(0,-4px) scale(1.06) rotate(28deg)'},
   {transform:'translate(0,0) scale(1) rotate(14deg)'}
  ],{duration:620,fill:'both'});
  animate(dialog.querySelector('.quick-nav-wordmark'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{delay:180,duration:300,fill:'backwards'});
  dialog.querySelectorAll('[data-quick-route]').forEach((button,i)=>animate(button,[{opacity:0,translate:'0 20px',scale:'.92'},{opacity:1,translate:'0 0',scale:'1'}],{delay:160+i*45,duration:380,fill:'backwards'}));
  dialog.querySelector(`[data-quick-route="${current}"]`)?.focus({preventScroll:true});
 }
 async function choose(button,event){
  if(!dialog.open)return;
  const ticket=++sequence;cancelAnimations();dialog.classList.remove('is-revealing');brand.classList.add('quick-nav-origin-hidden');expectedTab=button.dataset.quickRoute;
  const rect=button.getBoundingClientRect();
  const x=event?.detail?event.clientX:rect.x+rect.width/2,y=event?.detail?event.clientY:rect.y+rect.height/2;
  const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+2;
  wave.style.cssText=`width:${radius*2}px;height:${radius*2}px;left:${x-radius}px;top:${y-radius}px;background:${getComputedStyle(button).getPropertyValue('--nav-color')};`;
  // Restore the real offset before the router saves it, then lock the new page.
  // Route changes are immediate; a cancelled wave cannot apply a stale route later.
  unlockScroll();
  if(document.body.dataset.tab===expectedTab)window.scrollTo({top:0,behavior:'instant'});
  navigate(expectedTab);lockScroll();
  const expansion=animate(wave,[{opacity:1,transform:'scale(0)'},{opacity:1,transform:'scale(1)'}],{duration:440,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  if(expansion){try{await expansion.finished;}catch{return;}}
  if(ticket!==sequence||!dialog.open)return;
  const tab=expectedTab,view=document.querySelector(`.app-view[data-view="${tab}"]`);
  // Once covered, remove the menu and mist underneath. Fade the same coloured
  // surface away over the destination instead of abruptly closing a solid wave.
  dialog.classList.add('is-revealing');brand.classList.remove('quick-nav-origin-hidden');
  animate(view,[{opacity:.7,filter:'blur(3px)',translate:'0 6px'},{opacity:1,filter:'blur(0)',translate:'0 0'}],{duration:360});
  const reveal=animate(wave,[{opacity:1},{opacity:0}],{duration:360,fill:'forwards'});
  if(reveal){try{await reveal.finished;}catch{return;}}
  if(ticket!==sequence||!dialog.open)return;
  close(false);view?.querySelector('h1')?.focus({preventScroll:true});
 }
 brand.addEventListener('click',event=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();event.stopPropagation();open();});
 dialog.addEventListener('click',event=>{const button=event.target.closest('[data-quick-route]');if(button){void choose(button,event);return;}if(event.target===dialog||event.target.closest('.quick-nav-close'))close();});
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 window.addEventListener('popstate',()=>close(false));window.addEventListener('hashchange',()=>close(false));
 window.addEventListener('oceo-before-route-change',event=>{
  if(!dialog.open)return;
  if(expectedTab!==event.detail.tab)close(false);else unlockScroll();
 });
 window.addEventListener('oceo-route-change',event=>{if(dialog.open&&expectedTab!==event.detail.tab)close(false);else if(!dialog.open)cancelAnimations();});
 window.addEventListener('oceo-language-change',()=>brand.setAttribute('aria-label',translateText('Mở điều hướng nhanh')));
 window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches){const selected=expectedTab;cancelAnimations();if(selected){close(false);document.querySelector(`.app-view[data-view="${selected}"] h1`)?.focus({preventScroll:true});}}});
}
