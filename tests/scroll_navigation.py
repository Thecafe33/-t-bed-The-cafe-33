from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 for motion in ['no-preference','reduce']:
  c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion=motion)
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
  q.locator('.header-deck').click();q.locator('#modal-body').evaluate('e=>e.scrollTop=300');q.wait_for_timeout(50)
  expect(root).not_to_have_class('navigation-concealed');q.locator('#close-modal').click();visible()
  # Real root wheel events use the same directional behaviour.
  scroll(0);q.mouse.move(200,400);q.mouse.wheel(0,350);expect(root).to_have_class('navigation-concealed')
  q.mouse.wheel(0,-90);expect(root).not_to_have_class('navigation-concealed')
  if motion=='reduce':expect(header).to_have_css('transition-duration','0s')
  assert not errors,errors;c.close()
 b.close()
print('PASS: both bars hide/reveal, jitter threshold, top recovery, keyboard access, route reset, dropdown/dialog protection, root wheel and reduced motion.')
