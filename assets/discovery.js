import {getLanguage,translateText as t} from './i18n.js';
import {escapeHTML as e} from './model.js';
import {appURL} from './app-paths.js';
import {ARTIFACTS} from './artifacts.js';
import {narrationHTML,stopNarration} from './narration.js';
import {reducedMotion,playEffect} from './effects.js';

const MISSIONS=[
 {id:'nandin-giong-cat',name:'Nhẫn Nandin',image:'nandin-giong-cat',place:'Gò Giồng Cát',year:'2018',headline:'Bướu vai. Chân xếp. Một thế giới trên mặt nhẫn.',observation:'Thử tìm hình bò nằm xếp chân. Bài nguồn liên hệ Nandin với Shiva; chiếc nhẫn chưa cho biết ai từng đeo nó.'},
 {id:'phat-linh-son-bac',name:'Phù điêu Phật',image:'linh-son-bac-relief',place:'Linh Sơn Bắc',year:'2019',headline:'Hình chạm nổi. Câu chuyện nằm trong đá.',observation:'Hình Phật vẫn gắn với nền đá. Đó là phù điêu, khác với tượng tròn. Đối chiếu đôi mắt và các ký tự trong ảnh nguồn.'},
];
const W=480,H=560,GRID=12,STAGES=['Lớp đất mặt','Lớp đất phía dưới','Phủi bụi','Đã hé lộ'];
const TOOL={
 trowel:'<svg viewBox="0 0 60 60" aria-hidden="true"><path d="m31 29 7-7 16-16q5-2 5 4L42 27l-7 7" fill="#8d5737" stroke="#382f23" stroke-width="2"/><path d="m31 27 9 10-29 18q-5 2-4-4l8-30Z" fill="#bbc6c1" stroke="#334b43" stroke-width="2"/><path d="M14 46 32 31" fill="none" stroke="#ecf0dc" stroke-width="2"/></svg>',
 brush:'<svg viewBox="0 0 60 60" aria-hidden="true"><path d="m28 30 8-8L49 5q4-4 7 0l-1 5-17 22-7 6" fill="#a16d40" stroke="#4d3823" stroke-width="2"/><path d="m24 26 13 13-8 8-13-13Z" fill="#b5c7bc"/><path d="M17 32 29 44 14 57 3 44Z" fill="#ecd19a" stroke="#947343"/><path d="m8 45 12-10m-8 14 12-10m-8 14 12-10" stroke="#b78c4d"/></svg>',
};
const artURL=m=>appURL(`assets/heritage-art/${m.image}.webp`);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// Seeded procedural earth is deliberately fictitious, never a depiction of site strata.
function soil(canvas,layer){
 const ctx=canvas.getContext('2d');canvas.width=W;canvas.height=H;
 let seed=1407+layer*711;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const palettes=[[85,58,39],[150,108,66],[194,161,113]],base=palettes[layer];
 const data=ctx.createImageData(W,H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=(y*W+x)*4,grain=(random()-.5)*(layer===2?52:65);
  const wave=Math.sin(x*.024+y*.041)*5+Math.cos(x*.04-y*.011)*9;
  const shade=1-0.26*Math.hypot((x-W/2)/W,(y-H/2)/H);
  for(let c=0;c<3;c++)data.data[i+c]=clamp((base[c]+grain+wave)*shade,0,255);
  data.data[i+3]=layer===2?Math.round(155+random()*75):255;
 }
 ctx.putImageData(data,0,0);
 if(layer<2){
  for(let i=0;i<360;i++){
   const x=random()*W,y=random()*H,r=.8+random()*6;
   ctx.save();ctx.translate(x,y);ctx.rotate(random()*Math.PI);
   const g=ctx.createRadialGradient(-r/3,-r/2,0,0,0,r);
   g.addColorStop(0,layer?'#b99b72':'#9b7a55');g.addColorStop(1,layer?'#6a4c32':'#3c2b21');
   ctx.fillStyle=g;ctx.shadowColor='#21180c55';ctx.shadowBlur=3;ctx.shadowOffsetY=2;
   ctx.beginPath();ctx.ellipse(0,0,r,r*.65,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  // Fine roots in the surface layer only.
  if(layer===0)for(let i=0;i<10;i++){
   const x=random()*W,y=random()*H;ctx.strokeStyle='#b1996b55';ctx.lineWidth=.7+random();ctx.beginPath();ctx.moveTo(x,y);
   ctx.bezierCurveTo(x+20,y+8,x-30,y+34,x+10,y+65);ctx.stroke();
  }
 }
}

export function discoveryEntryHTML(){
 return `<a class="discovery-entry" href="#discovery" data-route="discovery"><span class="discovery-entry-art" aria-hidden="true"><img src="${artURL(MISSIONS[0])}" alt="" loading="lazy"></span><span><small data-no-translate>ÓC EO / DISCOVERY LAB</small><strong>Khám phá cổ vật</strong><span>Gạt đất, phủi bụi. Gặp một câu chuyện Óc Eo.</span><b>Chơi thử ↗</b></span></a>`;
}

export function mountDiscovery(root){
 root.innerHTML=`<div class="discovery-page"><div class="eyebrow" data-no-translate>ÓC EO / DISCOVERY LAB</div><h1 id="discovery-heading" tabindex="-1">Chạm đất.<br><span class="serif">Gặp ngàn năm.</span></h1><p class="discovery-intro">Gạt từng lớp đất. Phủi nhẹ lớp bụi. Một câu chuyện Óc Eo đang chờ bạn.</p>
 <div class="discovery-missions" role="group" aria-label="Chọn hiện vật">${MISSIONS.map((m,i)=>`<button type="button" data-mission="${i}" aria-pressed="${i===0}"><img src="${artURL(m)}" alt=""><span>${e(m.name)}</span><span class="mission-check" aria-hidden="true"></span></button>`).join('')}</div>
 <div class="discovery-workbench"><div class="discovery-stage-heading"><span class="discovery-step" data-no-translate>01 / 03</span><strong data-game-stage>Lớp đất mặt</strong><output data-game-percent data-no-translate>0%</output></div><progress max="100" value="0" aria-label="Đã hé lộ"></progress>
 <div class="discovery-scene" tabindex="0" role="group" aria-label="Chạm để khám phá" aria-describedby="discovery-instruction"><div class="discovery-floor"></div><img class="discovery-object" src="${artURL(MISSIONS[0])}" alt="Minh hoạ hiện vật · không phải ảnh tư liệu" draggable="false"><canvas class="discovery-earth" data-layer="2" aria-hidden="true"></canvas><canvas class="discovery-earth" data-layer="1" aria-hidden="true"></canvas><canvas class="discovery-earth" data-layer="0" aria-hidden="true"></canvas><canvas class="discovery-dust" width="480" height="560" aria-hidden="true"></canvas><span class="discovery-cursor" aria-hidden="true">${TOOL.trowel}</span><div class="discovery-scene-note"><span>Đang chuẩn bị hình…</span><button type="button" data-image-retry hidden>Thử tải lại hình</button></div><span class="discovery-corner" aria-hidden="true">ÓC EO<br>FIELD NOTES</span></div>
 <div class="discovery-instruction" id="discovery-instruction" role="status" aria-live="polite">Kéo ngón tay để gạt đất</div>
 <div class="discovery-tools" role="group" aria-label="Dụng cụ"><button type="button" data-tool="trowel" aria-pressed="true">${TOOL.trowel}<span>Bay nhỏ</span></button><button type="button" data-tool="brush" aria-pressed="false" disabled>${TOOL.brush}<span>Cọ mềm</span></button><button type="button" data-game-reset aria-label="Chơi lại hiện vật này" title="Chơi lại hiện vật này">↻</button></div>
 <div class="discovery-assist"><button type="button" data-game-assist title="Nút này hỗ trợ thao tác, tiến độ vẫn dựa trên vùng đã làm sạch.">Gạt một vùng</button><small>Không tiện kéo? Dùng nút Gạt một vùng.</small></div></div>
 <p class="discovery-image-credit">Minh hoạ hiện vật · không phải ảnh tư liệu</p><section class="discovery-result" hidden></section>
 <p class="discovery-disclaimer">Trò chơi mô phỏng. Các lớp đất không tái hiện địa tầng thật. Chơi không cấp tem check-in Óc Eo Pass.</p><p class="discovery-ethics">Ngoài di tích: chỉ quan sát theo hướng dẫn, không đào hoặc tự làm sạch hiện vật.</p></div>`;
 const $=s=>root.querySelector(s),scene=$('.discovery-scene'),object=$('.discovery-object'),note=$('.discovery-scene-note'),cursor=$('.discovery-cursor'),result=$('.discovery-result');
 const canvases=[0,1,2].map(i=>$(`[data-layer="${i}"]`)),dust=$('.discovery-dust'),dctx=dust.getContext('2d');
 let mission=0,stage=0,tool='trowel',pointer=null,last=null,ready=false,busy=false,timer=0,frame=0,particles=[],percent=-1,lastSound=0,destroyed=false,objectVersion=0;
 let cells=[],found=new Set();
 try{const saved=JSON.parse(localStorage.getItem('oceo-discoveries-v1')||'[]');if(Array.isArray(saved))found=new Set(saved.filter(id=>MISSIONS.some(m=>m.id===id)));}catch{}
 const ac=new AbortController(),on=(node,event,fn,options={})=>node.addEventListener(event,fn,{...options,signal:ac.signal});
 function updateFound(){root.querySelectorAll('.discovery-missions [data-mission]').forEach(button=>{
  const m=MISSIONS[Number(button.dataset.mission)],seen=found.has(m.id);button.querySelector('.mission-check').textContent=seen?'✓':'';
  button.title=seen?t('Đã khám phá trên máy này'):t('Chọn hiện vật');
 });}
 function initCells(){
  cells=[];const inset=stage===0?.07:.19,top=stage===0?.07:.12,bottom=stage===0?.93:.88;
  for(let y=GRID/2;y<H;y+=GRID)for(let x=GRID/2;x<W;x+=GRID)if(x>W*inset&&x<W*(1-inset)&&y>H*top&&y<H*bottom)cells.push({x,y,clean:false});
 }
 function status(){
  $('[data-game-stage]').textContent=t(STAGES[stage]);$('.discovery-step').textContent=stage===3?'03 / 03':`0${stage+1} / 03`;
  const text=stage===0?'Kéo ngón tay để gạt đất':stage===1?'Tiếp tục gạt lớp đất sáng màu':stage===2?(tool==='brush'?'Lướt cọ nhẹ trên bề mặt':'Đổi sang cọ để làm sạch'):'Kéo trên hình để nghiêng nhẹ và quan sát';
  $('#discovery-instruction').textContent=t(text);
  root.querySelector('[data-tool="brush"]').disabled=stage<2||stage===3;
  root.querySelector('[data-tool="trowel"]').disabled=stage>=2;
  root.querySelectorAll('[data-tool]').forEach(button=>button.setAttribute('aria-pressed',String(stage!==3&&button.dataset.tool===tool)));
  $('[data-game-assist]').disabled=stage===3||!ready||busy;
  scene.dataset.stage=String(stage);
 }
 function updateProgress(){
  const total=stage===3?100:Math.floor((stage+Math.min(1,cells.filter(c=>c.clean).length/cells.length/.78))/3*100);
  if(total===percent)return;percent=total;
  $('progress').value=total;$('[data-game-percent]').value=`${total}%`;
 }
 function release(){
  if(pointer!==null&&scene.hasPointerCapture(pointer))scene.releasePointerCapture(pointer);
  pointer=null;last=null;cursor.classList.remove('is-visible');object.style.transform='';
 }
 function setTool(next){
  if(stage<2&&next!=='trowel'||stage===2&&next!=='brush'||stage===3)return;
  tool=next;cursor.innerHTML=TOOL[tool];status();
 }
 function renderResult(){
  stopNarration();
  const m=MISSIONS[mission],a=ARTIFACTS.find(a=>a.id===m.id),lang=Math.max(0,['vi','en','zh'].indexOf(getLanguage()));
  result.innerHTML=`<small data-no-translate>ÓC EO / DISCOVERED</small><h2 tabindex="-1">${e(t('Bạn vừa hé lộ một câu chuyện.'))}</h2><h3 data-no-translate>${e(a.name[lang])}</h3><p class="discovery-find-context" data-no-translate>${e(m.place)} · ${m.year}</p><strong>${e(t(m.headline))}</strong><p>${e(t(m.observation))}</p>${narrationHTML('artifact',m.id)}<button class="button dark" type="button" data-discovery-record="${e(m.id)}">${e(t('Xem thẻ tư liệu'))} ↗</button><button class="button outline" type="button" data-mission="${(mission+1)%MISSIONS.length}"><span>${e(t('Khám phá hiện vật tiếp theo'))}</span> <span aria-hidden="true">→</span></button>`;
 }
 function completeStage(){
  if(busy||stage===3)return;busy=true;release();const cleared=canvases[stage];cleared.style.opacity='0';status();
  timer=setTimeout(()=>{
   timer=0;if(destroyed)return;stage++;busy=false;initCells();updateProgress();status();
   if(stage===3){
    found.add(MISSIONS[mission].id);try{localStorage.setItem('oceo-discoveries-v1',JSON.stringify([...found]));}catch{}
    updateFound();renderResult();result.hidden=false;scene.classList.add('is-revealed');playEffect('stamp');
    result.querySelector('h2').focus({preventScroll:true});
   }
  },reducedMotion()?0:220);
 }
 function animateDust(){
  frame=0;dctx.clearRect(0,0,W,H);
  particles=particles.filter(p=>p.life>0);
  for(const p of particles){p.life-=.055;p.x+=p.vx;p.y+=p.vy;p.vy+=.10;dctx.fillStyle=`rgba(221,191,132,${Math.max(0,p.life)*.6})`;dctx.beginPath();dctx.arc(p.x,p.y,p.r,0,Math.PI*2);dctx.fill();}
  if(particles.length)frame=requestAnimationFrame(animateDust);
 }
 function erase(x,y,r){
  const ctx=canvases[stage].getContext('2d');ctx.save();ctx.globalCompositeOperation='destination-out';
  const g=ctx.createRadialGradient(x,y,r*.65,x,y,r);g.addColorStop(0,'#000');g.addColorStop(1,'#0000');ctx.fillStyle=g;
  ctx.fillRect(x-r,y-r,2*r,2*r);ctx.restore();
  for(const c of cells)if(!c.clean&&Math.hypot(c.x-x,c.y-y)<r*.76)c.clean=true;
 }
 function stroke(x,y,from){
  if(!ready||busy||stage===3||stage===2&&tool!=='brush')return;
  note.hidden=true;const r=stage===0?43:stage===1?37:30;
  const start=from||{x,y},distance=Math.hypot(x-start.x,y-start.y),steps=Math.max(1,Math.ceil(distance/(r*.3)));
  for(let i=1;i<=steps;i++)erase(start.x+(x-start.x)*i/steps,start.y+(y-start.y)*i/steps,r);
  if(!reducedMotion()){
   for(let i=0;i<3;i++)particles.push({x,y,vx:(Math.random()-.5)*3,vy:-Math.random()*2,r:.8+Math.random()*2,life:.5+Math.random()*.5});
   if(particles.length>90)particles.splice(0,particles.length-90);if(!frame)frame=requestAnimationFrame(animateDust);
  }
  if(performance.now()-lastSound>220){playEffect('brush');lastSound=performance.now();}
  updateProgress();if(cells.filter(c=>c.clean).length/cells.length>=.78)completeStage();
 }
 function point(event){const rect=scene.getBoundingClientRect();return{x:clamp((event.clientX-rect.left)/rect.width*W,0,W),y:clamp((event.clientY-rect.top)/rect.height*H,0,H)};}
 function move(event){
  if(event.pointerId!==pointer)return;const p=point(event);
  if(stage===3){if(!reducedMotion())object.style.transform=`perspective(700px) rotateX(${(p.y/H-.5)*-12}deg) rotateY(${(p.x/W-.5)*18}deg) scale(1.035)`;return;}
  cursor.style.left=`${p.x/W*100}%`;cursor.style.top=`${p.y/H*100}%`;cursor.classList.add('is-visible');stroke(p.x,p.y,last);last=p;
 }
 function reset(index=mission){
  stopNarration();release();clearTimeout(timer);cancelAnimationFrame(frame);frame=0;particles=[];dctx.clearRect(0,0,W,H);
  mission=index;stage=0;busy=false;ready=false;percent=-1;tool='trowel';cursor.innerHTML=TOOL.trowel;
  result.hidden=true;result.innerHTML='';scene.classList.remove('is-revealed');note.hidden=false;
  note.querySelector('span').textContent=t('Đang chuẩn bị hình…');$('[data-image-retry]').hidden=true;
  canvases.forEach((canvas,i)=>{soil(canvas,i);canvas.style.opacity='1';});
  initCells();updateProgress();status();
  root.querySelectorAll('.discovery-missions [data-mission]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.mission)===mission)));
  const version=++objectVersion;object.onload=()=>{if(version!==objectVersion||destroyed)return;ready=true;note.querySelector('span').textContent=t('Chạm và kéo để bắt đầu');status();};
  object.onerror=()=>{if(version!==objectVersion||destroyed)return;ready=false;note.hidden=false;note.querySelector('span').textContent=t('Chưa tải được hình. Kiểm tra kết nối rồi thử lại.');$('[data-image-retry]').hidden=false;status();};
  object.src=artURL(MISSIONS[mission]);if(object.complete&&object.naturalWidth)object.onload();updateFound();
 }
 on(scene,'pointerdown',event=>{
  if(event.target.closest('button')||event.button!==0||!event.isPrimary||!ready||busy)return;
  if(stage===2&&tool!=='brush'){status();return;}
  event.preventDefault();pointer=event.pointerId;scene.setPointerCapture(pointer);scene.focus({preventScroll:true});last=point(event);move(event);
 });
 on(scene,'pointermove',move);on(scene,'pointerup',release);on(scene,'pointercancel',release);on(scene,'lostpointercapture',release);
 on(root,'click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.matches('[data-tool]'))setTool(b.dataset.tool);
  if(b.matches('[data-game-reset]'))reset();
  if(b.matches('[data-mission]')){reset(Number(b.dataset.mission));scene.scrollIntoView({block:'center',behavior:reducedMotion()?'instant':'smooth'});}
  if(b.matches('[data-image-retry]'))reset();
  if(b.matches('[data-game-assist]')){
   if(stage===2&&tool!=='brush'){setTool('brush');}
   const c=cells.find(c=>!c.clean);if(c)stroke(Math.min(W*.88,c.x+W*.38),c.y,c);
  }
 });
 on(scene,'keydown',event=>{if([' ','Enter'].includes(event.key)&&event.target===scene){event.preventDefault();$('[data-game-assist]').click();}});
 on(window,'oceo-before-route-change',release);
 on(document,'visibilitychange',()=>{if(document.hidden){release();cancelAnimationFrame(frame);frame=0;particles=[];dctx.clearRect(0,0,W,H);}});
 on(window,'oceo-language-change',()=>{status();updateFound();if(stage===3)renderResult();else if(ready&&!note.hidden)note.querySelector('span').textContent=t('Chạm và kéo để bắt đầu');});
 reset();
 return {destroy(){destroyed=true;objectVersion++;release();clearTimeout(timer);cancelAnimationFrame(frame);ac.abort();object.onload=null;object.onerror=null;stopNarration();}};
}
