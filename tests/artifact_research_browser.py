"""New evidence cards: real mobile flows, sources, translations, playback and offline use."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ORIGIN='http://127.0.0.1:8000'
records=[('vishnu-phat-bon-tay','chua-linh-son','1912',0),('bia-da-linh-son','chua-linh-son','1879',1),('phat-dong-cay-thi-a','go-cay-thi','1942',2),('vishnu-cay-thi-b','go-cay-thi','1928',0)]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce',service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(ORIGIN+'/#artifacts',wait_until='networkidle')
 before=q.evaluate("localStorage.getItem('oceo-passport-guest')")
 q.locator('#artifact-view-toggle').click();expect(q.locator('.artifact-index-cards .artifact-card')).to_have_count(13)
 for id,place,year,answer in records:
  q.locator(f'.artifact-index-cards [data-artifact="{id}"]').click()
  expect(q.locator('#modal .artifact-origin')).to_contain_text(year)
  expect(q.locator('#modal .artifact-origin [data-place]')).to_have_attribute('data-place',place)
  expect(q.locator('#modal .artifact-source')).to_have_attribute('href',f'https://ispace.angiang.vn/qr_info/oc-eo/{"chua-linh-son" if place=="chua-linh-son" else "go-cay-thi-a" if id=="phat-dong-cay-thi-a" else "go-cay-thi-b"}/')
  if place=='chua-linh-son':
   expect(q.locator('#modal .artifact-holding [data-place]')).to_have_attribute('data-place','chua-linh-son')
   expect(q.locator('#modal .artifact-holding [data-place]')).to_have_text('Xem nơi lưu giữ ↗')
  else:
   expect(q.locator('#modal .artifact-holding [data-place]')).to_have_count(0)
   expect(q.locator('#modal .artifact-media-note')).to_contain_text('chưa có ảnh')
  q.locator('#modal .artifact-challenge summary').click()
  q.locator(f'#modal [data-artifact-answer="{answer}"]').click()
  expect(q.locator('#artifact-feedback')).to_contain_text('Chính xác!')
  player=q.locator('#modal .narration-player');player.locator('summary').click()
  for lang,label in [('vi','Đọc tư liệu gốc'),('en','Read the original source'),('zh','阅读原始资料')]:
   q.evaluate("async(lang)=>(await import('/assets/i18n.js')).setLanguage(lang)",lang)
   expect(q.locator('#modal .artifact-source')).to_have_text(label)
   missing=q.locator('#modal .artifact-detail').evaluate("async(el)=>(await import('/assets/i18n.js')).untranslatedUI(el)")
   assert not missing,(id,lang,missing)
   for width in [320,390]:
    q.set_viewport_size({'width':width,'height':844})
    assert q.locator('#modal').evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'),(id,lang,width)
   a=player.locator('audio');assert '/'+lang+'/artifact-'+id+'.mp3' in a.get_attribute('src')
   a.evaluate('(a)=>a.play()');q.wait_for_function('document.querySelector("#modal audio").currentTime>.1')
   assert a.evaluate('(a)=>a.duration')>30
   a.evaluate('(a)=>a.pause()')
  q.evaluate("async()=>(await import('/assets/i18n.js')).setLanguage('vi')")
  if id=='vishnu-phat-bon-tay':
   q.locator('#modal .artifact-origin').scroll_into_view_if_needed()
   Path('/workspace/outputs').mkdir(exist_ok=True);q.screenshot(path='/workspace/outputs/new-artifact-provenance-mobile.png')
  q.locator('#modal [data-action="artifacts"]').click();expect(q.locator('#view-artifacts')).to_be_visible()
 assert q.evaluate("localStorage.getItem('oceo-passport-guest')")==before
 assert not errors,errors;c.close()
 # New card data and a requested new audio track survive an offline reload.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 q=c.new_page();q.goto(ORIGIN+'/#artifacts',wait_until='networkidle')
 q.evaluate('async()=>{await navigator.serviceWorker.ready}');q.wait_for_function('!!navigator.serviceWorker.controller')
 path='/assets/audio/vi/artifact-bia-da-linh-son.mp3?v=20261111'
 assert q.evaluate("async(path)=>{const r=await fetch(path);return r.ok&&(await r.arrayBuffer()).byteLength>1000}",path)
 c.set_offline(True);q.reload(wait_until='domcontentloaded');q.locator('#artifact-view-toggle').click()
 expect(q.locator('.artifact-index-cards .artifact-card')).to_have_count(13)
 q.locator('.artifact-index-cards [data-artifact="bia-da-linh-son"]').click();expect(q.locator('.artifact-origin')).to_contain_text('1879')
 assert q.evaluate("async(path)=>{const r=await fetch(path,{headers:{Range:'bytes=1024-2047'}});return r.status===206&&(await r.arrayBuffer()).byteLength===1024}",path)
 b.close()
print('PASS: four new cards, correct origin/holding links, no invented images or stamps, quizzes, 3-language audio and UI, mobile widths, offline card and audio ranges.')
