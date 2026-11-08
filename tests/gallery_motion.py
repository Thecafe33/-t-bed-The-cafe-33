"""The whole gallery follows the gesture and lands without a position jump."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(origin,wait_until='networkidle');q.locator('.header-deck').click();q.locator('#artifact-random').click()
 q.wait_for_function("[...document.querySelectorAll('.artifact-swipe-card')].every(c=>!c.getAnimations().length)")
 incoming=q.locator('[data-deck-layer="1"]').get_attribute('data-gallery-id')
 q.locator('[data-deck-active]').scroll_into_view_if_needed()
 initial=q.locator('[data-deck-layer="1"]').evaluate('e=>getComputedStyle(e).transform')
 box=q.locator('[data-deck-active]').bounding_box();x=box['x']+box['width']/2;y=max(100,box['y']+box['height']*.4)
 q.mouse.move(x,y);q.mouse.down();q.mouse.move(x-110,y,steps=10)
 q.wait_for_function("old=>getComputedStyle(document.querySelector('[data-deck-layer=\"1\"]')).transform!==old",arg=initial)
 assert q.locator('[data-deck-active]').evaluate('e=>new DOMMatrix(getComputedStyle(e).transform).m13')!=0
 q.mouse.up()
 q.evaluate('''()=>{window.galleryLanding={};for(const c of document.querySelectorAll('.artifact-swipe-card')){const a=c.getAnimations()[0];if(a){a.pause();a.currentTime=619;window.galleryLanding[c.dataset.galleryId]=c.getBoundingClientRect().toJSON();}}}''')
 before=q.evaluate('(id)=>window.galleryLanding[id]',incoming)
 q.evaluate("()=>{for(const c of document.querySelectorAll('.artifact-swipe-card'))for(const a of c.getAnimations())a.finish()}")
 expect(q.locator('[data-deck-active]')).to_have_attribute('data-artifact',incoming)
 after=q.locator('[data-deck-active]').bounding_box()
 assert abs(before['x']-after['x'])<2 and abs(before['width']-after['width'])<2,(before,after)
 expect(q.locator('[data-deck-layer="-1"][inert]')).to_have_count(1)
 # Cancel while cards are moving, then reopen: no detached animation or stuck controls.
 q.locator('#artifact-next').click();q.locator('#close-modal').click();q.locator('.header-deck').click()
 q.locator('#artifact-next').click();expect(q.locator('[data-deck-active]')).not_to_have_attribute('data-artifact',incoming)
 q.locator('#artifact-open').click();expect(q.locator('.artifact-detail')).to_be_visible()
 assert not errors,errors
 b.close()
print('PASS: neighbours track the drag, perspective turns, incoming card lands continuously, previous preview stays inert, close/reopen cancels motion safely.')
