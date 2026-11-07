"""Pass page transitions preserve a draft name and scroll, with reduced-motion support."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 for motion in ['no-preference','reduce']:
  c=b.new_context(service_workers='block',viewport={'width':390,'height':844},reduced_motion=motion)
  c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
  c.add_init_script("localStorage.setItem('oceo-passport-guest',JSON.stringify({name:'Elio',badges:['chua-linh-son','linh-son-bac','linh-son-nam','go-cay-thi','go-giong-cat','nha-trung-bay-van-hoa-oc-eo']}));window.passAnimations=[];const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){if(this.matches('.passport-cover,.passport-spread,.passport-flip'))passAnimations.push(this.className);return original.call(this,frames,options)}")
  q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
  q.goto(origin+'/#pass',wait_until='networkidle')
  assert q.locator('.passport-book').bounding_box()['y']<q.locator('#save-pass-image').bounding_box()['y']
  q.locator('#passport-name').fill('Tên đang nhập')
  q.locator('#next-page').scroll_into_view_if_needed();before=q.evaluate('scrollY');q.locator('#next-page').click()
  expect(q.locator('.stamp.earned')).to_have_count(2);expect(q.locator('#passport-name')).to_have_value('Tên đang nhập')
  assert abs(q.evaluate('scrollY')-before)<4
  expect(q.locator('#prev-page')).to_be_focused()
  q.locator('#prev-page').click();expect(q.locator('.stamp.earned')).to_have_count(4)
  q.locator('#toggle-book').click();expect(q.locator('.passport-cover')).to_be_visible();expect(q.locator('#toggle-book')).to_have_attribute('aria-expanded','false')
  q.locator('#open-book').click();expect(q.locator('.passport-spread')).to_be_visible();expect(q.locator('#toggle-book')).to_be_focused()
  expect(q.locator('#passport-name')).to_have_value('Tên đang nhập')
  animations=q.evaluate('passAnimations');assert bool(animations)==(motion=='no-preference'),animations
  for width in [320,360,390,430]:
   q.set_viewport_size({'width':width,'height':844});assert q.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  assert not errors,errors
  c.close()
 b.close()
print('PASS: Pass leads, page changes retain draft/scroll/focus, close/open is operable, motion enabled only when allowed, phone widths fit.')
