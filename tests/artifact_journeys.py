"""Field-guide flows: provenance, observation, quiz, map links and offline cards."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(service_workers='block',viewport={'width':390,'height':844},reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(origin,wait_until='networkidle');before=page.evaluate("localStorage.getItem('oceo-passport-guest')")
 page.locator('.artifact-launch').click();page.locator('#artifact-view-toggle').click();expect(page.locator('.artifact-index .artifact-card')).to_have_count(9)
 page.screenshot(path='/workspace/outputs/oc-eo-artifact-index.png')
 page.locator('#artifact-site-filter').select_option('linh-son-bac');expect(page.locator('.artifact-index .artifact-card')).to_have_count(2)
 page.locator('[data-artifact=phat-linh-son-bac]').click();expect(page.locator('.artifact-origin h3')).to_have_text('Linh Sơn Bắc')
 expect(page.locator('.artifact-holding [data-place]')).to_have_attribute('data-place','nha-trung-bay-van-hoa-oc-eo')
 expect(page.locator('#artifact-observation')).to_contain_text('kiến trúc');page.locator('[data-artifact-mode=display]').click();expect(page.locator('#artifact-observation')).to_contain_text('ba ký tự')
 page.locator('.artifact-challenge>summary').click();page.locator('[data-artifact-answer="0"]').click();expect(page.locator('#artifact-feedback')).to_contain_text('Cùng xem lại')
 page.locator('[data-artifact-answer="1"]').click();expect(page.locator('#artifact-feedback')).to_contain_text('Chính xác!')
 page.screenshot(path='/workspace/outputs/oc-eo-artifact-observation.png')
 assert page.evaluate("localStorage.getItem('oceo-passport-guest')")==before
 page.locator('[data-artifact-map]').click();expect(page.locator('#modal')).not_to_be_visible();expect(page.locator('#map-selection h2')).to_have_text('Linh Sơn Bắc')
 page.locator('.app-tabbar [data-route=explore]').click();page.locator('#place-search').fill('nhan Nandin');expect(page.locator('.place-card')).to_have_count(1);expect(page.locator('.place-card')).to_contain_text('Giồng Cát')
 page.locator('#place-search').fill('');page.locator('.place-art[data-place=nha-trung-bay-van-hoa-oc-eo]').click();expect(page.locator('.artifact-site-section .artifact-card')).to_have_count(2)
 page.locator('[data-artifact=mo-vo-cay-tram]').click();expect(page.locator('[data-artifact-map]')).to_have_count(0)
 page.locator('.artifact-origin [data-place]').click();expect(page.locator('#checkin')).to_be_disabled();expect(page.locator('.artifact-site-section')).to_contain_text('Mộ vò Gò Cây Trâm');page.locator('#close-modal').click()
 ids=page.evaluate("async()=>{const {ARTIFACTS}=await import('/assets/artifacts.js');return ARTIFACTS.map(a=>({id:a.id,answer:a.answer}))}")
 pending=set()
 def collect():pending.update(page.evaluate("async()=>{const m=await import('/assets/i18n.js');return m.untranslatedUI()}"))
 for lang in ['en','zh']:
  page.locator('#language-select').select_option(lang);page.locator('.artifact-launch').click();page.locator('#artifact-site-filter').select_option('all');collect()
  for record in ids:
   page.locator(f'[data-artifact="{record["id"]}"]').click();collect();page.locator('[data-artifact-mode=display]').click();collect()
   page.locator('.artifact-challenge>summary').click();page.locator(f'[data-artifact-answer="{record["answer"]}"]').click();collect()
   for width in [320,390,430]:
    page.set_viewport_size({'width':width,'height':844});assert page.locator('#modal').evaluate('e=>e.scrollWidth<=e.clientWidth+1'),(lang,record['id'],width)
   page.set_viewport_size({'width':390,'height':844});page.locator('#modal [data-action=artifacts]').click()
  page.locator('#close-modal').click()
 assert not pending,sorted(pending)
 assert not errors,errors
 c.close()
 # Real service worker: the guide, questions and quiz need no network after caching.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();page.goto(origin,wait_until='networkidle');page.evaluate('async()=>{await navigator.serviceWorker.ready}');page.wait_for_function('!!navigator.serviceWorker.controller')
 c.set_offline(True);page.reload(wait_until='domcontentloaded');page.locator('.artifact-launch').click();page.locator('#artifact-view-toggle').click();expect(page.locator('.artifact-card')).to_have_count(9)
 page.locator('[data-artifact=nandin-giong-cat]').click();expect(page.locator('.artifact-origin')).to_contain_text('2018');page.locator('.artifact-challenge>summary').click();page.locator('[data-artifact-answer="0"]').click();expect(page.locator('#artifact-feedback')).to_contain_text('Chính xác!')
 b.close()
print('PASS: 9 source cards, site filtering, correct discovery vs display links, two observation contexts, quiz feedback, no stamp writes, artifact-name search, pending-coordinate protection, 3 languages/mobile widths and offline guide. No live writes.')
