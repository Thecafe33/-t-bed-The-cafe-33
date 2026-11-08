"""Real mouse/touch gestures, finite shuffle, history and accessible alternatives."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('window.__audioCreated=0;const Base=window.AudioContext;if(Base)window.AudioContext=class extends Base{constructor(...args){super(...args);window.__audioCreated++}}')
 page.goto(origin,wait_until='networkidle');profile=page.evaluate("localStorage.getItem('oceo-passport-guest')")
 page.locator('.artifact-launch').click();expect(page.locator('.artifact-swipe-card')).to_have_count(4);expect(page.locator('[data-deck-active]')).to_have_count(1)
 expect(page.locator('.artifact-swipe-card[aria-hidden=true][inert]')).to_have_count(3)
 expect(page.locator('#artifact-random')).to_have_attribute('aria-pressed','true')
 page.locator('#artifact-random').click();expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','nandin-giong-cat')
 def current():return page.locator('[data-deck-active]').get_attribute('data-artifact')
 def drag(dx,dy=0):
  box=page.locator('[data-deck-active]').bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']*.45
  page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+dx,y+dy,steps=8);page.mouse.up()
 drag(20);expect(page.locator('#modal')).to_have_attribute('data-view','artifacts');assert current()=='nandin-giong-cat'
 drag(3,90);expect(page.locator('#modal')).to_have_attribute('data-view','artifacts');assert current()=='nandin-giong-cat'
 drag(-155);expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','phat-linh-son-bac')
 drag(150);expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','nandin-giong-cat')
 drag(-150);expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','phat-linh-son-bac')
 drag(-150);expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','dau-phat-naga')
 page.locator('#artifact-open').click();expect(page.locator('.artifact-origin h3')).to_have_text('Linh Sơn Bắc')
 page.locator('#modal [data-action=artifacts]').click();assert current()=='dau-phat-naga';expect(page.locator('#artifact-deck-progress')).to_have_text('Thẻ 3 / 9')
 page.locator('#artifact-previous').click();expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','phat-linh-son-bac')
 page.keyboard.press('ArrowLeft');expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','nandin-giong-cat')
 page.keyboard.press('ArrowRight');expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','phat-linh-son-bac');expect(page.locator('#artifact-next')).to_be_focused()
 old=current();page.locator('#artifact-shuffle').click();assert current()!=old;expect(page.locator('#artifact-deck-progress')).to_have_text('Thẻ 1 / 9')
 page.locator('#artifact-random').click();seen=[]
 for index in range(9):
  seen.append(current());page.locator('#artifact-next').click()
  expect(page.locator('#artifact-deck-progress')).to_have_text(f'Thẻ {min(index+2,9)} / 9')
  if index==8:expect(page.locator('.artifact-deck-end')).to_be_visible()
 assert len(set(seen))==9,seen
 expect(page.locator('#artifact-next')).to_be_disabled();expect(page.locator('[data-deck-active]')).to_have_count(0)
 page.locator('#artifact-previous').click();expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact',seen[-1])
 page.locator('#artifact-next').click();expect(page.locator('.artifact-deck-end')).to_be_visible();page.locator('#artifact-open').click();assert current()!=seen[-1]
 page.locator('#artifact-site-filter').select_option('go-giong-cat');expect(page.locator('.artifact-swipe-card')).to_have_count(1);expect(page.locator('#artifact-random')).to_be_disabled()
 page.locator('#artifact-next').click();expect(page.locator('.artifact-deck-end')).to_be_visible();page.locator('#artifact-previous').click();expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','nandin-giong-cat')
 page.locator('#artifact-site-filter').select_option('all');old=current();page.locator('#artifact-view-toggle').click();expect(page.locator('.artifact-index .artifact-card')).to_have_count(9)
 page.locator('#artifact-view-toggle').click();assert current()==old
 assert page.evaluate("localStorage.getItem('oceo-passport-guest')")==profile
 assert page.evaluate('window.__audioCreated')==0
 page.locator('#close-modal').click();page.locator('#language-select').select_option('zh');page.locator('.artifact-launch').click()
 # All text stays within the physical top card at short phone and normal sizes.
 page.locator('#artifact-random').click() if page.locator('#artifact-random').get_attribute('aria-pressed')=='true' else None
 pending=set()
 for width,height in [(320,568),(390,844)]:
  page.set_viewport_size({'width':width,'height':height})
  for _ in range(9):
   assert page.locator('[data-deck-active]').evaluate('e=>{const f=e.getBoundingClientRect();return [...e.querySelectorAll(".artifact-swipe-title,.artifact-swipe-place,.artifact-swipe-open")].every(c=>{const b=c.getBoundingClientRect();return b.top>=f.top-1&&b.bottom<=f.bottom+1})}'),(width,height,current())
   pending.update(page.evaluate("async()=>{const m=await import('/assets/i18n.js');return m.untranslatedUI()}"))
   previous_id=current();page.locator('#artifact-next').click()
   page.wait_for_function("old=>!!document.querySelector('.artifact-deck-end')||document.querySelector('[data-deck-active]')?.dataset.artifact!==old",arg=previous_id)
   if page.locator('.artifact-deck-end').count():break
  page.locator('#artifact-open').click();expect(page.locator('[data-deck-active]')).to_have_count(1)
 assert not pending,sorted(pending)
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path='/workspace/outputs/oc-eo-artifact-stack-chinese.png')
 assert not errors,errors
 c.close()
 # Real touch events: horizontal advance, vertical scrolling and touch cancellation.
 c=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,service_workers='block',reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(origin,wait_until='networkidle');page.locator('.artifact-launch').click();page.locator('#artifact-random').click()
 session=c.new_cdp_session(page)
 def touch(dx,dy=0,cancel=False):
  box=page.locator('[data-deck-active]').bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']*.4
  session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]})
  for i in range(1,7):session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+dx*i/6,'y':y+dy*i/6,'id':1}]})
  session.send('Input.dispatchTouchEvent',{'type':'touchCancel' if cancel else 'touchEnd','touchPoints':[]})
 touch(-135);expect(page.locator('[data-deck-active]')).to_have_attribute('data-artifact','phat-linh-son-bac')
 touch(135,cancel=True);assert current()=='phat-linh-son-bac'
 touch(0,-85);assert current()=='phat-linh-son-bac';expect(page.locator('#modal')).to_have_attribute('data-view','artifacts')
 assert page.locator('[data-deck-active]').evaluate('e=>e.getAnimations().length')==0
 assert not errors,errors
 c.close()
 # Default stack and its interactions are part of the offline app, too.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(origin,wait_until='networkidle')
 page.evaluate('async()=>{await navigator.serviceWorker.ready}');page.wait_for_function('!!navigator.serviceWorker.controller')
 c.set_offline(True);page.reload(wait_until='domcontentloaded');page.locator('.artifact-launch').click();before_id=current()
 page.locator('#artifact-next').click();expect(page.locator('[data-deck-active]')).not_to_have_attribute('data-artifact',before_id);page.locator('#artifact-open').click();expect(page.locator('.artifact-detail')).to_be_visible()
 assert not errors,errors
 b.close()
print('PASS: layered accessible stack; true mouse/touch swipes; short/vertical/cancel guards; ordered/random finite rounds, replay/history/filter/list; detail return; keyboard; Chinese short-phone fit; muted default and reduced motion. No profile/cloud writes.')
