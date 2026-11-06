import {getLanguage,setLanguage,translateText} from './i18n.js';

/** Native select fallback; an accessible, keyboard-operated listbox when enhanced. */
export function initHeader(){
 const picker=document.querySelector('#header-language');
 if(!picker)return;
 const select=picker.querySelector('select'),trigger=picker.querySelector('#language-trigger');
 const menu=picker.querySelector('#language-options'),options=[...menu.querySelectorAll('[data-language]')];
 const code={vi:'VN',en:'EN',zh:'中文'};
 function sync(){
  picker.querySelector('#language-code').textContent=code[getLanguage()];
  trigger.setAttribute('aria-label',`${translateText('Chọn ngôn ngữ')}: ${code[getLanguage()]}`);
  options.forEach(option=>option.setAttribute('aria-selected',String(option.dataset.language===getLanguage())));
 }
 function close(focus=false){menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus({preventScroll:true});}
 function open(index=options.findIndex(option=>option.dataset.language===getLanguage())){
  menu.hidden=false;trigger.setAttribute('aria-expanded','true');options[Math.max(0,index)].focus({preventScroll:true});
 }
 trigger.addEventListener('click',()=>menu.hidden?open():close(true));
 trigger.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open(event.key==='ArrowUp'?options.length-1:0);}
  else if(event.key==='Escape')close(true);
 });
 menu.addEventListener('click',event=>{
  const option=event.target.closest('[data-language]');if(!option)return;
  setLanguage(option.dataset.language);close(true);
 });
 menu.addEventListener('keydown',event=>{
  const index=options.indexOf(document.activeElement);let next;
  if(event.key==='ArrowDown')next=(index+1)%options.length;
  if(event.key==='ArrowUp')next=(index+options.length-1)%options.length;
  if(event.key==='Home')next=0;if(event.key==='End')next=options.length-1;
  if(next!==undefined){event.preventDefault();options[next].focus({preventScroll:true});}
  else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}
  else if(event.key==='Tab'){close();trigger.focus({preventScroll:true});}
 });
 document.addEventListener('pointerdown',event=>{if(!picker.contains(event.target))close();});
 picker.addEventListener('focusout',event=>{if(!picker.contains(event.relatedTarget))close();});
 document.addEventListener('click',event=>{if(event.target.closest('[data-route],[data-action]'))close();});
 window.addEventListener('oceo-language-change',sync);
 picker.classList.add('is-enhanced');select.tabIndex=-1;select.setAttribute('aria-hidden','true');trigger.hidden=false;sync();
}
