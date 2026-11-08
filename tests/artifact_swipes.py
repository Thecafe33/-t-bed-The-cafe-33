"""Persistent gallery controls, filtering, languages, offline and profile isolation."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('window.__audioCreated=0;const Base=window.AudioContext;if(Base)window.AudioContext=class extends Base{constructor(...args){super(...args);window.__audioCreated++}}')
 page.goto(origin,wait_until='networkidle');profile=page.evaluate("localStorage.getItem('oceo-passport-guest')")
 page.locator('.artifact-launch').click();expect(page.locator('.artifact-swipe-card')).to_have_count(9)
 expect(page.locator('.artifact-swipe-card[aria-hidden=true][inert]')).to_have_count(8)
 page.locator('#artifact-random').click();expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','nandin-giong-cat')
 def at(index):expect(page.locator('[data-deck-active]')).to_have_attribute('data-gallery-index',str(index))
 def current():return page.locator('[data-deck-active]').get_attribute('data-artifact')
 seen=[current()]
 for index in range(1,9):
  page.locator('#artifact-next').click();at(index);seen.append(current())
 assert len(set(seen))==9
 expect(page.locator('#artifact-next')).to_be_disabled();expect(page.locator('[data-deck-active]')).to_have_count(1)
 page.locator('#artifact-previous').click();at(7)
 page.keyboard.press('ArrowLeft');at(6);page.keyboard.press('ArrowRight');at(7)
 page.locator('#artifact-open').click();expect(page.locator('.artifact-detail')).to_be_visible();page.locator('#artifact-back').click();at(7)
 page.locator('#artifact-shuffle').click();at(0);assert current()!=seen[7]
 page.locator('#artifact-site-filter').select_option('go-giong-cat');expect(page.locator('.artifact-swipe-card')).to_have_count(1)
 expect(page.locator('#artifact-next')).to_be_disabled();expect(page.locator('#artifact-previous')).to_be_disabled();expect(page.locator('#artifact-random')).to_be_disabled()
 page.locator('#artifact-site-filter').select_option('all');old=current();page.locator('#artifact-view-toggle').click();expect(page.locator('.artifact-index .artifact-card')).to_have_count(9)
 page.locator('#artifact-view-toggle').click();assert current()==old
 assert page.evaluate("localStorage.getItem('oceo-passport-guest')")==profile
 assert page.evaluate('window.__audioCreated')==0
 page.locator('#close-modal').click();page.locator('#language-select').select_option('zh');page.locator('.artifact-launch').click()
 for width,height in [(320,568),(390,844)]:
  page.set_viewport_size({'width':width,'height':height});page.locator('#artifact-shuffle').click();at(0)
  for index in range(9):
   assert page.locator('[data-deck-active]').evaluate('e=>{const f=e.getBoundingClientRect();return [...e.querySelectorAll(".artifact-swipe-title,.artifact-swipe-place,.artifact-swipe-open")].every(c=>{const b=c.getBoundingClientRect();return b.top>=f.top-1&&b.bottom<=f.bottom+1})}'),(width,index)
   if index<8:page.locator('#artifact-next').click();at(index+1)
  assert not page.evaluate("async()=>(await import('/assets/i18n.js')).untranslatedUI(document.querySelector('#modal'))")
 assert not errors,errors;c.close()
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(origin,wait_until='networkidle');page.evaluate('async()=>{await navigator.serviceWorker.ready}');page.wait_for_function('!!navigator.serviceWorker.controller')
 c.set_offline(True);page.reload(wait_until='domcontentloaded');page.locator('.artifact-launch').click();old=current();page.locator('#artifact-next').click();assert current()!=old
 page.locator('#artifact-open').click();expect(page.locator('.artifact-detail')).to_be_visible();assert not errors,errors
 b.close()
print('PASS: persistent finite gallery, last-card rest, controls and keyboard, filtering/shuffle/list, detail return, Chinese phone fit, muted default, offline and profile isolation.')
