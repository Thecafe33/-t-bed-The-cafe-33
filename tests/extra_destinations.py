"""Museum/temple discovery and optional mountain detour on narrow phones. No live writes."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright,expect
out=Path('/workspace/outputs');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000',wait_until='networkidle')
 assert page.locator('.place-art').evaluate_all('els=>els.slice(0,3).map(e=>e.dataset.place)')==['nha-trung-bay-van-hoa-oc-eo','chua-linh-son','nha-trung-bay-cu-ba-the']
 page.locator('#place-search').fill('nha trung bay');expect(page.locator('.place-card')).to_have_count(2)
 page.locator('.place-art[data-place=nha-trung-bay-van-hoa-oc-eo]').click()
 expect(page.locator('#modal-body h2')).to_have_text('Nhà trưng bày Văn hóa Óc Eo')
 expect(page.locator('#checkin')).to_be_enabled()
 expect(page.locator('#modal-body a[href="tel:02963878156"]')).to_contain_text('Ban Quản lý')
 page.screenshot(path=str(out/'oc-eo-museum-detail.png'))
 page.locator('#close-modal').click()
 page.locator('#place-search').fill('chua linh son');expect(page.locator('.place-card')).to_have_count(1)
 page.locator('.place-art').click();expect(page.locator('#checkin')).to_be_enabled();page.locator('#close-modal').click()
 page.locator('#place-search').fill('bo hoang');expect(page.locator('.place-card')).to_have_count(1)
 expect(page.locator('.place-access-warning')).to_contain_text('tránh ngày mưa')
 page.locator('.place-art').click();expect(page.locator('.access-warning')).to_contain_text('Đường núi khó đi')
 expect(page.locator('.access-warning')).to_contain_text('xe ôm địa phương')
 expect(page.locator('.access-warning')).to_contain_text('không cần ghé')
 expect(page.locator('#checkin')).to_have_count(0)
 expect(page.locator('.source-links a').first).to_contain_text('Wikipedia')
 assert page.locator('.access-warning').bounding_box()['y']<page.locator('.detail-illustration').bounding_box()['y']
 for width in [390,320]:
  page.set_viewport_size({'width':width,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert page.locator('#modal').evaluate('e=>e.scrollWidth<=e.clientWidth')
 page.set_viewport_size({'width':390,'height':844});page.locator('#modal').evaluate('e=>e.scrollTop=0');page.screenshot(path=str(out/'oc-eo-hidden-gem-warning.png'))
 page.locator('#close-modal').click();page.locator('.app-tabbar [data-route=day]').click()
 page.locator('.journey-legacy>summary').click();page.locator('.timeline-row').filter(has_text='08:30').locator('[data-place]').click();expect(page.locator('#modal-body h2')).to_have_text('Nhà trưng bày Văn hóa Óc Eo');page.locator('#close-modal').click()
 page.locator('.timeline-row').filter(has_text='09:30').locator('[data-place]').click();expect(page.locator('#modal-body h2')).to_have_text('Chùa Linh Sơn');page.locator('#close-modal').click()
 expect(page.locator('.mountain-detour')).to_contain_text('NGOÀI LỊCH CHÍNH')
 page.locator('.app-tabbar [data-route=pass]').click()
 expect(page.locator('.stamp')).to_have_count(0)
 expect(page.locator('#next-page')).to_be_disabled()
 page.goto('http://127.0.0.1:8000/admin',wait_until='networkidle');page.locator('[data-tab=places]').click();page.locator('[data-edit=nha-trung-bay-cu-ba-the]').click()
 expect(page.locator('[name=collectible]')).not_to_be_checked();expect(page.locator('[name=accessWarning]')).to_have_value(re.compile('Đường núi khó đi'))
 page.locator('#place-form button[type=submit]').click();page.locator('[data-edit=nha-trung-bay-cu-ba-the]').click();expect(page.locator('[name=collectible]')).not_to_be_checked()
 expect(page.locator('[name=accessWarning]')).to_have_value(re.compile('xe ôm địa phương'))
 assert not errors,errors
 b.close()
print('PASS: two distinct exhibition houses; discoverable Linh Son temple; prominent mountain warning at 320/390px; real source labels; optional detour excluded from Pass; itinerary links; admin preserves warning and optional status. No live writes.')
