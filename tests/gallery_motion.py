"""Continuous dragging, multi-card momentum and stable DOM across every move."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 for reduced in ['no-preference','reduce']:
  c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion=reduced)
  c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
  q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(origin,wait_until='networkidle')
  q.locator('.header-deck').click();q.locator('#artifact-random').click();surface=q.locator('.artifact-stack');surface.scroll_into_view_if_needed()
  q.evaluate('''()=>{window.originalCards=[...document.querySelectorAll('.artifact-swipe-card')];window.surface=document.querySelector('.artifact-stack');window.galleryMutations=0;new MutationObserver(m=>window.galleryMutations+=m.filter(x=>x.type==='childList').length).observe(window.surface,{childList:true,subtree:true})}''')
  r=surface.bounding_box();x=r['x']+r['width']*.85;y=max(120,r['y']+200)
  def pos():return float(surface.get_attribute('data-position'))
  def settled():q.wait_for_function("()=>Math.abs(Number(document.querySelector('.artifact-stack').dataset.position)-Number(document.querySelector('[data-deck-active]').dataset.galleryIndex))<.002")
  q.mouse.move(x,y);q.mouse.down();q.mouse.move(x-280,y,steps=16);q.wait_for_timeout(40);forward=pos();assert forward>1.5,forward
  q.mouse.move(x-60,y,steps=14);q.wait_for_timeout(40);back=pos();assert back<forward-1,(forward,back)
  q.mouse.move(x-280,y,steps=14);q.wait_for_timeout(110);q.mouse.up();settled()
  assert q.locator('[data-deck-active]').get_attribute('data-gallery-index')=='2'
  # A new touch can grab and reverse the track while it is still coasting.
  q.mouse.move(x,y);q.mouse.down();q.mouse.move(x-270,y,steps=4);q.mouse.up()
  q.wait_for_timeout(50);before=pos()
  q.mouse.move(50,y);q.mouse.down();grabbed=pos();assert abs(grabbed-before)<.7,(grabbed,before)
  q.mouse.move(260,y,steps=12);q.wait_for_timeout(40);assert pos()<grabbed-1
  q.wait_for_timeout(100);q.mouse.up();settled()
  assert q.evaluate('galleryMutations===0&&originalCards.every(c=>c.isConnected)&&surface===document.querySelector(".artifact-stack")')
  # Discrete controls also reuse those nodes, including the last card.
  q.locator('#artifact-next').click();settled()
  assert q.evaluate('galleryMutations===0&&originalCards.every(c=>c.isConnected)')
  selected=q.locator('[data-deck-active]').get_attribute('data-artifact')
  q.locator('#artifact-open').click();expect(q.locator('.artifact-detail')).to_be_visible();q.locator('#artifact-back').click()
  expect(q.locator('[data-deck-active]')).to_have_attribute('data-artifact',selected)
  assert not errors,errors;c.close()
 # Real touch: fast flick crosses several cards; a second touch stops and reverses.
 c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 q=c.new_page();q.goto(origin,wait_until='networkidle');q.locator('.header-deck').click();q.locator('#artifact-random').click();q.locator('.artifact-stack').scroll_into_view_if_needed()
 session=c.new_cdp_session(q);y=max(120,q.locator('.artifact-stack').bounding_box()['y']+200)
 def touch(kind,x=None):session.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[] if x is None else [{'x':x,'y':y,'id':1}]})
 touch('touchStart',330)
 for x in [290,230,170,110,35]:touch('touchMove',x)
 touch('touchEnd');q.wait_for_function("Number(document.querySelector('[data-deck-active]').dataset.galleryIndex)>=2")
 start=float(q.locator('.artifact-stack').get_attribute('data-position'))
 touch('touchStart',45)
 for x in [90,150,220,300]:touch('touchMove',x)
 q.wait_for_timeout(60);assert float(q.locator('.artifact-stack').get_attribute('data-position'))<start-1
 touch('touchEnd');q.locator('#close-modal').click();expect(q.locator('#modal')).to_be_hidden()
 b.close()
print('PASS: multi-card direct manipulation, same-gesture reversal, interruptible momentum, real touch flick, reduced motion, zero card replacement, stable detail return.')
