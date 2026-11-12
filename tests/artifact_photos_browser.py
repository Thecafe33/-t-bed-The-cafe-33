"""Verified photos on cards/detail: all locales, source links, sizing and offline cache."""
from playwright.sync_api import sync_playwright, expect
ORIGIN='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(ORIGIN+'/#artifacts',wait_until='networkidle')
 q.evaluate('async()=>{await navigator.serviceWorker.ready}');q.wait_for_function('!!navigator.serviceWorker.controller')
 q.locator('#artifact-view-toggle').click()
 records=q.evaluate("async()=>(await import('/assets/artifacts.js')).ARTIFACTS.filter(a=>a.photo).map(a=>({id:a.id,source:a.photo.sourceUrl}))")
 assert len(records)==7
 for r in records:
  q.locator(f'.artifact-index-cards [data-artifact="{r["id"]}"]').click()
  photo=q.locator('#modal .artifact-photo');img=photo.locator('img')
  expect(photo).to_be_visible();img.evaluate('(img)=>img.decode()')
  assert img.evaluate('(img)=>img.naturalWidth>100&&getComputedStyle(img).objectFit==="contain"')
  expect(photo.locator('a').nth(1)).to_have_attribute('href',r['source'])
  for lang in ['vi','en','zh']:
   q.evaluate("async(lang)=>(await import('/assets/i18n.js')).setLanguage(lang)",lang)
   missing=photo.evaluate("async(el)=>(await import('/assets/i18n.js')).untranslatedUI(el)");assert not missing,(r['id'],lang,missing)
   for width in [320,390]:
    q.set_viewport_size({'width':width,'height':844})
    assert q.locator('#modal').evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'),(r['id'],lang,width)
   assert photo.evaluate('(el)=>el.getBoundingClientRect().bottom<=el.parentElement.getBoundingClientRect().bottom+1')
  q.evaluate("async()=>(await import('/assets/i18n.js')).setLanguage('vi')")
  if r['id']=='mo-vo-cay-tram':q.screenshot(path='/workspace/outputs/artifact-jar-photo-mobile.png')
  q.locator('#modal [data-action="artifacts"]').click()
 # Active gallery image/card controls must remain within the card at narrow widths.
 q.locator('#artifact-view-toggle').click()
 if q.locator('#artifact-random').get_attribute('aria-pressed')=='true':q.locator('#artifact-random').click()
 for width in [320,390]:
  q.set_viewport_size({'width':width,'height':844})
  card=q.locator('[data-deck-active]');card.locator('img').evaluate('(img)=>img.decode()')
  assert card.evaluate('e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll(".artifact-photo,.artifact-swipe-title,.artifact-swipe-open")].every(c=>c.getBoundingClientRect().bottom<=r.bottom+1)}')
 q.screenshot(path='/workspace/outputs/artifact-photo-deck-mobile.png')
 c.set_offline(True);q.reload(wait_until='domcontentloaded');q.locator('#artifact-view-toggle').click()
 q.locator('.artifact-index-cards [data-artifact="mo-vo-cay-tram"]').click();q.locator('#modal .artifact-photo img').evaluate('(img)=>img.decode()')
 assert not errors,errors
 b.close()
print('PASS: seven real photo assets, translated captions and alt text, mobile layout, gallery sizing, source links and offline cached image.')
