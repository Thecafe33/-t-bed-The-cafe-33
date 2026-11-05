"""Heuristic task walkthroughs; no invented human participants or production writes."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
out=Path('/workspace/outputs');out.mkdir(exist_ok=True)
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 ctx=browser.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce')
 ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000',wait_until='networkidle')
 # Curious first-timer: source-backed introduction without mislabeling a UNESCO nomination.
 page.locator('.culture-quick summary').click();expect(page.locator('.culture-quick')).to_contain_text('Hồ sơ đang được đề cử UNESCO')
 expect(page.locator('#place-search')).to_be_visible()
 results.append({'perspective':'Lần đầu biết Óc Eo','task':'Hiểu chủ đề và tìm tên điểm ngay trên điện thoại','result':'passed'})
 # Informed learner: one concrete artifact story, prompt, citation and licensed photograph.
 page.locator('#place-search').fill('giong cat');page.locator('.place-art').click()
 expect(page.locator('.detail-description').first).to_contain_text('2018')
 expect(page.locator('.detail-description').first).to_contain_text('Nandin')
 expect(page.locator('.look-for')).to_be_visible();expect(page.locator('.source-links a').first).to_have_attribute('href','https://vanhoaoceo.angiang.gov.vn/chiec-nhan-vang-nandin-giong-cat-bao-vat-quoc-gia-cua-van-hoa-oc-eo')
 results.append({'perspective':'Đã quan tâm khảo cổ','task':'Đọc câu chuyện cụ thể và kiểm tra nguồn Giồng Cát','result':'passed'})
 # Friends planning together: local favorite, retained trip list and a shareable place link.
 page.evaluate("() => {Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.__sharedPlace=data;}});}")
 page.locator('#share-place').click();assert 'place=go-giong-cat' in page.evaluate('window.__sharedPlace.url')
 page.locator('#save-place').click();expect(page.locator('#save-place')).to_contain_text('Đã lưu')
 page.locator('#close-modal').click();page.locator('.app-tabbar [data-route=day]').click();expect(page.locator('#saved-trip')).to_contain_text('Gò Giồng Cát')
 page.reload(wait_until='networkidle');expect(page.locator('#saved-trip')).to_contain_text('Gò Giồng Cát')
 results.append({'perspective':'Nhóm bạn lên kế hoạch','task':'Lưu điểm, đổi màn hình, tải lại và chia sẻ liên kết cụ thể','result':'passed'})
 page.goto('http://127.0.0.1:8000/?place=go-cay-thi#explore',wait_until='networkidle')
 expect(page.locator('#modal')).to_be_visible();expect(page.locator('.photo-credit')).to_contain_text('CC BY-SA 3.0');expect(page.locator('#modal-body h2')).to_have_text('Gò Cây Thị')
 page.screenshot(path=str(out/'oc-eo-night-detail.png'))
 page.locator('#close-modal').click()
 # Younger guest: identity optional; no live data written or permission asked to browse.
 page.goto('http://127.0.0.1:8000/#pass',wait_until='networkidle');expect(page.locator('#pass-heading')).to_be_visible();expect(page.locator('#passport-login')).to_be_visible()
 expect(page.locator('#certificate')).to_be_disabled();expect(page.locator('.passport-page').first).to_contain_text('0 / 15')
 page.screenshot(path=str(out/'oc-eo-night-pass.png'))
 results.append({'perspective':'Khách trẻ, chưa đăng nhập','task':'Xem bộ tem, hiểu điểm nào chưa mở và không bị ép đăng nhập để duyệt','result':'passed'})
 assert not errors,errors
 ctx.close()
 # Offline uses a real Service Worker (no mocked transport or fake cached data).
 ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 page=ctx.new_page();page.goto('http://127.0.0.1:8000',wait_until='networkidle')
 page.evaluate('async () => {await navigator.serviceWorker.ready;}')
 page.wait_for_function('!!navigator.serviceWorker.controller')
 cached=page.evaluate('async()=>{let all=[];for(const k of await caches.keys()){const c=await caches.open(k);all.push(...(await c.keys()).map(r=>r.url));}return all;}')
 assert cached and all('/assets/' in u or u.endswith('/index.html') for u in cached),cached
 ctx.set_offline(True);page.reload(wait_until='domcontentloaded')
 expect(page.locator('#connection-state')).to_be_visible();page.locator('#place-search').fill('sau thuan');expect(page.locator('.place-card')).to_have_count(1)
 page.locator('.place-art').click();expect(page.locator('.detail-description').first).to_contain_text('ICOMOS')
 results.append({'perspective':'Đi ngoài đường, mất mạng','task':'Mở lại app, đọc tư liệu đã tải; không cache dữ liệu tài khoản hoặc bản đồ nền','result':'passed'})
 browser.close()
(out/'oc-eo-persona-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False))
