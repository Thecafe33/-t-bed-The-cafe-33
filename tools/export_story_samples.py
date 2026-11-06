"""Render clearly labelled, local-only 3-language story samples. Start the dev server on port8000 first."""
from pathlib import Path
import base64,json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto('http://127.0.0.1:8000',wait_until='networkidle')
 for locale in ['vi','en','zh']:
  result=q.evaluate('''async(locale)=>{
   const {renderStoryArtwork}=await import('/assets/story-art.js');const {CURATED}=await import('/assets/content.js');
   const p=CURATED.places.find(p=>p.id==='nha-trung-bay-van-hoa-oc-eo');const image=new Image();image.src='/assets/photos/ba-the.jpg';await image.decode();
   const a=await renderStoryArtwork({photo:image,places:[p],featured:p,name:'Elio',caption:'Bùi Thụy Đào Nguyên · CC BY-SA 3.0',locale,includeFact:true,demo:true,journeyURL:'https://thecafe33.github.io/-t-bed-The-cafe-33/index.html?journey=theo-dau-co-vat-v1#day'});
   return a.canvas.toDataURL('image/webp',.9).split(',')[1];
  }''',locale)
  path=root/'assets/previews'/f'oc-eo-personal-story-{locale}.webp';path.write_bytes(base64.b64decode(result));print(path.name,path.stat().st_size)
 print('Runtime errors:',errors);assert not errors
 b.close()
