"""Raster export and font-aware geometry of the cultural Pass, including offline."""
from pathlib import Path
from playwright.sync_api import sync_playwright
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 q=c.new_page();q.goto(origin,wait_until='networkidle')
 result=q.evaluate('''async()=>{
 const {CURATED}=await import('/assets/content.js');const {passArtwork}=await import('/assets/pass-art.js');
 const collection=CURATED.places.filter(p=>p.category==='heritage'&&p.collectible!==false),failures=[];
 for(const locale of ['vi','en','zh'])for(const count of [0,1,4,10,15]){
  const name=count===15?'Nguyễn Người Đi Khám Phá Óc Eo Cùng Những Người Bạn Thân Thiết':'Elio';
  const art=await passArtwork({collection,earned:collection.slice(0,count),name,date:'06/11/2026',locale});
  const doc=new DOMParser().parseFromString(art.svg,'image/svg+xml');
  if(doc.querySelector('parsererror'))throw Error('Malformed export SVG');
  const root=document.importNode(doc.documentElement,true);root.style.cssText='position:fixed;top:0;left:0;z-index:-1';document.body.append(root);
  await document.fonts.ready;
  if(art.width!==1080||art.height!==1920)failures.push({locale,count,dimensions:[art.width,art.height]});
  if(root.querySelectorAll('[data-earned-stamp]').length!==count)throw Error('Wrong stamp count');
  const ownerLabel=root.querySelector('[data-owner-label]').getBBox(),ownerName=root.querySelector('[data-owner-name]').getBBox();if(ownerLabel.y+ownerLabel.height>ownerName.y-2)failures.push({locale,count,problem:'owner label/name overlap'});
  for(const stamp of root.querySelectorAll('[data-earned-stamp]')){
   const caption=stamp.querySelector('[data-stamp-caption]').getBBox(),names=[...stamp.querySelectorAll('[data-stamp-name]')].map(e=>e.getBBox());
   if(caption.y+caption.height>names[0].y-2)failures.push({locale,count,site:stamp.dataset.earnedStamp,problem:'caption/name overlap',caption:{y:caption.y,h:caption.height},names:names.map(r=>({y:r.y,h:r.height}))});
   const path=stamp.querySelector('use'),frame=root.querySelector(path.getAttribute('href')).getBBox();
   for(const text of stamp.querySelectorAll('text')){const r=text.getBBox();if(r.x<12||r.x+r.width>frame.width-12||r.y<8||r.y+r.height>frame.height-10)failures.push({locale,count,site:stamp.dataset.earnedStamp,text:text.textContent,problem:'text exceeds paper',r,frame});}
  }
  const images=[...root.querySelectorAll('image')];if(!images.length||images.some(e=>!e.getAttribute('href').startsWith('data:image/')))throw Error('External/missing image in export');
  root.remove();
  // Full 15-stop image must really decode, draw and export, not just have a valid DOM.
  if(count===15){const url=URL.createObjectURL(new Blob([art.svg],{type:'image/svg+xml'})),image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=art.width;canvas.height=art.height;canvas.getContext('2d').drawImage(image,0,0);if(!canvas.toDataURL('image/png').startsWith('data:image/png'))throw Error('Raster export');URL.revokeObjectURL(url);}
 }
 return failures;
}''')
 assert not result,result
 c.close()
 # A cold module load while offline still has the complete imagery, not only the text.
 c=b.new_context(viewport={'width':390,'height':844})
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 q=c.new_page();q.goto(origin,wait_until='networkidle');q.evaluate('async()=>{await navigator.serviceWorker.ready}');q.wait_for_function('!!navigator.serviceWorker.controller')
 c.set_offline(True);q.reload(wait_until='domcontentloaded')
 assert q.evaluate(r'''async()=>{const {passArtwork}=await import('/assets/pass-art.js');const {CURATED}=await import('/assets/content.js');const collection=CURATED.places.filter(p=>p.category==='heritage'&&p.collectible!==false);const a=await passArtwork({collection,earned:collection,name:'Elio',date:'06/11/2026'});return (a.svg.match(/href="data:image\//g)||[]).length>=5;}''')
 b.close()
print('PASS: 0/1/4/10/15 stamps in VI/EN/ZH; valid 1080x1920 SVG, embedded image assets, non-overlapping captions/names and paper bounds; 15-stamp raster export; cold offline art load.')
