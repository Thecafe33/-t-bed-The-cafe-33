import {narrationFor} from './narration-scripts.js';
import {NARRATION_SOURCES} from './narration-sources.js';
import {getLanguage, translateText as t} from './i18n.js';
import {escapeHTML as e} from './model.js';
import {appURL} from './app-paths.js';

// Changed spoken content needs a new URL as well as a new service-worker cache:
// native media and CDN HTTP caches can otherwise retain the previous recording.
const AUDIO_REVISION='20261111';
const narrationURL=(kind,id)=>appURL(`assets/audio/${getLanguage()}/${kind}-${id}.mp3?v=${AUDIO_REVISION}`);

function sourcesHTML(kind,id){
 const sources=NARRATION_SOURCES[`${kind}/${id}`]||[];
 if(!sources.length)return '';
 const index=Math.max(0,['vi','en','zh'].indexOf(getLanguage()));
 const label=['Tư liệu cho bài thuyết minh','Sources for this audio guide','讲解资料来源'][index];
 return `<div class="narration-sources" data-no-translate><strong lang="${getLanguage()}">${e(label)}</strong><ul>${sources.map(source=>`<li><a href="${e(source.url)}" target="_blank" rel="noopener noreferrer" lang="vi">${e(source.title)} ↗</a></li>`).join('')}</ul></div>`;
}

export function narrationHTML(kind,id){
 const script=narrationFor(kind,id,getLanguage());
 if(!script)return '';
 const src=narrationURL(kind,id);
 return `<section class="narration-player" data-narration-kind="${e(kind)}" data-narration-id="${e(id)}" aria-label="Nghe câu chuyện">
  <div class="narration-heading"><span class="narration-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><div><h3>Nghe câu chuyện</h3><small>Thuyết minh riêng · giọng tổng hợp</small></div></div>
  <audio controls preload="none" src="${e(src)}" aria-label="Phát thuyết minh"></audio>
  <div class="narration-settings"><label>Tốc độ nghe <select data-narration-rate data-no-translate><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option></select></label></div>
  <p class="narration-error" role="status" hidden><span>Chưa tải được âm thanh. Bạn có thể đọc bản lời hoặc thử lại.</span> <button type="button" data-narration-retry>Thử lại âm thanh</button></p>
  <details><summary>Bản lời thuyết minh</summary><p class="narration-transcript" data-no-translate lang="${getLanguage()}">${e(script)}</p>${sourcesHTML(kind,id)}<small>Lời kể được biên tập từ tư liệu của hồ sơ này; không thay hướng dẫn tại chỗ.</small></details>
 </section>`;
}
export function stopNarration(){
 document.querySelectorAll('.narration-player audio').forEach(audio=>audio.pause());
}
export function initNarration(){
 document.addEventListener('play',event=>{
  if(!event.target.matches?.('.narration-player audio'))return;
  document.querySelectorAll('.narration-player audio').forEach(audio=>{if(audio!==event.target)audio.pause();});
  event.target.closest('.narration-player').classList.add('is-playing');
 },true);
 for(const type of ['pause','ended'])document.addEventListener(type,event=>{
  event.target.closest?.('.narration-player')?.classList.remove('is-playing');
 },true);
 document.addEventListener('error',event=>{
  if(event.target.matches?.('.narration-player audio'))event.target.closest('.narration-player').querySelector('.narration-error').hidden=false;
 },true);
 document.addEventListener('change',event=>{
  if(event.target.matches('[data-narration-rate]'))event.target.closest('.narration-player').querySelector('audio').playbackRate=Number(event.target.value);
 });
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-narration-retry]');if(!button)return;
  const root=button.closest('.narration-player'),audio=root.querySelector('audio');
  root.querySelector('.narration-error').hidden=true;audio.load();
  audio.play().catch(()=>{root.querySelector('.narration-error').hidden=false;});
 });
 window.addEventListener('oceo-before-route-change',stopNarration);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopNarration();});
 window.addEventListener('pagehide',stopNarration);
 window.addEventListener('oceo-language-change',()=>{
  stopNarration();
  document.querySelectorAll('.narration-player').forEach(root=>{
   const {narrationKind:kind,narrationId:id}=root.dataset;
   const audio=root.querySelector('audio'),transcript=root.querySelector('.narration-transcript');
   audio.src=narrationURL(kind,id);
   audio.playbackRate=Number(root.querySelector('[data-narration-rate]').value);
   transcript.lang=getLanguage();transcript.textContent=narrationFor(kind,id,getLanguage());
   const sources=root.querySelector('.narration-sources');
   if(sources)sources.outerHTML=sourcesHTML(kind,id);
   root.querySelector('.narration-error').hidden=true;
   audio.setAttribute('aria-label',t('Phát thuyết minh'));
  });
 });
}
