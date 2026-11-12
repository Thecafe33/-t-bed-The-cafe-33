"""The collection is a shareable page; detail returns to unchanged cards."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(origin,wait_until='networkidle')
 q.locator('.header-deck').click();expect(q).to_have_url(origin+'/#artifacts');expect(q.locator('#view-artifacts')).to_be_visible();expect(q.locator('#modal')).to_be_hidden()
 expect(q.locator('.app-view:visible')).to_have_count(1);expect(q.locator('#artifacts-heading')).to_be_focused();expect(q.locator('.header-deck')).to_have_attribute('aria-current','page')
 q.locator('#artifact-random').click();q.locator('[data-deck-active]').press('ArrowRight');expect(q.locator('[data-deck-active]')).to_have_attribute('data-gallery-index','1')
 q.locator('[data-deck-active]').scroll_into_view_if_needed();q.evaluate('window.cardBefore=document.querySelector("[data-deck-active]");window.offsetBefore=scrollY')
 q.locator('[data-deck-active]').click();expect(q.locator('#modal')).to_be_visible();q.locator('#artifact-back').click();expect(q.locator('#modal')).to_be_hidden()
 assert q.evaluate('cardBefore===document.querySelector("[data-deck-active]")')
 assert q.evaluate('Math.abs(scrollY-offsetBefore)<2')
 # Buttons and filter still work after closing a detail; no modal-close teardown.
 q.locator('[data-deck-active]').press('ArrowRight');expect(q.locator('[data-deck-active]')).to_have_attribute('data-gallery-index','2')
 q.locator('#artifact-site-filter').select_option('linh-son-bac');expect(q.locator('.artifact-swipe-card')).to_have_count(2)
 selected=q.locator('[data-deck-active]').get_attribute('data-artifact')
 q.go_back();expect(q.locator('#view-explore')).to_be_visible();q.go_forward();expect(q.locator('#view-artifacts')).to_be_visible();expect(q.locator('#artifact-site-filter')).to_have_value('linh-son-bac');expect(q.locator('[data-deck-active]')).to_have_attribute('data-artifact',selected)
 q.reload(wait_until='networkidle');expect(q.locator('#view-artifacts')).to_be_visible();expect(q.locator('#modal')).to_be_hidden()
 for lang in ['vi','en','zh']:
  q.locator('#language-select').select_option(lang)
  for width,height in [(320,568),(390,844),(1440,1000)]:
   q.set_viewport_size({'width':width,'height':height});assert q.evaluate('document.documentElement.scrollWidth<=innerWidth'),(lang,width)
  assert not q.evaluate("async()=>(await import('/assets/i18n.js')).untranslatedUI(document.querySelector('#view-artifacts'))"),lang
 q.set_viewport_size({'width':390,'height':844});q.locator('#language-select').select_option('vi');q.evaluate('scrollTo({top:0,behavior:"instant"})');q.screenshot(path='/workspace/outputs/artifact-page-mobile.png')
 assert not errors,errors;c.close()
 # Direct entry remains part of the offline application.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 q=c.new_page();q.goto(origin+'/#artifacts',wait_until='networkidle');q.evaluate('async()=>{await navigator.serviceWorker.ready}');q.wait_for_function('!!navigator.serviceWorker.controller');c.set_offline(True);q.reload(wait_until='domcontentloaded');expect(q.locator('#view-artifacts')).to_be_visible();expect(q.locator('#modal')).to_be_hidden()
 q.locator('[data-deck-active]').press('ArrowRight');expect(q.locator('[data-deck-active]')).to_have_attribute('data-gallery-index','1')
 b.close()
print('PASS: standalone route, header link, no collection popup, stable detail return, controls, browser Back/Forward, direct reload, three languages, responsive widths and offline entry.')
