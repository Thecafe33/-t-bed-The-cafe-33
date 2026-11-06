"""Header language picker: pointer/keyboard, dismissal, persistence and deck access."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(service_workers='block',viewport={'width':390,'height':844},reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(origin,wait_until='networkidle');trigger=q.locator('#language-trigger');menu=q.locator('#language-options')
 expect(q.locator('#language-code')).to_have_text('VN');expect(menu).to_be_hidden()
 trigger.click();expect(menu).to_be_visible();expect(q.locator('[data-language=vi]')).to_be_focused()
 q.keyboard.press('ArrowDown');expect(q.locator('[data-language=en]')).to_be_focused()
 q.keyboard.press('Enter');expect(q.locator('html')).to_have_attribute('lang','en');expect(trigger).to_be_focused();expect(menu).to_be_hidden()
 expect(q.locator('#language-code')).to_have_text('EN')
 q.reload(wait_until='networkidle');expect(q.locator('#language-code')).to_have_text('EN')
 trigger.focus();q.keyboard.press('ArrowUp');expect(q.locator('[data-language=zh]')).to_be_focused()
 q.keyboard.press('Home');expect(q.locator('[data-language=vi]')).to_be_focused()
 q.keyboard.press('End');expect(q.locator('[data-language=zh]')).to_be_focused()
 q.keyboard.press('Escape');expect(trigger).to_be_focused();expect(menu).to_be_hidden()
 trigger.click();q.keyboard.press('Tab');expect(menu).to_be_hidden();expect(q.locator('#sound-toggle')).to_be_focused()
 trigger.click();q.mouse.click(8,100);expect(menu).to_be_hidden()
 trigger.click();q.locator('[data-language=zh]').click();expect(q.locator('html')).to_have_attribute('lang','zh-Hans')
 expect(q.locator('#language-code')).to_have_text('中文')
 before=q.evaluate("localStorage.getItem('oceo-passport-guest')")
 q.locator('.header-deck').click();expect(q.locator('[data-deck-active]')).to_have_count(1)
 q.locator('#close-modal').click();assert q.evaluate("localStorage.getItem('oceo-passport-guest')")==before
 expect(q.locator('#sound-toggle')).to_have_attribute('aria-pressed','false')
 q.locator('#sound-toggle').click();expect(q.locator('#sound-toggle')).to_have_attribute('aria-pressed','true')
 q.locator('#sound-toggle').click();expect(q.locator('#sound-toggle')).to_have_attribute('aria-pressed','false')
 for lang,code in [('vi','VN'),('en','EN'),('zh','中文')]:
  # Native fallback/programmatic updates stay in sync with the custom picker.
  q.locator('#language-select').select_option(lang);expect(q.locator('#language-code')).to_have_text(code)
  for width in [320,360,375,390,430,1440]:
   q.set_viewport_size({'width':width,'height':844});q.evaluate('scrollTo(0,0)')
   assert q.evaluate('document.documentElement.scrollWidth<=innerWidth'),(lang,width)
   controls=[q.locator('.header-deck'),trigger,q.locator('#sound-toggle'),q.locator('#account-button')]
   boxes=[x.bounding_box() for x in controls]
   assert all(box['height']>=44 and box['width']>=44 for box in boxes),(lang,width,boxes)
   expected_gap=4 if width<=374 else 8
   for left,right in zip(boxes,boxes[1:]):
    assert abs(right['x']-left['x']-left['width']-expected_gap)<1,(lang,width)
    assert abs(right['y']-left['y'])<1,(lang,width)
   brand=q.locator('.brand').bounding_box();assert abs(brand['y']-boxes[0]['y'])<1,(lang,width)
   assert q.locator('header').bounding_box()['height']<80
   assert not q.locator('.header-deck').inner_text().strip()
   trigger.click();mb=menu.bounding_box();assert mb['x']>=0 and mb['x']+mb['width']<=width
   expect(q.locator(f'[data-language={lang}]')).to_have_attribute('aria-selected','true')
   q.keyboard.press('Escape')
   q.locator('#places-grid').scroll_into_view_if_needed()
   assert abs(q.locator('header').bounding_box()['y'])<1
  assert not q.evaluate("async()=>(await import('/assets/i18n.js')).untranslatedUI(document.querySelector('header'))"),lang
 assert not errors,errors
 b.close()
print('PASS: pointer and keyboard language selection, escape/outside/tab dismissal, reload and native sync, header deck, opt-in sound, single-row sticky header, icon-only deck,44px controls/equal responsive gaps, three languages320/360/375/390/430/1440; no production writes.')
