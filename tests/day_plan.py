from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 q=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 q.goto('http://127.0.0.1:8000/#day',wait_until='networkidle')
 expect(q.locator('#timeline > li')).to_have_count(7)
 expect(q.locator('#timeline > li').nth(2)).to_contain_text('Sữa Gạo Phù Nam')
 expect(q.locator('#timeline > li').nth(1)).to_contain_text('thứ Hai')
 expect(q.locator('#plan-afternoon')).not_to_have_attribute('open','')
 expect(q.locator('#timeline-afternoon')).to_be_hidden()
 expect(q.locator('.plan-booking')).to_have_attribute('href','https://the-cafe-33.web.app/')
 q.locator('#timeline [data-place="xofa"]').click();expect(q.locator('#modal')).to_contain_text('Sữa Gạo Phù Nam');q.locator('#close-modal').click()
 q.locator('#plan-afternoon > summary').click();expect(q.locator('#timeline-afternoon > li')).to_have_count(3)
 for id in ['phuong-sang','ut-map','go-cay-thi','go-giong-cat','nha-trung-bay-cu-ba-the']:
  expect(q.locator('#timeline-afternoon [data-place="'+id+'"]').first).to_be_visible()
 for lang in ['vi','en','zh']:
  q.locator('#language-select').select_option(lang)
  for w in [320,390,1440]:
   q.set_viewport_size({'width':w,'height':844});assert q.evaluate('document.documentElement.scrollWidth<=innerWidth'),(lang,w)
  missing=q.evaluate("async()=>(await import('/assets/i18n.js')).untranslatedUI(document.querySelector('.day-plan'))")
  assert not missing,(lang,missing)
 assert not errors,errors
 b.close()
print('PASS: breakfast/museum/XOFA sequence, optional afternoon, booking and destination buttons, three languages and responsive widths')
