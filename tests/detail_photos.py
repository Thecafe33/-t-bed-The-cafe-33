"""Real and extreme-ratio photos must never overlap a detail's credit or text."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(service_workers='block',reduced_motion='reduce',viewport={'width':390,'height':844})
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(origin,wait_until='networkidle')
 ids=page.evaluate("async()=>{const {CURATED}=await import('/assets/content.js');return CURATED.places.filter(p=>p.image).map(p=>p.id)}")
 assert len(ids)>=3
 def contained():
  result=page.locator('.detail-illustration').evaluate('''frame=>{
   const img=frame.querySelector('img'),f=frame.getBoundingClientRect(),i=img.getBoundingClientRect();
   const below=[...document.querySelectorAll('.photo-credit,.detail-hook,.detail-description')].map(e=>e.getBoundingClientRect().top);
   return {inside:i.top>=f.top-.5&&i.bottom<=f.bottom+.5&&i.left>=f.left-.5&&i.right<=f.right+.5,below:below.every(y=>y>=i.bottom-.5),imageHeight:i.height,frameHeight:f.height};
  }''')
  assert result['inside'] and result['below'],result
  assert 0<result['imageHeight']<=360.5,result
  assert page.locator('#modal').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
 for width,height in [(320,568),(390,844),(768,600),(1440,900)]:
  page.set_viewport_size({'width':width,'height':height})
  for id in ids:
   page.evaluate('id=>document.querySelector(".place-art[data-place=\\\""+id+"\\\"]").click()',id)
   image=page.locator('.detail-illustration img');expect(image).to_be_visible();image.evaluate('e=>e.decode()');contained()
   if id=='chua-linh-son' and width==390:page.screenshot(path='/workspace/outputs/oc-eo-detail-photo-fixed.png')
   page.locator('#close-modal').click()
 # Portrait upload/remote content should also reserve its own box instead of intrinsic-height overflow.
 c.route('**/assets/photos/chua-linh-son.jpg',lambda r:r.fulfill(status=200,content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="2400"><rect width="100" height="2400" fill="#c8d8aa"/></svg>'))
 page.goto(origin+'/?place=chua-linh-son',wait_until='networkidle');page.locator('.detail-illustration img').evaluate('e=>e.decode()');assert page.locator('.detail-illustration img').evaluate('e=>e.naturalHeight')==2400;contained()
 expect(page.locator('.photo-credit')).to_contain_text('CC BY-SA 3.0')
 # No-photo sites keep their compact icon layout.
 page.locator('#close-modal').click();page.locator('.place-art[data-place=go-sau-thuan]').click()
 expect(page.locator('.detail-illustration img')).to_have_count(0);expect(page.locator('.detail-illustration>.icon')).to_be_visible()
 assert page.locator('.detail-illustration').bounding_box()['height']==180
 assert not errors,errors
 b.close()
print('PASS: every destination photo at 4 phone/desktop sizes plus an extreme portrait stays inside its frame and above credits/headings/text; attribution and no-photo icon layout preserved. No live writes.')
