from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 for motion in ['no-preference','reduce']:
  c=b.new_context(service_workers='block',viewport={'width':390,'height':844},reduced_motion=motion)
  c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
  q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(origin,wait_until='networkidle')
  brand=q.locator('.app-header .brand');dialog=q.locator('#quick-navigation')
  def tap_brand():
   q.evaluate("()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))")
   # Keyboard focus reveals chrome that is intentionally hidden after scrolling.
   if q.locator('html').evaluate("e=>e.classList.contains('navigation-concealed')"):
    brand.evaluate('e=>{e.blur();e.focus({preventScroll:true})}')
    q.wait_for_function("document.querySelector('.app-header').getBoundingClientRect().top>=-1")
   rect=brand.bounding_box();q.mouse.click(rect['x']+rect['width']/2,rect['y']+rect['height']/2)
  brand.click();expect(dialog).to_be_visible();expect(q.locator('[data-quick-route=explore]')).to_be_focused()
  q.keyboard.press('Escape');expect(dialog).to_be_hidden();expect(brand).to_be_focused()
  # A single travelling mark starts exactly on the hidden header mark and grows
  # while turning. The original must not keep animating independently.
  if motion=='no-preference':
   result=q.evaluate('''()=>{
    const source=document.querySelector('.app-header .brand-mark'),from=source.getBoundingClientRect();
    document.querySelector('.app-header .brand').click();
    const moving=document.querySelector('.quick-nav-brand'),flight=moving.getAnimations()[0];
    flight.pause();flight.currentTime=0;const start=moving.getBoundingClientRect();
    flight.currentTime=380;const middle=moving.getBoundingClientRect(),matrix=new DOMMatrix(getComputedStyle(moving).transform);
    return {from:{x:from.x,y:from.y,width:from.width},start:{x:start.x,y:start.y,width:start.width},grown:middle.width,rotation:matrix.b,hidden:getComputedStyle(source.closest('.brand')).opacity,originalAnimations:source.getAnimations().length};
   }''')
   assert result['hidden']=='0' and result['originalAnimations']==0,result
   assert abs(result['from']['x']-result['start']['x'])<2 and abs(result['from']['y']-result['start']['y'])<2,result
   assert abs(result['from']['width']-result['start']['width'])<2 and result['grown']>result['from']['width']*2,result
   assert abs(result['rotation'])>.1,result
   q.keyboard.press('Escape')
  if motion=='no-preference':
   brand.click()
   assert q.locator('.quick-nav-brand .brand-mark').evaluate('e=>e.getAnimations().some(a=>a.effect.getTiming().iterations===Infinity)')
   q.wait_for_timeout(900)
   spin=q.locator('.quick-nav-brand .brand-mark').evaluate('e=>e.getAnimations()[0].currentTime')
   q.wait_for_timeout(100)
   assert q.locator('.quick-nav-brand .brand-mark').evaluate('e=>e.getAnimations()[0].currentTime')>spin
   q.evaluate("document.querySelector('[data-quick-route=map]').click()")
   assert q.locator('.quick-nav-brand .brand-mark').evaluate('e=>e.getAnimations().some(a=>a.effect.getTiming().iterations===Infinity)')
   q.keyboard.press('Escape')
  # Wheel and touch gestures cannot move the background; dismissing restores it.
  q.evaluate('window.scrollTo({top:420,behavior:"instant"})');saved=q.evaluate('scrollY');assert saved>0
  tap_brand();assert q.evaluate('getComputedStyle(document.body).position')=='fixed'
  locked_top=q.evaluate('document.body.style.top')
  q.mouse.move(10,500);q.mouse.wheel(0,500);q.wait_for_timeout(100)
  touch=c.new_cdp_session(q)
  touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':160,'y':700}]})
  touch.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':160,'y':250}]})
  touch.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});touch.detach()
  assert q.evaluate('document.body.style.top')==locked_top
  q.keyboard.press('Escape');assert abs(q.evaluate('scrollY')-saved)<2
  assert q.evaluate('getComputedStyle(document.body).position')!='fixed'
  # A route change must save the real pre-lock position for browser Back.
  tap_brand();q.locator('[data-quick-route=map]').click();expect(dialog).to_be_hidden()
  q.go_back();expect(q.locator('#view-explore')).to_be_visible();assert abs(q.evaluate('scrollY')-saved)<2
  tap_brand();q.locator('[data-quick-route=explore]').click();expect(dialog).to_be_hidden();assert q.evaluate('scrollY')==0
  if motion=='no-preference':
   brand.click();q.evaluate("document.querySelector('[data-quick-route=pass]').click()")
   q.wait_for_function("document.querySelector('#quick-navigation').classList.contains('is-revealing')")
   assert dialog.evaluate("e=>getComputedStyle(e,'::backdrop').backdropFilter")=='none'
   assert q.locator('.quick-nav-sheet').evaluate('e=>getComputedStyle(e).visibility')=='hidden'
   expect(dialog).to_be_hidden()
   assert q.locator('.quick-nav-wave').evaluate('e=>e.getAnimations().length')==0
  expect(brand).to_have_css('opacity','1')
  for tab in ['map','day','story','pass','explore']:
   brand.click();q.locator(f'[data-quick-route={tab}]').click();expect(dialog).to_be_hidden();expect(q.locator(f'#view-{tab}')).to_be_visible();expect(q.locator('.app-view:visible')).to_have_count(1)
   expect(q.locator(f'#view-{tab} h1')).to_be_focused()
  # Two fast choices must end on the latest route, with no delayed override.
  brand.click();q.evaluate("document.querySelector('[data-quick-route=map]').click()")
  if motion=='reduce':brand.click()
  q.evaluate("document.querySelector('[data-quick-route=pass]').click()")
  expect(dialog).to_be_hidden();expect(q.locator('#view-pass')).to_be_visible()
  q.go_back();expect(q.locator('#view-map' if motion=='reduce' else '#view-explore')).to_be_visible();expect(dialog).to_be_hidden()
  # The route commits only after coverage; cancelling an early choice is safe.
  q.locator('.app-tabbar [data-route=explore]').click()
  q.locator('.app-tabbar [data-route=map]').click()
  brand.click();q.evaluate("document.querySelector('[data-quick-route=story]').click()")
  if motion=='no-preference':expect(q.locator('#view-map')).to_be_visible()
  q.go_back();expect(dialog).to_be_hidden();expect(q.locator('#view-map' if motion=='reduce' else '#view-explore')).to_be_visible()
  previous=q.evaluate('document.body.dataset.tab')
  brand.click();q.evaluate("document.querySelector('[data-quick-route=pass]').click()")
  q.keyboard.press('Escape');expect(dialog).to_be_hidden();expect(q.locator('#view-pass' if motion=='reduce' else f'#view-{previous}')).to_be_visible()
  if motion=='no-preference':
   brand.click();q.evaluate("document.querySelector('[data-quick-route=day]').click()")
   q.emulate_media(reduced_motion='reduce');expect(dialog).to_be_hidden();expect(q.locator('#view-day')).to_be_visible()
   assert dialog.evaluate('e=>e.getAnimations({subtree:true}).length')==0
   q.emulate_media(reduced_motion=motion)
  for lang in ['vi','en','zh']:
   q.locator('#language-select').select_option(lang)
   for width,height in [(320,568),(390,844),(430,844),(700,390)]:
    q.set_viewport_size({'width':width,'height':height});brand.click();expect(dialog).to_be_visible()
    assert dialog.evaluate('e=>e.scrollWidth<=e.clientWidth'),(lang,width)
    for choice in q.locator('[data-quick-route]').all():assert choice.bounding_box()['height']>=44
    if motion=='reduce':assert dialog.evaluate('e=>e.getAnimations({subtree:true}).length')==0
    q.locator('.quick-nav-close').click();expect(brand).to_be_focused()
   assert not q.evaluate("async()=>(await import('/assets/i18n.js')).untranslatedUI(document.querySelector('#quick-navigation'))"),lang
  assert not errors,errors;c.close()
 b.close()
print('PASS: single moving logo, scale/rotation alignment, touch/wheel scroll lock and restoration, coloured reveal teardown, all routes, rapid selection, browser Back, reduced motion and three languages at phone/landscape widths.')
