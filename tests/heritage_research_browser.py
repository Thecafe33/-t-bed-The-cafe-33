"""Research additions: real place opening, narrow screens, languages and audio sources."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ORIGIN='http://127.0.0.1:8000'
IDS=['go-ut-trach','go-cay-thi','chua-linh-son','go-sau-thuan','linh-son-nam']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce',service_workers='block')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(ORIGIN+'/#map',wait_until='networkidle')
 q.locator('#map-directory > summary').click()
 for id in IDS:
  q.locator(f'#map-list [data-place="{id}"]').click()
  panel=q.locator('#modal .heritage-research');expect(panel).to_be_visible()
  expect(panel.locator('dl > div')).to_have_count(3)
  panel.locator('summary').click()
  expect(panel.locator('details p')).to_be_visible()
  for lang,title in [('vi','Lịch sử & dấu tích tại đây'),('en','History & evidence here'),('zh','这里的历史与遗迹')]:
   q.evaluate("async(lang)=>(await import('/assets/i18n.js')).setLanguage(lang)",lang)
   expect(panel.locator('h3')).to_have_text(title)
   missing=panel.evaluate("async(el)=>(await import('/assets/i18n.js')).untranslatedUI(el)")
   assert not missing,(id,lang,missing)
   for width in [320,390]:
    q.set_viewport_size({'width':width,'height':844})
    assert q.evaluate('document.documentElement.scrollWidth<=innerWidth'),(id,lang,width)
    assert panel.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'),(id,lang,width)
  q.evaluate("async()=>(await import('/assets/i18n.js')).setLanguage('vi')")
  audio=q.locator('#modal .narration-player');audio.locator('summary').click()
  expect(audio.locator('.narration-transcript')).to_contain_text('iSpace')
  assert audio.locator('.narration-sources a[href^="https://ispace.angiang.vn/"]').count()>0
  a=audio.locator('audio');a.evaluate('(a)=>a.play()')
  q.wait_for_function('document.querySelector("#modal audio").currentTime>.1')
  assert a.evaluate('(a)=>a.duration')>40
  a.evaluate('(a)=>a.pause()')
  if id=='go-ut-trach':
   panel.locator('h3').scroll_into_view_if_needed()
   Path('/workspace/outputs').mkdir(exist_ok=True)
   q.screenshot(path='/workspace/outputs/heritage-research-mobile.png')
  q.locator('#modal').evaluate('(el)=>el.close()')
 assert not errors,errors
 b.close()
print('PASS: five research profiles, three languages, 320/390px layouts, evidence links and revised audio playback.')
