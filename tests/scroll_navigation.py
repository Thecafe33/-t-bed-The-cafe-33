from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 for motion in ['no-preference','reduce']:
  c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion=motion,has_touch=True)
  c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
  q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(origin,wait_until='networkidle')
  root=q.locator('html');header=q.locator('.app-header');tabs=q.locator('.app-tabbar')
  def scroll(top):
   q.evaluate('(top)=>scrollTo({top,behavior:"instant"})',top);q.wait_for_timeout(45)
  def visible():
   expect(root).not_to_have_class('navigation-concealed');q.wait_for_timeout(210)
   assert header.bounding_box()['y']>=-1
   assert tabs.bounding_box()['y']+tabs.bounding_box()['height']<=844
  scroll(350);expect(root).to_have_class('navigation-concealed');q.wait_for_timeout(210)
  assert header.bounding_box()['y']+header.bounding_box()['height']<=0
  assert tabs.bounding_box()['y']>=844
  # Tapping plain content must not reveal chrome or synthesize an upward scroll.
  for _ in range(3):
   before=q.evaluate('scrollY');q.touchscreen.tap(5,400);q.wait_for_timeout(50)
   assert q.evaluate('scrollY')==before
   expect(root).to_have_class('navigation-concealed')
  q.locator('#language-trigger').evaluate("e=>e.setAttribute('aria-expanded','false')")
  q.wait_for_timeout(50);expect(root).to_have_class('navigation-concealed')
  # Chrome can report small reversals while the page still trends downward.
  # This sequence used to reveal/hide the bars three times.
  q.evaluate("()=>{window.chromeChanges=[];let previous=document.documentElement.classList.contains('navigation-concealed');new MutationObserver(()=>{const next=document.documentElement.classList.contains('navigation-concealed');if(next!==previous){chromeChanges.push(next);previous=next;}}).observe(document.documentElement,{attributes:true,attributeFilter:['class']})}")
  for offset in [340,374,364,398,388,422]:scroll(offset)
  q.wait_for_timeout(220);assert q.evaluate('chromeChanges')==[]
  # Height-only changes (mobile browser toolbar) must preserve hidden state.
  q.set_viewport_size({'width':390,'height':790});q.wait_for_timeout(220)
  expect(root).to_have_class('navigation-concealed')
  q.set_viewport_size({'width':390,'height':844});q.wait_for_timeout(80)
  scroll(0);visible();scroll(350);expect(root).to_have_class('navigation-concealed');q.wait_for_timeout(210)
  # Tiny reversals must not make either bar flicker.
  scroll(347);expect(root).to_have_class('navigation-concealed')
  scroll(349);scroll(345);expect(root).to_have_class('navigation-concealed')
  scroll(330);visible()
  scroll(333);scroll(340);expect(root).not_to_have_class('navigation-concealed')
  scroll(380);expect(root).to_have_class('navigation-concealed')
  scroll(0);visible()
  # A focused hidden control becomes reachable without requiring a pointer.
  scroll(350);expect(root).to_have_class('navigation-concealed')
  q.locator('.app-tabbar [data-route=day]').focus();visible()
  q.locator('.app-tabbar [data-route=day]').click();visible()
  # Dropdowns stay usable while the underlying page scrolls.
  q.locator('#language-trigger').click();scroll(450);visible();q.keyboard.press('Escape')
  # Dialog scrolls and body locks must not be interpreted as page gestures.
  q.locator('.app-header .brand').click();expect(q.locator('#quick-navigation')).to_be_visible()
  q.mouse.wheel(0,400);expect(root).not_to_have_class('navigation-concealed')
  q.keyboard.press('Escape');visible()
  q.locator('.header-deck').click();q.locator('#artifact-open').click();q.locator('#modal-body').evaluate('e=>e.scrollTop=300');q.wait_for_timeout(50)
  expect(root).not_to_have_class('navigation-concealed');q.locator('#close-modal').click();visible()
  # Real root wheel events use the same directional behaviour.
  scroll(0);q.mouse.move(200,400);q.mouse.wheel(0,350);expect(root).to_have_class('navigation-concealed')
  q.mouse.wheel(0,-90);expect(root).not_to_have_class('navigation-concealed')
  if motion=='no-preference':
   scroll(0);visible();q.evaluate('chromeChanges=[]')
   touch=c.new_cdp_session(q)
   touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':200,'y':650,'id':1}]})
   for point in [610,560,500,430,350,260]:
    touch.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':200,'y':point,'id':1}]})
   touch.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
   expect(root).to_have_class('navigation-concealed');q.wait_for_timeout(250)
   assert q.evaluate('chromeChanges')==[True]
   q.touchscreen.tap(5,400);q.wait_for_timeout(100)
   assert q.evaluate('chromeChanges')==[True]
   touch.detach()
  if motion=='reduce':expect(header).to_have_css('transition-duration','0s')
  assert not errors,errors;c.close()
 b.close()
print('PASS: both bars hide/reveal, jitter threshold, top recovery, keyboard access, route reset, dropdown/dialog protection, root wheel and reduced motion.')
