"""Phone sheets retain the card context; facts and optional photos never overlap."""
from playwright.sync_api import sync_playwright, expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(origin,wait_until='networkidle');profile=q.evaluate("localStorage.getItem('oceo-passport-guest')")
 for lang in ['vi','en','zh']:
  q.locator('#language-select').select_option(lang);q.locator('.artifact-launch').click()
  if q.locator('#artifact-random').get_attribute('aria-pressed')=='true':q.locator('#artifact-random').click()
  for w,h in [(320,568),(390,844),(430,932)]:
   q.set_viewport_size({'width':w,'height':h})
   box=q.locator('#modal').bounding_box();assert box=={'x':0,'y':0,'width':w,'height':h},box
   for i in range(9):
    card=q.locator('[data-deck-active]')
    assert card.evaluate("""e=>{const f=e.getBoundingClientRect();return [...e.querySelectorAll('.artifact-swipe-title,.artifact-swipe-period,.artifact-swipe-material,.artifact-swipe-story,.artifact-swipe-place,.artifact-swipe-open')].every(c=>{const r=c.getBoundingClientRect();return c.textContent.trim()&&r.top>=f.top-1&&r.bottom<=f.bottom+1})}"""),(lang,w,i)
    q.locator('#artifact-next').click()
   q.locator('#artifact-open').click()
  q.set_viewport_size({'width':390,'height':844})
  q.locator('#artifact-site-filter').select_option('linh-son-bac');q.locator('#artifact-next').click()
  before=q.locator('[data-deck-active]').get_attribute('data-artifact')
  for action in ['back','x','escape']:
   q.locator('#artifact-open').click();expect(q.locator('#artifact-back')).to_be_focused()
   q.locator('#modal-body').evaluate('e=>e.scrollTop=e.scrollHeight')
   assert q.locator('#artifact-back').bounding_box()['y']<70
   if action=='back':q.locator('#artifact-back').click()
   elif action=='x':q.locator('#close-modal').click()
   else:q.keyboard.press('Escape')
   expect(q.locator('#modal')).to_have_attribute('data-view','artifacts')
   assert q.locator('[data-deck-active]').get_attribute('data-artifact')==before
   expect(q.locator('#artifact-site-filter')).to_have_value('linh-son-bac')
  q.locator('#artifact-site-filter').select_option('all');q.locator('#close-modal').click()
  assert not q.locator('#modal').evaluate('e=>e.open')
 # An approved exact-object photo gets a bounded contain frame and its credit.
 # Fixture is synthetic and never added to the public catalogue.
 q.route('**/assets/photo-fixture.svg',lambda r:r.fulfill(content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" width="100" height="1400"><rect width="100" height="1400" fill="gold"/></svg>'))
 q.locator('#language-select').select_option('vi');q.locator('.artifact-launch').click()
 q.evaluate("""async()=>{const {ARTIFACTS}=await import('/assets/artifacts.js');const {artifactStackHTML}=await import('/assets/artifact-view.js');const {CURATED}=await import('/assets/content.js');const a=ARTIFACTS[0];a.photo={url:'assets/photo-fixture.svg',alt:'Test portrait',credit:'Fixture author',license:'CC0',approved:true};document.querySelector('#artifact-presentation').innerHTML=artifactStackHTML({order:[a.id],index:0,current:a.id,total:1},CURATED.places);delete a.photo;}""")
 expect(q.locator('.artifact-photo img')).to_have_attribute('alt','Test portrait')
 assert q.locator('.artifact-photo img').evaluate("e=>getComputedStyle(e).objectFit")=='contain'
 assert q.locator('[data-deck-active]').evaluate("e=>{const f=e.getBoundingClientRect(),a=e.querySelector('.artifact-photo').getBoundingClientRect(),s=e.querySelector('.artifact-swipe-story').getBoundingClientRect();return a.bottom<s.top&&s.bottom<f.bottom}")
 expect(q.locator('.artifact-photo small')).to_have_text('Fixture author · CC0')
 assert q.evaluate("localStorage.getItem('oceo-passport-guest')")==profile
 assert not errors,errors
 b.close()
print('PASS: full-screen phone sheets at 3 sizes and 3 languages; all 9 card facts fit; top back/X/Escape preserve cursor and filter; root X closes; optional portrait photo stays bounded and credited. No profile writes.')
