#!/usr/bin/env python3
from pathlib import Path
import base64,json,struct,argparse
from datetime import datetime
from zoneinfo import ZoneInfo
parser=argparse.ArgumentParser(description='Render the explicitly labelled Elio sample, without profile/GPS writes. Start tools/dev_server.py first.');parser.add_argument('--base-url',default='http://127.0.0.1:8000/');parser.add_argument('--date',default=datetime.now(ZoneInfo('Asia/Ho_Chi_Minh')).strftime('%d/%m/%Y'));args=parser.parse_args();base=args.base_url.rstrip('/')+'/'
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent;out=root/'assets/previews';out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(service_workers='block',viewport={'width':390,'height':844})
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
 page=c.new_page();page.goto(base+'index.html',wait_until='networkidle')
 result=page.evaluate('''async(date)=>{
 const {CURATED}=await import(new URL('assets/content.js',location.href));const {passArtwork}=await import(new URL('assets/pass-art.js',location.href));
 const ids=['nha-trung-bay-van-hoa-oc-eo','chua-linh-son','linh-son-nam','go-sau-thuan','go-cay-thi','go-giong-cat','nha-trung-bay-cu-ba-the','linh-son-bac','go-giong-trom','go-ut-trach'];
 const byId=new Map(CURATED.places.map(p=>[p.id,p]));
 const collection=CURATED.places.filter(p=>p.category==='heritage'&&p.id!=='go-cay-tram');
 const earned=ids.map(id=>byId.get(id));
 if(collection.length!==15||earned.length!==10||new Set(ids).size!==10)throw Error('Preview counts');
 const {svg,width,height}=await passArtwork({collection,earned,name:'Elio',date,locale:'vi'});
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
 const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(image,0,0);URL.revokeObjectURL(url);
 return {png:canvas.toDataURL('image/png').split(',')[1],width,height,ids,names:earned.map(p=>p.name),stamps:(svg.match(/data-earned-stamp=/g)||[]).length};
}''',args.date)
 path=out/'oc-eo-pass-elio-heritage-v2.png';path.write_bytes(base64.b64decode(result.pop('png')))
 assert struct.unpack('>II',path.read_bytes()[16:24])==(1080,1920)
 assert result['stamps']==10
 (out/'elio-heritage-preview.json').write_text(json.dumps({**result,'date':args.date,'previewOnly':True},ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({**result,'file':str(path),'bytes':path.stat().st_size},ensure_ascii=False));b.close()
