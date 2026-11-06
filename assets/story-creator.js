import {escapeHTML as e,contentSourced} from './model.js';
import {renderStoryArtwork,storyText,storyFact,storyFactSource,storyMessages} from './story-art.js';
export {storyMessages};
let instance=0;
const clean=(value,max)=>Array.from(String(value||'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'')).slice(0,max).join('');
function publicJourneyURL(value){
 if(typeof value!=='string'||!value.trim())return '';
 try{const url=new URL(value,location.href);if(url.origin!==location.origin||!['http:','https:'].includes(url.protocol))return '';const journey=url.searchParams.get('journey');url.search='';if(journey&&/^[a-z0-9-]{1,80}$/i.test(journey))url.searchParams.set('journey',journey);url.hash='day';url.username='';url.password='';return url.href;}catch{return '';}
}
const PHOTO_TYPES=new Set(['image/jpeg','image/png','image/webp','image/avif','image/gif','image/heic','image/heif']);

/** Guest-only editor; all personal media and text live solely in this mount. */
export function mountStoryCreator({root,places,earned,name='',locale='vi',journeyURL='',journeyCount=0,journeyIds=[],onClose=()=>{},onToast=()=>{}}){
 const byId=new Map(places.filter(p=>p.category==='heritage'&&p.collectible!==false&&p.scopeConfirmed===true&&contentSourced(p)).map(p=>[p.id,p]));
 const collected=[...new Set(earned.map(p=>typeof p==='string'?p:p.id))].map(id=>byId.get(id)).filter(Boolean);
 const id=`story-${++instance}`,abort=new AbortController(),events={signal:abort.signal},ownedURLs=new Set(),timers=new Set();
 let disposed=false,uploadVersion=0,renderVersion=0,pendingTimer=null,activeUpload=null;
 const first=journeyIds.find(id=>collected.some(p=>p.id===id))||collected[0]?.id;
 const state={name:clean(name,60),caption:'',locale:['vi','en','zh'].includes(locale)?locale:'vi',mode:'single',featured:first,photo:null,fit:'cover',focusX:.5,focusY:.5,includeFact:true,file:null,uploading:false,error:''};
 const link=publicJourneyURL(journeyURL),t=key=>storyText(key,state.locale),find=selector=>root.querySelector(selector);
 function tell(key){if(disposed)return;const value=t(key);const output=find('[data-story-status]');if(output)output.textContent=value;onToast(value);}
 function cleanupURL(url){if(ownedURLs.delete(url))URL.revokeObjectURL(url);}
 function cancelUpload(){if(activeUpload){cleanupURL(activeUpload.url);activeUpload.image.src='';activeUpload=null;}}
 function selection(){
  const featured=byId.get(state.featured)||collected[0];if(state.mode==='single')return [featured];
  const priority=[featured,...journeyIds.map(id=>collected.find(p=>p.id===id)),...collected].filter(Boolean);
  return [...new Map(priority.map(p=>[p.id,p])).values()].slice(0,3);
 }
 function drawUI(){
  if(!collected.length){root.innerHTML=`<p>${e(t('noStamps'))}</p><button type="button" data-story-action="close">${e(t('close'))}</button>`;return;}
  const hasPhoto=!!state.photo;
  root.innerHTML=`<section class="story-creator"><h2>${e(t('title'))}</h2><p class="story-intro">${e(t('intro'))}</p><div class="story-modes" role="group" aria-label="${e(t('point'))}"><button type="button" data-story-mode="single" aria-pressed="${state.mode==='single'}">${e(t('single'))}</button><button type="button" data-story-mode="trip" aria-pressed="${state.mode==='trip'}" ${collected.length<2?'disabled':''}>${e(t('trip'))}</button></div><label class="field">${e(t('point'))}<select data-story-field="featured">${collected.map(p=>`<option value="${e(p.id)}" ${p.id===state.featured?'selected':''} data-no-translate>${e(p.name)}</option>`).join('')}</select></label><label class="story-upload" for="${id}-photo">${e(t('photo'))}<input id="${id}-photo" data-story-field="photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/heic,image/heif"></label><p class="story-error" data-story-error role="alert">${e(state.error?t(state.error):'')}</p><p class="story-privacy">${e(t('privacy'))}</p><p class="story-no-photo">${e(t('noPhoto'))}</p><div class="story-photo-controls" ${hasPhoto?'':'hidden'}><label class="field">${e(t('fit'))}<select data-story-field="fit"><option value="cover" ${state.fit==='cover'?'selected':''}>${e(t('cover'))}</option><option value="contain" ${state.fit==='contain'?'selected':''}>${e(t('contain'))}</option></select></label><label>${e(t('focalX'))}<input data-story-field="focusX" type="range" min="0" max="100" value="${state.focusX*100}" ${state.fit==='contain'?'disabled':''}></label><label>${e(t('focalY'))}<input data-story-field="focusY" type="range" min="0" max="100" value="${state.focusY*100}" ${state.fit==='contain'?'disabled':''}></label><button type="button" data-story-action="remove">${e(t('remove'))}</button></div><label class="field">${e(t('name'))}<input data-story-field="name" maxlength="60" autocomplete="off" value="${e(state.name)}" placeholder="${e(t('nameHint'))}" data-no-translate></label><label class="field">${e(t('caption'))}<textarea data-story-field="caption" maxlength="100" rows="3" placeholder="${e(t('captionHint'))}" data-no-translate>${e(state.caption)}</textarea><small data-story-counter data-no-translate>${Array.from(state.caption).length} / 100</small></label><label class="story-fact-toggle"><input data-story-field="includeFact" type="checkbox" ${state.includeFact?'checked':''} ${storyFact(byId.get(state.featured),state.locale)?'':'disabled'}>${e(t('fact'))}</label><p class="story-fact-preview" data-story-fact data-no-translate></p><a data-story-source target="_blank" rel="noopener noreferrer">${e(t('source'))}</a><p class="story-stamp-note">${e(t('earlier'))}</p><canvas class="story-preview" width="1080" height="1920" role="img" aria-label="${e(t('preview'))}" style="width:100%;height:auto"></canvas><p class="story-status" data-story-status role="status" aria-live="polite">${e(t('rendering'))}</p><div class="story-actions"><button type="button" data-story-action="download" disabled>${e(t('download'))}</button><button type="button" data-story-action="share" disabled>${e(t('share'))}</button><button type="button" data-story-action="copy" ${link?'':'disabled'}>${e(t('copy'))}</button></div><p class="story-share-note">${e(t('shareNote'))}</p>${link?`<a class="story-link" href="${e(link)}" data-no-translate>${e(link)}</a>`:''}<button type="button" data-story-action="close">${e(t('close'))}</button></section>`;
  // Preview and exports come before the longer editing fields on a phone.
  const section=find('.story-creator'),options=document.createElement('details');options.className='story-options';options.open=true;
  const summary=document.createElement('summary');summary.textContent=t('options');options.append(summary);
  for(const selector of ['.story-no-photo','.story-modes','[data-story-field="featured"]','.story-photo-controls','[data-story-field="name"]','[data-story-field="caption"]','.story-fact-toggle','[data-story-fact]','[data-story-source]','.story-stamp-note']){
   const element=find(selector);if(element)options.append(element.matches('select,input,textarea')?element.closest('label'):element);
  }
  const preview=find('.story-preview'),status=find('[data-story-status]'),actions=find('.story-actions'),shareNote=find('.story-share-note'),journeyLink=find('.story-link'),close=find('[data-story-action="close"]');
  for(const element of [preview,status,actions,options,shareNote,journeyLink,close])if(element)section.append(element);
  updateFact();
 }
 function updateFact(){
  const place=byId.get(state.featured),fact=state.includeFact?storyFact(place,state.locale):'',output=find('[data-story-fact]'),source=find('[data-story-source]');
  if(output){output.textContent=fact;output.hidden=!fact;}if(source){source.hidden=!fact;const url=storyFactSource(place);if(url)source.href=url;else source.removeAttribute('href');}
 }
 function setExportEnabled(value){for(const selector of ['download','share']){const button=find(`[data-story-action="${selector}"]`);if(button)button.disabled=!value;}}
 function schedule(){
  if(disposed||!collected.length)return;renderVersion++;state.file=null;setExportEnabled(false);if(pendingTimer)clearTimeout(pendingTimer);
  const output=find('[data-story-status]');if(output)output.textContent=t('rendering');
  pendingTimer=setTimeout(()=>{pendingTimer=null;void render(renderVersion);},90);
 }
 async function render(version){
  if(disposed||state.uploading)return;
  try{
   const featured=byId.get(state.featured),chosen=selection();
   const result=await renderStoryArtwork({photo:state.photo,places:chosen,featured,name:state.name,caption:state.caption,locale:state.locale,fit:state.fit,focusX:state.focusX,focusY:state.focusY,includeFact:state.includeFact,journeyURL:link});
   if(disposed||version!==renderVersion)return;
   const preview=find('.story-preview');if(!preview)return;preview.getContext('2d').drawImage(result.canvas,0,0);state.file=new File([result.blob],'oc-eo-co-dau-toi.png',{type:'image/png'});setExportEnabled(true);find('[data-story-status]').textContent=t('ready');
  }catch{if(!disposed&&version===renderVersion)tell('exportError');}
 }
 async function upload(file){
  function fail(key){state.error=key;const error=find('[data-story-error]');if(error)error.textContent=t(key);onToast(t(key));}
  if(!file)return;if(file.size>20*1024*1024){fail('sizeError');return;}if(!PHOTO_TYPES.has(file.type)){fail('photoError');return;}
  const version=++uploadVersion;cancelUpload();state.error='';const output=find('[data-story-error]');if(output)output.textContent='';
  state.uploading=true;schedule();const url=URL.createObjectURL(file);ownedURLs.add(url);const image=new Image();activeUpload={url,image};
  try{
   image.src=url;await image.decode();if(disposed||version!==uploadVersion)return;
   const {naturalWidth:w,naturalHeight:h}=image;if(!w||!h)throw Error('invalid image');if(w*h>80_000_000)throw Error('dimensions');
   const scale=Math.min(1,1600/Math.max(w,h)),photo=document.createElement('canvas');photo.width=Math.max(1,Math.round(w*scale));photo.height=Math.max(1,Math.round(h*scale));const ctx=photo.getContext('2d');if(!ctx)throw Error('canvas');ctx.fillStyle='#f3ead5';ctx.fillRect(0,0,photo.width,photo.height);ctx.drawImage(image,0,0,photo.width,photo.height);
   state.photo=photo;state.focusX=.5;state.focusY=.5;
  }catch(error){if(!disposed&&version===uploadVersion)fail(error?.message==='dimensions'?'dimensionsError':'photoError');}
  finally{cleanupURL(url);image.src='';if(activeUpload?.image===image)activeUpload=null;if(!disposed&&version===uploadVersion){state.uploading=false;drawUI();schedule();}}
 }
 function download(file){
  const url=URL.createObjectURL(file);ownedURLs.add(url);const anchor=document.createElement('a');anchor.href=url;anchor.download=file.name;anchor.rel='noopener';document.body.append(anchor);anchor.click();anchor.remove();const timer=setTimeout(()=>{timers.delete(timer);cleanupURL(url);},30_000);timers.add(timer);
 }
 async function share(){
  const file=state.file;if(!file)return;
  let supported=false;try{supported=typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[file]});}catch{}
  if(!supported){download(file);tell('shareFallback');return;}
  try{
   // Invoke synchronously from this click, before any await consumes activation.
   const pending=navigator.share({files:[file],title:'Óc Eo Townwalk',text:state.caption||t('title'),...(link?{url:link}:{})});
   await pending;if(!disposed)tell('shareOpened');
  }catch(error){if(disposed||error?.name==='AbortError')return;download(file);tell('shareFallback');}
 }
 async function copy(){
  if(!link)return;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(link);if(!disposed)tell('copied');return;}}catch{}
  if(disposed)return;
  const area=document.createElement('textarea');area.value=link;area.readOnly=true;area.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:.01';root.append(area);area.focus();area.select();area.setSelectionRange(0,link.length);
  let copied=false;try{copied=document.execCommand('copy');}catch{}area.remove();tell(copied?'copied':'copyError');
 }
 root.addEventListener('click',event=>{
  const mode=event.target.closest('[data-story-mode]');if(mode&&!mode.disabled){state.mode=mode.dataset.storyMode;drawUI();schedule();return;}
  const action=event.target.closest('[data-story-action]')?.dataset.storyAction;
  if(action==='close')onClose();if(action==='download'&&state.file){download(state.file);tell('saved');}if(action==='share')void share();if(action==='copy')void copy();
  if(action==='remove'){uploadVersion++;cancelUpload();state.uploading=false;state.photo=null;drawUI();schedule();}
 },events);
 function update(event){
  const field=event.target.dataset.storyField;if(!field)return;
  if(field==='photo'){const file=event.target.files?.[0];event.target.value='';void upload(file);return;}
  if(field==='name'||field==='caption'){state[field]=clean(event.target.value,field==='name'?60:100);if(event.target.value!==state[field])event.target.value=state[field];if(field==='caption')find('[data-story-counter]').textContent=`${Array.from(state.caption).length} / 100`;}
  if(field==='featured'){if(!collected.some(p=>p.id===event.target.value))return;state.featured=event.target.value;const fact=find('[data-story-field="includeFact"]');if(fact)fact.disabled=!storyFact(byId.get(state.featured),state.locale);}
  if(field==='includeFact')state.includeFact=event.target.checked;
  if(field==='featured'||field==='includeFact')updateFact();
  if(field==='fit'){state.fit=event.target.value==='contain'?'contain':'cover';for(const axis of ['focusX','focusY'])find(`[data-story-field="${axis}"]`).disabled=state.fit==='contain';}
  if(field==='focusX'||field==='focusY')state[field]=Math.max(0,Math.min(1,Number(event.target.value)/100));
  schedule();
 }
 root.addEventListener('input',event=>{if(event.target.dataset.storyField!=='photo')update(event);},events);
 root.addEventListener('change',event=>{if(['photo','featured','includeFact','fit'].includes(event.target.dataset.storyField))update(event);},events);
 drawUI();schedule();
 return {setLocale(next){if(disposed||!['vi','en','zh'].includes(next))return;state.locale=next;drawUI();schedule();},destroy(){if(disposed)return;disposed=true;uploadVersion++;renderVersion++;cancelUpload();abort.abort();if(pendingTimer)clearTimeout(pendingTimer);for(const timer of timers)clearTimeout(timer);timers.clear();for(const url of [...ownedURLs])cleanupURL(url);state.photo=null;state.file=null;state.name='';state.caption='';const preview=find('.story-preview');if(preview){preview.width=0;preview.height=0;}root.replaceChildren();}};
}
