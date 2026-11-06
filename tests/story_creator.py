"""Local-only story media/rendering regression; no live cloud writes."""
from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import struct,base64
base='http://127.0.0.1:8000/'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',accept_downloads=True)
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort())
 q=c.new_page();errs=[];q.on('pageerror',lambda e:errs.append(str(e)));q.goto(base,wait_until='networkidle')
 q.evaluate('''async()=>{const {CURATED}=await import('./assets/content.js');const {mountStoryCreator}=await import('./assets/story-creator.js');document.querySelectorAll('dialog').forEach(e=>e.remove());const d=document.createElement('dialog');d.id='test-story';d.style.cssText='margin:0;width:100%;max-width:100%;height:100%;max-height:100%;padding:10px;overflow:auto';document.body.append(d);d.showModal();window.__urls=new Set();const c=URL.createObjectURL.bind(URL),r=URL.revokeObjectURL.bind(URL);URL.createObjectURL=b=>{const u=c(b);window.__urls.add(u);return u};URL.revokeObjectURL=u=>{window.__urls.delete(u);r(u)};window.__toasts=[];window.__story=mountStoryCreator({root:d,places:CURATED.places,earned:['chua-linh-son','linh-son-bac','go-giong-cat','go-cay-thi','nha-trung-bay-cu-ba-the','bad-id'],name:'Elio',journeyIds:['linh-son-bac','go-giong-cat','chua-linh-son'],journeyURL:location.origin+'/index.html?journey=theo-dau-co-vat-v1&uid=SECRET#pass',onToast:m=>window.__toasts.push(m)});}''')
 expect(q.locator('[data-story-field=featured] option')).to_have_count(4)
 expect(q.locator('[data-story-field=featured]')).to_have_value('linh-son-bac')
 expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=20000)
 assert 'uid=' not in q.locator('.story-link').get_attribute('href')
 before=q.evaluate('JSON.stringify(localStorage)')
 with q.expect_download() as event:q.locator('[data-story-action=download]').click()
 data=Path(event.value.path()).read_bytes();assert struct.unpack('>II',data[16:24])==(1080,1920)
 q.locator('[data-story-mode=trip]').click();expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=20000)
 q.locator('[data-story-field=caption]').fill('我的Óc Eo <&> caption');q.locator('[data-story-field=name]').fill('张三 Elio')
 expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=20000)
 q.evaluate("window.__story.setLocale('en')");expect(q.locator('[data-story-field=caption]')).to_have_value('我的Óc Eo <&> caption')
 expect(q.locator('[data-story-field=name]')).to_have_value('张三 Elio')
 # MIME and genuine decoding validation leave a visible persistent error.
 q.locator('[data-story-field=photo]').set_input_files({'name':'bad.svg','mimeType':'image/svg+xml','buffer':b'<svg/>'})
 expect(q.locator('[data-story-error]')).to_contain_text('could not be read')
 q.locator('[data-story-field=photo]').set_input_files({'name':'fake.png','mimeType':'image/png','buffer':b'not a png'})
 expect(q.locator('[data-story-error]')).to_contain_text('could not be read')
 # Real raster photo; synthetic test fixture, never public/user data.
 encoded=q.evaluate('''()=>{const c=document.createElement('canvas');c.width=1200;c.height=1800;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,1200,1800);g.addColorStop(0,'#21775e');g.addColorStop(1,'#dbb17d');x.fillStyle=g;x.fillRect(0,0,1200,1800);return c.toDataURL().split(',')[1]}''')
 q.locator('[data-story-field=photo]').set_input_files({'name':'own.png','mimeType':'image/png','buffer':base64.b64decode(encoded)})
 expect(q.locator('.story-photo-controls')).to_be_visible();expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=20000)
 q.locator('[data-story-field=fit]').select_option('contain');expect(q.locator('[data-story-field=focusY]')).to_be_disabled()
 expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=20000)
 with q.expect_download() as event:q.locator('[data-story-action=download]').click()
 event.value.save_as('/workspace/outputs/story-creator-test-photo.png')
 # Web Share gets ready File inside the actual click activation.
 q.evaluate("Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>true});Object.defineProperty(navigator,'share',{configurable:true,value:async d=>{window.__shared={active:navigator.userActivation.isActive,type:d.files[0].type,url:d.url}}})")
 q.locator('[data-story-action=share]').click();q.wait_for_function('!!window.__shared');assert q.evaluate('window.__shared.active');assert q.evaluate('window.__shared.type')=='image/png'
 expect(q.locator('[data-story-status]')).to_contain_text('Check the app')
 assert q.evaluate('JSON.stringify(localStorage)')==before
 q.evaluate('window.__story.destroy()');assert q.evaluate('window.__urls.size')==0
 assert q.locator('#test-story').inner_text()==''
 assert not errs,errs
 b.close()
print('PASS story creator: earned-only filtering, journey priority, PNG1080x1920, literal input + locale preservation, MIME/genuine-image validation, own-photo framing, synchronous native file share, no storage writes, destroy clears URLs and DOM.')
