import {icon,mark} from './icons.js';
import {reducedMotion} from './effects.js';
import {translateText} from './i18n.js';
const routes=[['explore','Khám phá','compass'],['map','Bản đồ','map'],['day','Chuyến đi','clock'],['pass','Bộ tem','passport'],['community','Góc kể','camera']];
export function initQuickNavigation(navigate){
 const brand=document.querySelector('.app-header .brand');
 const dialog=document.createElement('dialog');dialog.id='quick-navigation';dialog.setAttribute('aria-labelledby','quick-navigation-title');
 dialog.innerHTML=`<section class="quick-nav-sheet"><button type="button" class="quick-nav-close" aria-label="Đóng điều hướng nhanh">${icon('close')}</button><div class="quick-nav-brand" aria-hidden="true">${mark}</div><div class="quick-nav-wordmark" aria-hidden="true" data-no-translate>óc eo<span>TOWNWALK</span></div><h2 id="quick-navigation-title">Bạn muốn đi đâu?</h2><div class="quick-nav-grid">${routes.map(([id,label,symbol])=>`<button type="button" data-quick-route="${id}">${icon(symbol)}<span>${label}</span>${icon('arrowup')}</button>`).join('')}</div></section><div class="quick-nav-wave" aria-hidden="true"></div>`;
 document.body.append(dialog);
 brand.setAttribute('aria-haspopup','dialog');brand.setAttribute('aria-controls',dialog.id);brand.setAttribute('aria-expanded','false');brand.setAttribute('aria-label',translateText('Mở điều hướng nhanh'));
 let sequence=0,expectedTab=null;const animations=new Set();const wave=dialog.querySelector('.quick-nav-wave');
 function animate(element,frames,options){
  if(reducedMotion())return null;
  const animation=element.animate(frames,{duration:380,easing:'cubic-bezier(.22,1,.36,1)',...options});animations.add(animation);
  animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));return animation;
 }
 function cancelAnimations(){for(const animation of animations)animation.cancel();animations.clear();wave.removeAttribute('style');}
 function close(restore=true){sequence++;expectedTab=null;cancelAnimations();if(dialog.open)dialog.close();brand.setAttribute('aria-expanded','false');if(restore)brand.focus({preventScroll:true});}
 function open(){
  if(dialog.open){close();return;}
  sequence++;cancelAnimations();expectedTab=null;
  const current=document.body.dataset.tab;
  dialog.querySelectorAll('[data-quick-route]').forEach(button=>{if(button.dataset.quickRoute===current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  dialog.showModal();brand.setAttribute('aria-expanded','true');
  const symbol=dialog.querySelector('.quick-nav-brand'),from=brand.querySelector('.brand-mark').getBoundingClientRect(),to=symbol.getBoundingClientRect();
  animate(brand.querySelector('.brand-mark'),[{transform:'rotate(0deg)'},{transform:'rotate(24deg)'},{transform:'rotate(0deg)'}],{duration:420});
  animate(symbol,[{opacity:.35,transform:`translate(${from.x+from.width/2-to.x-to.width/2}px,${from.y+from.height/2-to.y-to.height/2}px) scale(.4) rotate(-24deg)`},{opacity:1,transform:'translate(0,0) scale(1) rotate(0deg)'}],{duration:480});
  dialog.querySelectorAll('[data-quick-route]').forEach((button,i)=>animate(button,[{opacity:0,transform:'translateY(16px) scale(.96)'},{opacity:1,transform:'translateY(0) scale(1)'}],{delay:90+i*35,duration:300,fill:'backwards'}));
  dialog.querySelector(`[data-quick-route="${current}"]`)?.focus({preventScroll:true});
 }
 async function choose(button){
  if(!dialog.open)return;
  const ticket=++sequence;cancelAnimations();expectedTab=button.dataset.quickRoute;
  const rect=button.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
  const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  wave.style.cssText=`width:${radius*2}px;height:${radius*2}px;left:${x-radius}px;top:${y-radius}px;background:${getComputedStyle(button).backgroundColor};`;
  // Update the route immediately. No delayed callback may overwrite a newer choice.
  navigate(expectedTab);
  const animation=animate(wave,[{opacity:0,transform:'scale(0)'},{opacity:1,transform:'scale(1)'}],{duration:340,fill:'forwards'});
  if(animation){try{await animation.finished;}catch{return;}}
  if(ticket!==sequence||!dialog.open)return;
  const tab=expectedTab;close(false);
  const view=document.querySelector(`.app-view[data-view="${tab}"]`);
  view?.querySelector('h1')?.focus({preventScroll:true});
  animate(view,[{opacity:.55,filter:'blur(5px)',transform:'translateY(5px)'},{opacity:1,filter:'blur(0px)',transform:'translateY(0)'}],{duration:280});
 }
 brand.addEventListener('click',event=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();event.stopPropagation();open();});
 dialog.addEventListener('click',event=>{const button=event.target.closest('[data-quick-route]');if(button){void choose(button);return;}if(event.target===dialog||event.target.closest('.quick-nav-close'))close();});
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 window.addEventListener('popstate',()=>close(false));window.addEventListener('hashchange',()=>close(false));
 window.addEventListener('oceo-route-change',event=>{if(dialog.open&&expectedTab!==event.detail.tab)close(false);else if(!dialog.open)cancelAnimations();});
 window.addEventListener('oceo-language-change',()=>brand.setAttribute('aria-label',translateText('Mở điều hướng nhanh')));
 window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches){const selected=expectedTab;cancelAnimations();if(selected)close(false);}});
}
