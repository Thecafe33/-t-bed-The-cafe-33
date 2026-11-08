from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 for motion in ['no-preference','reduce']:
  c=b.new_context(service_workers='block',viewport={'width':390,'height':844},reduced_motion=motion)
  c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
  q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(origin,wait_until='networkidle')
  brand=q.locator('.app-header .brand');dialog=q.locator('#quick-navigation')
  brand.click();expect(dialog).to_be_visible();expect(q.locator('[data-quick-route=explore]')).to_be_focused()
  q.keyboard.press('Escape');expect(dialog).to_be_hidden();expect(brand).to_be_focused()
  for tab in ['map','day','pass','community','explore']:
   brand.click();q.locator(f'[data-quick-route={tab}]').click();expect(dialog).to_be_hidden();expect(q.locator(f'#view-{tab}')).to_be_visible();expect(q.locator('.app-view:visible')).to_have_count(1)
   expect(q.locator(f'#view-{tab} h1')).to_be_focused()
  # Two fast choices must end on the latest route, with no delayed override.
  brand.click();q.evaluate("document.querySelector('[data-quick-route=map]').click()")
  if motion=='reduce':brand.click()
  q.evaluate("document.querySelector('[data-quick-route=pass]').click()")
  expect(dialog).to_be_hidden();expect(q.locator('#view-pass')).to_be_visible()
  q.go_back();expect(q.locator('#view-map')).to_be_visible();expect(dialog).to_be_hidden()
  # Browser history interrupts an expanding wave without leaving an overlay behind.
  brand.click();q.evaluate("document.querySelector('[data-quick-route=community]').click()");q.go_back();expect(dialog).to_be_hidden();expect(q.locator('#view-map')).to_be_visible()
  # Closing during a transition must cancel the wave without undoing the route.
  brand.click();q.evaluate("document.querySelector('[data-quick-route=pass]').click()")
  q.keyboard.press('Escape');expect(dialog).to_be_hidden();expect(q.locator('#view-pass')).to_be_visible()
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
print('PASS: logo menu, keyboard dismissal/focus, all routes, rapid selection, browser Back interruption, reduced motion and three languages at phone/landscape widths.')
