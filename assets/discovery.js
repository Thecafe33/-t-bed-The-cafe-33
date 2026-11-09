import {getLanguage,translateText as t} from './i18n.js';
import {escapeHTML as e} from './model.js';
import {appURL} from './app-paths.js';
import {ARTIFACTS} from './artifacts.js';
import {narrationHTML,stopNarration} from './narration.js';
import {reducedMotion,playEffect} from './effects.js';
import {DiscoveryField,choosePlacement} from './discovery-field.js';
import {createTerrainRenderer} from './discovery-renderer.js';
import {icon} from './icons.js';

const MISSIONS=[
 {id:'nandin-giong-cat',name:'Nhẫn Nandin',image:'nandin-giong-cat',place:'Gò Giồng Cát',year:'2018',headline:'Bướu vai. Chân xếp. Một thế giới trên mặt nhẫn.',observation:'Thử tìm hình bò nằm xếp chân. Bài nguồn liên hệ Nandin với Shiva; chiếc nhẫn chưa cho biết ai từng đeo nó.'},
 {id:'phat-linh-son-bac',name:'Phù điêu Phật',image:'linh-son-bac-relief',place:'Linh Sơn Bắc',year:'2019',headline:'Hình chạm nổi. Câu chuyện nằm trong đá.',observation:'Hình Phật vẫn gắn với nền đá. Đó là phù điêu, khác với tượng tròn. Đối chiếu đôi mắt và các ký tự trong ảnh nguồn.'},
];
const TOOL={
 lens:'<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="25" cy="25" r="18" fill="#bbd8c755" stroke="#e3d7ad" stroke-width="5"/><path d="m39 39 15 15" stroke="#9c673d" stroke-width="9" stroke-linecap="round"/><path d="M15 23q1-9 10-10" fill="none" stroke="#fff8de" stroke-width="3"/></svg>',
 trowel:'<svg viewBox="0 0 60 60" aria-hidden="true"><path d="m31 29 7-7 16-16q5-2 5 4L42 27l-7 7" fill="#8d5737" stroke="#382f23" stroke-width="2"/><path d="m31 27 9 10-29 18q-5 2-4-4l8-30Z" fill="#bbc6c1" stroke="#334b43" stroke-width="2"/><path d="M14 46 32 31" fill="none" stroke="#ecf0dc" stroke-width="2"/></svg>',
 brush:'<svg viewBox="0 0 60 60" aria-hidden="true"><path d="m28 30 8-8L49 5q4-4 7 0l-1 5-17 22-7 6" fill="#a16d40" stroke="#4d3823" stroke-width="2"/><path d="m24 26 13 13-8 8-13-13Z" fill="#b5c7bc"/><path d="M17 32 29 44 14 57 3 44Z" fill="#ecd19a" stroke="#947343"/><path d="m8 45 12-10m-8 14 12-10m-8 14 12-10" stroke="#b78c4d"/></svg>',
};
const artURL=m=>appURL(`assets/heritage-art/${m.image}.webp`);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function discoveryEntryHTML(){
 return `<a class="discovery-entry" href="#discovery" data-route="discovery"><span class="discovery-entry-art" aria-hidden="true"><img src="${artURL(MISSIONS[0])}" alt="" loading="lazy"></span><span><small data-no-translate>ÓC EO / DISCOVERY LAB</small><strong>Khám phá cổ vật</strong><span>Gạt đất, phủi bụi. Gặp một câu chuyện Óc Eo.</span><b>Chơi thử ↗</b></span></a>`;
}

export function mountDiscovery(root){
 root.innerHTML=`<div class="discovery-page">
  <div class="discovery-scene" tabindex="0" role="group" aria-label="Không gian khám phá cổ vật" aria-describedby="discovery-accessibility">
   <canvas class="discovery-terrain" aria-hidden="true"></canvas><canvas class="discovery-fallback" aria-hidden="true" hidden></canvas><canvas class="discovery-dust" aria-hidden="true"></canvas>
   <span class="discovery-cursor" aria-hidden="true"></span><span class="discovery-keyboard-cursor" aria-hidden="true" hidden>+</span>
  </div>
  <header class="discovery-hud"><a href="#artifacts" data-route="artifacts" class="discovery-exit" aria-label="Về bộ thẻ cổ vật">←</a><div><small data-no-translate>ÓC EO / FIELD LAB</small><h1 id="discovery-heading" tabindex="-1">Dưới lớp đất này.</h1></div><button type="button" data-game-help aria-label="Thông tin và trợ giúp">?</button></header>
  <div class="discovery-scene-note" role="status"><span>Đang chuẩn bị hình…</span><button type="button" data-image-retry hidden>Thử tải lại hình</button></div>
  <p class="discovery-whisper" role="status" aria-live="polite" data-no-translate></p>
  <div class="discovery-bottom"><button class="discovery-found" type="button" data-open-find hidden><span>Đã tìm thấy một câu chuyện</span><b>${icon("arrowup")}</b></button>
   <div class="discovery-tools" role="group" aria-label="Dụng cụ"><button type="button" data-tool="trowel" aria-pressed="false">${TOOL.trowel}<span>Bay nhỏ</span></button><button type="button" data-tool="brush" aria-pressed="false">${TOOL.brush}<span>Cọ mềm</span></button><button type="button" data-tool="lens" aria-pressed="false">${TOOL.lens}<span>Kính soi</span></button><button type="button" data-game-reset aria-label="Một lượt khám phá khác" title="Một lượt khám phá khác">${icon("undo")}</button></div>
   <small class="discovery-caption">Không gian mô phỏng · hình hiện vật minh hoạ</small>
  </div>
  <p id="discovery-accessibility" class="discovery-sr">Chọn dụng cụ. Dùng phím mũi tên để di chuyển, giữ phím cách để thao tác. Mở trợ giúp nếu cần gợi ý.</p>
  <dialog class="discovery-panel discovery-help"><button type="button" data-close-panel aria-label="Trở lại hiện trường">←</button><h2>Khoảng trống để tự khám phá.</h2><p>Không có thứ tự bắt buộc. Bạn chọn chỗ tìm, thử dụng cụ và quan sát phản ứng của bề mặt.</p><button type="button" class="button outline" data-request-hint>Cho mình một gợi ý</button><p class="discovery-hint" role="status" data-no-translate></p><details><summary>Bàn phím và hỗ trợ thao tác</summary><p>Chọn dụng cụ. Dùng phím mũi tên để di chuyển, giữ phím cách để thao tác. Mở trợ giúp nếu cần gợi ý.</p><button type="button" class="button outline" data-game-assist>Thao tác tại vị trí đang chọn</button></details><hr><p>Trò chơi mô phỏng. Các lớp đất không tái hiện địa tầng thật. Chơi không cấp tem check-in Óc Eo Pass.</p><p>Minh hoạ hiện vật · không phải ảnh tư liệu</p><p>Ngoài di tích: chỉ quan sát theo hướng dẫn, không đào hoặc tự làm sạch hiện vật.</p></dialog>
  <dialog class="discovery-panel discovery-find"><button type="button" data-close-panel aria-label="Trở lại hiện trường">←</button><section class="discovery-result"></section></dialog>
 </div>`;
 const $=s=>root.querySelector(s),scene=$('.discovery-scene'),canvas=$('.discovery-terrain'),fallback=$('.discovery-fallback'),dust=$('.discovery-dust'),dctx=dust.getContext('2d'),note=$('.discovery-scene-note'),cursor=$('.discovery-cursor');
 const ac=new AbortController(),on=(el,event,fn,options={})=>el.addEventListener(event,fn,{...options,signal:ac.signal});
 let field=null,renderer=null,mission=-1,previous=null,tool='hand',pointer={x:.5,y:.5},held=null,last=null,frame=0,particles=[],ready=false,done=false,disposed=false,version=0,seed=1,messageTimer=0,lastFeedback=0,hints=0,lastSound=0,keyboard=false,active=true;
 let found=new Set();try{const saved=JSON.parse(localStorage.getItem('oceo-discoveries-v1')||'[]');if(Array.isArray(saved))found=new Set(saved.filter(id=>MISSIONS.some(m=>m.id===id)));}catch{}
 function paint(){
  frame=0;if(!active||disposed)return;
  renderer?.draw({pointer,tool,seed});
  const rect=scene.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);
  if(dust.width!==Math.round(rect.width*dpr)||dust.height!==Math.round(rect.height*dpr)){dust.width=Math.round(rect.width*dpr);dust.height=Math.round(rect.height*dpr);}
  dctx.setTransform(dpr,0,0,dpr,0,0);dctx.clearRect(0,0,rect.width,rect.height);
  particles=particles.filter(p=>p.life>0);
  for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.11;p.life-=.06;dctx.fillStyle=`rgba(210,177,123,${Math.max(0,p.life)*.7})`;dctx.beginPath();dctx.ellipse(p.x,p.y,p.r,p.r*.7,0,0,Math.PI*2);dctx.fill();}
  if(particles.length)frame=requestAnimationFrame(paint);
 }
 function schedule(){if(!frame&&active)frame=requestAnimationFrame(paint);}
 function message(text,force=false){
  if(!force&&performance.now()-lastFeedback<2000)return;lastFeedback=performance.now();clearTimeout(messageTimer);
  $('.discovery-whisper').textContent=t(text);$('.discovery-whisper').classList.add('is-visible');
  messageTimer=setTimeout(()=>{$('.discovery-whisper').classList.remove('is-visible');},2600);
 }
 function selectTool(next){
  if(!Object.hasOwn(TOOL,next))return;tool=next;cursor.innerHTML=TOOL[tool];
  root.querySelectorAll('[data-tool]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tool===tool)));
  schedule();
 }
 function release(){const id=held;held=null;last=null;if(id!==null&&scene.hasPointerCapture(id))scene.releasePointerCapture(id);cursor.classList.remove('is-visible');}
 function displayFind(){
  stopNarration();const m=MISSIONS[mission],a=ARTIFACTS.find(a=>a.id===m.id),lang=['vi','en','zh'].indexOf(getLanguage());
  $('.discovery-result').innerHTML=`<small data-no-translate>ÓC EO / FIELD NOTES</small><h2 tabindex="-1" data-no-translate>${e(a.name[Math.max(0,lang)])}</h2><img class="discovery-find-image" src="${artURL(m)}" alt="${e(t('Minh hoạ hiện vật · không phải ảnh tư liệu'))}"><p data-no-translate>${e(m.place)} · ${m.year}</p><strong>${e(t(m.headline))}</strong><p>${e(t(m.observation))}</p>${narrationHTML('artifact',m.id)}<button type="button" class="button dark" data-discovery-record="${m.id}">${e(t('Xem thẻ tư liệu'))} ↗</button><button type="button" class="button outline" data-game-reset>${e(t('Một lượt khám phá khác'))}</button>`;
 }
 function stroke(from,to){
  if(!ready||!field)return;
  const {changed,contact}=field.apply(tool,from,to);
  if(tool==='hand'){message('Bạn muốn thử với dụng cụ nào?');return;}
  if(tool==='lens'){schedule();return;}
  if(!reducedMotion()){
   for(let i=0;i<5;i++)particles.push({x:to.x*field.width,y:to.y*field.height,r:.8+Math.random()*3,vx:(Math.random()-.5)*4,vy:-Math.random()*3,life:.65});
   if(particles.length>65)particles.splice(0,particles.length-65);
  }
  if(changed){if(performance.now()-lastSound>180){playEffect('brush');lastSound=performance.now();}if(contact)message('Có một bề mặt khác ở đây.');}
  else message(tool==='brush'?'Đất vẫn còn khá chắc.':'Bề mặt này cần nhẹ tay hơn.');
  if(!done&&field.complete){
   done=true;release();found.add(MISSIONS[mission].id);try{localStorage.setItem('oceo-discoveries-v1',JSON.stringify([...found]));}catch{}
   scene.dataset.complete='true';$('[data-open-find]').hidden=false;message('Một câu chuyện vừa lộ ra.',true);playEffect('stamp');displayFind();
  }
  schedule();
 }
 function point(event){const r=scene.getBoundingClientRect();return{x:clamp((event.clientX-r.left)/r.width,0,1),y:clamp((event.clientY-r.top)/r.height,0,1)};}
 function move(event){
  if(event.pointerId!==held)return;pointer=point(event);
  cursor.style.left=`${pointer.x*100}%`;cursor.style.top=`${pointer.y*100}%`;cursor.classList.toggle('is-visible',tool!=='hand'&&tool!=='lens');
  stroke(last||pointer,pointer);last={...pointer};schedule();
 }
 function closePanels(){root.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());stopNarration();}
 function reset({retry=false}={}){
  closePanels();release();cancelAnimationFrame(frame);frame=0;particles=[];ready=false;done=false;hints=0;clearTimeout(messageTimer);$('.discovery-whisper').classList.remove('is-visible');
  renderer?.destroy();renderer=null;canvas.hidden=false;fallback.hidden=true;delete scene.dataset.complete;
  $('[data-open-find]').hidden=true;$('.discovery-result').innerHTML='';$('.discovery-hint').textContent='';
  tool='hand';root.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed','false'));
  if(!retry){mission=mission<0?Math.floor(Math.random()*MISSIONS.length):(mission+1)%MISSIONS.length;previous=field?{...field.target}:previous;}
  seed=Math.random()*1000;note.hidden=false;note.querySelector('span').textContent=t('Đang chuẩn bị hình…');$('[data-image-retry]').hidden=true;
  const epoch=++version,image=new Image();image.decoding='async';
  image.onload=()=>{
   if(disposed||epoch!==version)return;
   const rect=scene.getBoundingClientRect(),w=rect.width||innerWidth,h=rect.height||innerHeight;
   const alphaCanvas=document.createElement('canvas');alphaCanvas.width=96;alphaCanvas.height=128;const alphaContext=alphaCanvas.getContext('2d');alphaContext.drawImage(image,0,0,96,128);
   field=new DiscoveryField(w,h,choosePlacement(w,h,previous),alphaContext.getImageData(0,0,96,128));
   renderer=createTerrainRenderer(canvas,fallback,image,field);scene.dataset.renderer=renderer.kind;ready=true;note.hidden=true;pointer={x:.5,y:.5};schedule();
  };
  image.onerror=()=>{if(disposed||epoch!==version)return;note.querySelector('span').textContent=t('Chưa tải được hình. Kiểm tra kết nối rồi thử lại.');$('[data-image-retry]').hidden=false;};
  image.src=artURL(MISSIONS[mission]);
 }
 on(scene,'pointerdown',event=>{if(event.button!==0||!event.isPrimary||!ready)return;event.preventDefault();keyboard=false;$('.discovery-keyboard-cursor').hidden=true;held=event.pointerId;scene.setPointerCapture(held);scene.focus({preventScroll:true});pointer=point(event);last={...pointer};move(event);});
 on(scene,'pointermove',move);on(scene,'pointerup',release);on(scene,'pointercancel',release);on(scene,'lostpointercapture',release);
 on(root,'click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.matches('[data-tool]'))selectTool(button.dataset.tool);
  if(button.matches('[data-game-reset]'))reset();
  if(button.matches('[data-image-retry]'))reset({retry:true});
  if(button.matches('[data-game-help]')){release();$('.discovery-help').showModal();}
  if(button.matches('[data-close-panel]')){closePanels();scene.focus({preventScroll:true});}
  if(button.matches('[data-open-find]')&&done){release();$('.discovery-find').showModal();}
  if(button.matches('[data-request-hint]')){$('.discovery-hint').textContent=t(hints++===0?'Thử một vùng khác. Quan sát màu đất và phản ứng dưới tay bạn.':'Bay làm tơi đất chắc. Cọ làm sạch lớp phủ mỏng khi bề mặt đã lộ. Kính soi không đào đất.');}
  if(button.matches('[data-game-assist]')){closePanels();scene.focus({preventScroll:true});stroke(pointer,pointer);schedule();}
 });
 for(const panel of root.querySelectorAll('dialog')){
  on(panel,'cancel',event=>{event.preventDefault();closePanels();scene.focus({preventScroll:true});});on(panel,'close',stopNarration);
 }
 on(scene,'keydown',event=>{
  const delta=16;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
   event.preventDefault();keyboard=true;
   pointer.x=clamp(pointer.x+(event.key==='ArrowLeft'?-delta:event.key==='ArrowRight'?delta:0)/(field?.width||innerWidth),.02,.98);
   pointer.y=clamp(pointer.y+(event.key==='ArrowUp'?-delta:event.key==='ArrowDown'?delta:0)/(field?.height||innerHeight),.08,.85);
   const marker=$('.discovery-keyboard-cursor');marker.hidden=false;marker.style.left=`${pointer.x*100}%`;marker.style.top=`${pointer.y*100}%`;schedule();
  }
  if([' ','Enter'].includes(event.key)){event.preventDefault();stroke(pointer,pointer);schedule();}
 });
 const observer=new ResizeObserver(()=>{if(field&&ready){const r=scene.getBoundingClientRect();if(r.width>0&&r.height>0&&(field.width!==r.width||field.height!==r.height)){field.resize(r.width,r.height);schedule();}}});observer.observe(scene);
 on(window,'oceo-before-route-change',()=>{release();closePanels();active=false;cancelAnimationFrame(frame);frame=0;particles=[];});
 on(window,'oceo-route-change',event=>{active=event.detail.tab==='discovery';if(active)schedule();});
 on(document,'visibilitychange',()=>{if(document.hidden){release();cancelAnimationFrame(frame);frame=0;particles=[];}else if(active)schedule();});
 on(window,'oceo-language-change',()=>{if(done)displayFind();$('.discovery-hint').textContent='';$('.discovery-whisper').textContent='';});
 reset();
 return {destroy(){disposed=true;version++;release();closePanels();cancelAnimationFrame(frame);clearTimeout(messageTimer);observer.disconnect();renderer?.destroy();ac.abort();}};
}
