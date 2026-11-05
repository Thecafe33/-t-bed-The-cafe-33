"""Regression for map controls painting above the sticky header; compact search UX."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(origin+'/#map',wait_until='networkidle');expect(page.locator('.townwalk-cartography svg').first).to_be_visible()
 expect(page.locator('#map-search')).not_to_be_visible();expect(page.locator('#toggle-map-search')).to_have_attribute('aria-expanded','false')
 page.screenshot(path='/workspace/outputs/oc-eo-map-clean-controls.png')
 for width,height in [(320,568),(390,844),(768,600),(1440,600),(1440,900)]:
  page.set_viewport_size({'width':width,'height':height});page.evaluate('scrollTo(0,0)')
  page.locator('#toggle-map-search').click();expect(page.locator('#map-search')).to_be_focused()
  for zoom in page.locator('.leaflet-control-zoom a:visible').all():
   assert zoom.evaluate('e=>{const b=e.getBoundingClientRect(),p=document.querySelector("#map-search-panel").getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2;return !(x>p.left&&x<p.right&&y>p.top&&y<p.bottom)||!!document.elementFromPoint(x,y)?.closest("#map-search-panel")}'),(width,height,'zoom over search')
  for scroll in [0,90,155,230]:
   page.evaluate('y=>scrollTo(0,y)',scroll)
   for selector in ['.app-header .brand','#language-select','#sound-toggle','#account-button']:
    assert page.locator(selector).evaluate('e=>{const b=e.getBoundingClientRect();return !!document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest(".app-header")}'),(width,height,scroll,selector)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.keyboard.press('Escape');expect(page.locator('#map-search-panel')).not_to_be_visible();page.evaluate('scrollTo(0,0)')
 page.set_viewport_size({'width':390,'height':844})
 page.locator('#toggle-map-search').click();page.locator('#map-search').fill('go 6 thuan')
 expect(page.locator('.map-search-result')).to_have_count(1);expect(page.locator('.map-search-result')).to_contain_text('Gò Sáu Thuận')
 page.locator('.map-search-result').click();expect(page.locator('#modal')).to_be_visible();expect(page.locator('#checkin')).to_be_disabled();expect(page.locator('#map-search-panel')).not_to_be_visible();page.locator('#close-modal').click()
 page.locator('#toggle-map-search').click();page.locator('#clear-map-search').click();expect(page.locator('#map-search')).to_have_value('')
 expect(page.locator('#toggle-map-search')).to_have_attribute('data-search-active','false')
 page.locator('#map-search').fill('xofa');page.screenshot(path='/workspace/outputs/oc-eo-map-new-search.png');page.locator('.map-search-result').click()
 expect(page.locator('#map-selection h2')).to_have_text('XOFA coffee & tea');expect(page.locator('#modal')).not_to_be_visible();expect(page.locator('#toggle-map-search')).to_be_focused()
 page.locator('#toggle-map-search').click();page.keyboard.press('Escape');expect(page.locator('#toggle-map-search')).to_be_focused();expect(page.locator('#map-search')).to_have_value('xofa')
 page.locator('#toggle-map-search').click();page.locator('[data-map-category=rest]').click();expect(page.locator('#map-search-panel')).not_to_be_visible()
 page.locator('#language-select').select_option('en');page.locator('#toggle-map-search').click();expect(page.locator('.map-search-heading')).to_contain_text('Where would you like to go?')
 page.locator('#language-select').select_option('zh');expect(page.locator('.map-search-heading')).to_contain_text('想去哪里');page.keyboard.press('Escape')
 assert not errors,errors
 b.close()
print('PASS: controls stay below header at 5 viewport sizes and 4 scroll positions, compact closed search, focus/Escape/outside close, direct results for mapped/pending places, clear/retained query, three languages. No live writes.')
