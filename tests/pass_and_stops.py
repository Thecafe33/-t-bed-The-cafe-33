"""PNG progress downloads and sourced rest-stop pins. Browser tests never write to Firebase."""
from pathlib import Path
import struct
from playwright.sync_api import sync_playwright,expect
out=Path('/workspace/outputs');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 ctx=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce',accept_downloads=True)
 ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 def capture_svg():
  page.evaluate("""() => {window.__exportSVG='';const create=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{if(blob.type.startsWith('image/svg+xml'))blob.text().then(s=>window.__exportSVG=s);return create(blob);};}""")
 page.goto('http://127.0.0.1:8000/#pass',wait_until='networkidle');capture_svg()
 expect(page.locator('#save-pass-image')).to_be_enabled();expect(page.locator('#certificate')).to_be_disabled()
 assert page.locator('#save-pass-image').bounding_box()['y']<350
 page.locator('#passport-name').fill('Bạn <Óc Eo>')
 with page.expect_download() as download:page.locator('#save-pass-image').click()
 assert download.value.suggested_filename=='oc-eo-pass.png'
 png=Path(download.value.path()).read_bytes();assert png[:8]==b'\x89PNG\r\n\x1a\n';assert struct.unpack('>II',png[16:24])==(1080,1920)
 assert page.evaluate("window.__exportSVG.includes('đã đạt 0/15 tem') && window.__exportSVG.includes('Bạn &lt;Óc Eo&gt;') && !window.__exportSVG.includes('data-earned-stamp=')")
 page.evaluate("localStorage.setItem('oceo-passport-guest',JSON.stringify({name:'Linh đi Óc Eo',badges:['chua-linh-son','go-cay-thi','not-a-real-stamp']}))")
 page.reload(wait_until='networkidle');capture_svg()
 with page.expect_download() as download:page.locator('#save-pass-image').click()
 download.value.save_as(out/'oc-eo-pass-progress.png')
 assert page.evaluate("window.__exportSVG.includes('đã đạt 2/15 tem') && window.__exportSVG.includes('CHÙA LINH SƠN') && window.__exportSVG.includes('GÒ CÂY THỊ') && !window.__exportSVG.includes('GÒ GIỒNG CÁT') && !window.__exportSVG.includes('Đã gom đủ bộ')")
 expect(page.locator('#certificate')).to_be_enabled()
 for width in [320,390]:
  page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.set_viewport_size({'width':390,'height':844});expect(page.locator('#toast')).not_to_have_class('show',timeout=7000);page.screenshot(path=str(out/'oc-eo-pass-save-button.png'))
 page.locator('.app-tabbar [data-route=map]').click();expect(page.locator('.osm-pin')).to_have_count(11)
 page.locator('[data-map-category=rest]').click();expect(page.locator('.osm-pin')).to_have_count(2)
 assert page.locator('[data-map-category=rest]').evaluate('e=>getComputedStyle(e).whiteSpace')=='nowrap'
 expect(page.locator('.osm-pin[title="The cafe 33"]')).to_have_count(1);expect(page.locator('.osm-pin[title="XOFA coffee & tea"]')).to_have_count(1)
 page.locator('#map-search').fill('sua gao');expect(page.locator('.map-list-item')).to_have_count(1);expect(page.locator('.osm-pin')).to_have_count(1)
 page.locator('.map-list-item').click();expect(page.locator('.stop-facts')).to_contain_text('25.000đ');expect(page.locator('.detail-description').first).to_contain_text('văn hóa Óc Eo');expect(page.locator('.source-links')).to_contain_text('Google Maps');page.locator('#close-modal').click()
 page.locator('#map-search').fill('');page.locator('[data-map-category=stay]').click();expect(page.locator('.osm-pin')).to_have_count(2)
 expect(page.locator('#map-list')).to_contain_text('Nhà nghỉ Phượng Sang');expect(page.locator('#map-list')).to_contain_text('Nhà nghỉ Út Mập')
 page.locator('[data-map-category=food]').click();expect(page.locator('.osm-pin')).to_have_count(0)
 page.locator('#map-search').fill('bun cua');expect(page.locator('.map-list-item')).to_have_count(1);page.locator('.map-list-item').click();expect(page.locator('.stop-facts')).to_contain_text('Chùa Phổ Quang');expect(page.locator('.local-source-note')).to_contain_text('Gợi ý địa phương');page.locator('#close-modal').click()
 page.locator('.app-tabbar [data-route=explore]').click();page.get_by_role('button',name='Nghỉ chân',exact=True).click()
 assert page.locator('.place-art').evaluate_all('els=>els.slice(0,2).map(e=>e.dataset.place)')==['the-cafe-33','xofa']
 page.locator('.place-art[data-place=the-cafe-33]').click();expect(page.locator('#book-stop')).to_have_attribute('href','https://the-cafe-33.web.app/');expect(page.locator('.booking-notice')).to_contain_text('thêm phí')
 page.screenshot(path=str(out/'oc-eo-cafe-booking.png'));page.locator('#close-modal').click()
 page.goto('http://127.0.0.1:8000/admin',wait_until='networkidle');page.locator('[data-tab=stops]').click();page.locator('[data-edit=the-cafe-33]').click()
 expect(page.locator('[name=bookingUrl]')).to_have_value('https://the-cafe-33.web.app');expect(page.locator('[name=featured]')).to_be_checked();page.locator('#place-form button[type=submit]').click()
 page.locator('[data-edit=bun-cua-oc-eo]').click();expect(page.locator('[name=localRecommendation]')).to_be_checked();expect(page.locator('[name=verified]')).not_to_be_checked()
 assert not errors,errors
 b.close()
print('PASS: one-tap PNG downloads at 0/15 and 2/15 with real dimensions, name escaping and no unearned stamps; correct cafe/guesthouse pins and category/search filters; booking URL/fee notice; unpinned local food tips; admin fields. No live writes.')
