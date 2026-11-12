"""Stamp desk: earned stamps can be dragged (and moved by keys) without opening the stop; a tap still opens it; the arrangement persists and Tidy up resets it."""
import json
from playwright.sync_api import sync_playwright, expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium')
 c=b.new_context(viewport={'width':390,'height':844},has_touch=False,service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 c.add_init_script("if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('oceo-passport-guest',JSON.stringify({name:'Elio',badges:['chua-linh-son','linh-son-bac','go-giong-cat']}))}")
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(origin+'/#pass',wait_until='networkidle')
 stamps=q.locator('#stamp-desk .desk-stamp');expect(stamps).to_have_count(3)
 expect(q.locator('.ghost-row li')).to_have_count(12)
 s=q.locator('#stamp-desk [data-desk-id=go-giong-cat]');s.scroll_into_view_if_needed();box=s.bounding_box()
 q.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);q.mouse.down();q.mouse.move(box['x']+box['width']/2-60,box['y']+box['height']/2+40,steps=8);q.mouse.up()
 q.wait_for_timeout(100);expect(q.locator('#modal')).not_to_be_visible()
 saved=json.loads(q.evaluate("localStorage.getItem('oceo-stamp-desk-v1')"));assert 'go-giong-cat' in saved,saved
 after=s.bounding_box();assert abs(after['x']-box['x'])>30,(box,after)
 z=int(s.evaluate('e=>e.style.zIndex'));assert z==max(int(x) for x in stamps.evaluate_all('a=>a.map(e=>e.style.zIndex)'))
 # Arrow keys move the focused stamp too.
 before=s.bounding_box()['x'];s.focus();q.keyboard.press('ArrowRight');assert s.bounding_box()['x']>before
 # The arrangement survives a reload and shapes the letter export.
 q.reload(wait_until='networkidle');assert abs(q.locator('#stamp-desk [data-desk-id=go-giong-cat]').bounding_box()['x']-s.bounding_box()['x'])<2
 q.locator('input[name=pack][value=letter]').check(force=True)
 with q.expect_download() as d:q.locator('#save-pass-image').click()
 assert d.value.suggested_filename=='oc-eo-buc-thu.png'
 q.locator('input[name=pack][value=flight]').check(force=True)
 with q.expect_download() as d:q.locator('#save-pass-image').click()
 assert d.value.suggested_filename=='oc-eo-chuyen-bay.png'
 q.locator('#desk-reset').click();assert q.evaluate("localStorage.getItem('oceo-stamp-desk-v1')") is None
 # A plain tap opens the stop.
 q.locator('#stamp-desk [data-desk-id=linh-son-bac]').click(position={'x':20,'y':20},force=True);expect(q.locator('#modal')).to_be_visible()
 assert not errors,errors
 b.close()
print('PASS: drag, keys, persistence, tap-to-open, letter/flight downloads, tidy up.')
