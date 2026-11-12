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
 for(const kind of ['pass','letter','flight'])for(const locale of ['vi','en','zh'])for(const count of [0,1,4,10,15]){
  const name=count===15?'Nguyễn Người Đi Khám Phá Óc Eo Cùng Những Người Bạn Thân Thiết':'Elio';
  const art=await passArtwork({kind,collection,earned:collection.slice(0,count),name,date:'06/11/2026',locale});
  const doc=new DOMParser().parseFromString(art.svg,'image/svg+xml');
  if(doc.querySelector('parsererror'))throw Error('Malformed export SVG');
  const root=document.importNode(doc.documentElement,true);root.style.cssText='position:fixed;top:0;left:0;z-index:-1;width:1080px;height:1920px';document.body.append(root);
  await document.fonts.ready;
  if(art.width!==1080||art.height!==1920)failures.push({kind,locale,count,dimensions:[art.width,art.height]});
  if(root.querySelectorAll('[data-earned-stamp]').length!==count)throw Error(`Wrong stamp count ${kind} ${count}`);
  const box=root.getBoundingClientRect();
  for(const stamp of root.querySelectorAll('[data-earned-stamp]')){const r=stamp.getBoundingClientRect();if(r.left<box.left-30||r.right>box.right+30||r.top<box.top||r.bottom>box.bottom+20)failures.push({kind,locale,count,site:stamp.dataset.earnedStamp,problem:'stamp outside the image',r:[r.left,r.top,r.right,r.bottom]});}
  if(kind==='pass'){const label=root.querySelector('[data-owner-label]').getBBox(),owner=root.querySelector('[data-owner-name]').getBBox();if(label.y+label.height>owner.y-2)failures.push({kind,locale,count,problem:'owner label/name overlap'});}
  const images=[...root.querySelectorAll('image')];if(images.some(e=>!e.getAttribute('href').startsWith('data:image/')))throw Error('External/missing image in export');
  root.remove();
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
 assert q.evaluate(r'''async()=>{const {passArtwork}=await import('/assets/pass-art.js');const {CURATED}=await import('/assets/content.js');const collection=CURATED.places.filter(p=>p.category==='heritage'&&p.collectible!==false);const a=await passArtwork({kind:'letter',collection,earned:collection,name:'Elio',date:'06/11/2026'});return (a.svg.match(/href="data:image\//g)||[]).length>=5;}''')
 b.close()
print('PASS: pass/letter/flight packages with 0/1/4/10/15 stamps in VI/EN/ZH; valid 1080x1920 SVG, embedded images, stamps inside the frame; 15-stamp raster export; cold offline art load.')
