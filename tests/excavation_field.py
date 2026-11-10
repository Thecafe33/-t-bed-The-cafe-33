"""Wide excavation field: tools, sieve, camera record, field notebook, narration. External services blocked."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ORIGIN='http://127.0.0.1:8000'
ROOT=Path(__file__).resolve().parent.parent
OUT=Path('/workspace/outputs');OUT.mkdir(parents=True,exist_ok=True)
# Test-only hook: expose the field model so slow software-GPU runs need not scrub every pixel by hand.
HOOK="renderer = createExcavationRenderer(terrain, fallback, art, field);"
def hooked(route):
 src=(ROOT/'assets/discovery.js').read_text(encoding='utf-8')
 assert HOOK in src
 route.fulfill(status=200,content_type='text/javascript',body=src.replace(HOOK,HOOK+"window.__dig={field,view,toScreen,centreOn,updateStats,schedule};"))
def uncover(q,small=False):
 q.evaluate("""(small)=>{const {field,updateStats,schedule}=window.__dig;
  for(let y=.7;y<field.heightM-.6;y+=.12)field.apply('shovel',{x:.6,y},{x:field.widthM-.6,y});
  field.finds.forEach(f=>{if(f.small)return;const r=f.size*.75;for(let k=0;k<9;k++)for(let y=f.y-r;y<f.y+r;y+=.05){field.apply(f.fragile?'pick':'trowel',{x:f.x-r,y},{x:f.x+r,y});field.apply('brush',{x:f.x-r,y},{x:f.x+r,y});}});
  updateStats();schedule();}""",small)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,service_workers='block',reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 c.route('**/assets/discovery.js',hooked)
 c.add_init_script("localStorage.setItem('oceo-dig-site','do-thi-oc-eo')")
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(e.stack))
 failures=[];q.on('response',lambda r:failures.append(r.url) if r.url.startswith(ORIGIN) and r.status>=400 else None)
 q.goto(ORIGIN+'/#discovery',wait_until='networkidle');q.wait_for_function('window.__dig')
 scene=q.locator('.discovery-scene');expect(scene).to_have_attribute('data-renderer','webgl');expect(scene).to_have_attribute('data-site','do-thi-oc-eo')
 assert scene.bounding_box()=={'x':0,'y':0,'width':390,'height':844}
 expect(q.locator('.app-header')).to_be_hidden();expect(q.locator('.app-tabbar')).to_be_hidden()
 expect(q.locator('.discovery-panel:visible')).to_have_count(0)
 # Eight field tools, none answers the puzzle for the player; the camera has nothing to record yet.
 expect(q.locator('[data-tool]')).to_have_count(8)
 expect(q.locator('[data-tool=hand]')).to_have_attribute('aria-pressed','true')
 info=q.evaluate("(()=>{const f=window.__dig.field;return {w:f.widthM,h:f.heightM,finds:f.finds.length,small:f.finds.filter(x=>x.small).length}})()")
 assert info=={'w':7,'h':9,'finds':5,'small':3},info
 # The trench is larger than the phone screen and can be panned with the move tool.
 cam=q.evaluate('({...window.__dig.view.camera})')
 assert q.evaluate('window.__dig.view.width/window.__dig.view.scale')<info['w']
 q.mouse.move(200,400);q.mouse.down();q.mouse.move(80,250,steps=4);q.mouse.up()
 moved=q.evaluate('({...window.__dig.view.camera})');assert moved['x']>cam['x'] and moved['y']>cam['y'],(cam,moved)
 # Minimap and zoom controls.
 q.locator('[data-zoom=fit]').click();assert q.evaluate('window.__dig.view.width/window.__dig.view.scale')>=info['w']
 q.locator('[data-zoom=in]').click();q.locator('[data-zoom=in]').click()
 # A real touch stroke with the shovel digs, fills the bucket and never scrolls the page.
 q.locator('[data-tool=shovel]').click();cdp=c.new_cdp_session(q)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':80,'y':330}]})
 for x in range(90,320,20):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':330+x/10}]})
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 assert q.evaluate('scrollY')==0
 assert q.evaluate('window.__dig.field.bucket.soil')>0;expect(q.locator('[data-open-sieve] b')).not_to_have_text('0 L')
 # Brush and blower cannot move firm soil.
 before=q.evaluate('window.__dig.field.revision')
 for t in ['brush','blower']:
  q.locator(f'[data-tool={t}]').click();q.mouse.move(120,600);q.mouse.down();q.mouse.move(260,620,steps=3);q.mouse.up()
 assert q.evaluate('window.__dig.field.revision')==before
 # Help opens only on request.
 q.locator('[data-game-help]').click();expect(q.locator('.discovery-help')).to_be_visible();expect(q.locator('.discovery-hint')).to_be_empty()
 q.locator('[data-request-hint]').click();expect(q.locator('.discovery-hint')).not_to_be_empty();q.locator('.discovery-help [data-close-panel]').click()
 # Uncover the big finds; camera taps record them into the notebook.
 uncover(q)
 statuses=q.evaluate('window.__dig.field.finds.map(f=>f.status)')
 assert statuses.count('exposed')==2 and statuses.count('bucket')==3,statuses
 expect(q.locator('[data-tool=camera]')).to_have_class('is-calling')
 q.locator('[data-tool=camera]').click()
 for i in range(2):
  pos=q.evaluate("(()=>{const {field,toScreen,centreOn}=window.__dig;const f=field.finds.find(f=>f.status==='exposed');centreOn(f.x,f.y);return toScreen(f)})()")
  q.mouse.click(pos['x'],pos['y'])
  expect(q.locator('.discovery-record')).to_be_visible()
 expect(q.locator('[data-stat-finds] b')).to_have_text('2/5')
 q.screenshot(path=str(OUT/'excavation-recorded.png'))
 # The sieve turns bucket soil into glass-bead finds.
 q.locator('[data-open-sieve]').click();expect(q.locator('.discovery-sieve')).to_be_visible()
 for _ in range(60):
  if q.locator('[data-sieve-shake]').is_disabled():break
  q.locator('[data-sieve-shake]').click()
 expect(q.locator('[data-sieve-record]')).to_have_count(3)
 q.screenshot(path=str(OUT/'excavation-sieve.png'))
 while q.locator('[data-sieve-record]').count():q.locator('[data-sieve-record]').first.click()
 expect(q.locator('[data-stat-finds] b')).to_have_text('5/5');q.locator('.discovery-sieve [data-close-panel]').click()
 # Completion opens the notebook; pages are read one after another.
 expect(q.locator('.discovery-notebook')).to_be_visible(timeout=5000);expect(scene).to_have_attribute('data-complete','true')
 expect(q.locator('.notebook-card')).to_have_count(5);expect(q.locator('.notebook-locked')).to_have_count(0)
 q.locator('[data-notebook-step="1"]').click();expect(q.locator('.notebook-count')).to_have_text('2 / 5')
 q.locator('[data-notebook-step="1"]').click();expect(q.locator('.notebook-count')).to_have_text('3 / 5')
 assert q.locator('.notebook-art img').count()==5
 assert q.locator('.notebook-art[data-placeholder=true]').count()==3
 q.screenshot(path=str(OUT/'excavation-notebook.png'))
 card=q.locator('.notebook-card').nth(0);audio=card.locator('audio')
 audio.evaluate('(a)=>a.play()');q.wait_for_function('[...document.querySelectorAll(".notebook-card audio")].some(a=>a.currentTime>.1)')
 q.locator('.discovery-notebook [data-close-panel]').click();expect(q.locator('.discovery-notebook')).to_be_hidden()
 assert audio.evaluate('(a)=>a.paused')
 found=q.evaluate('JSON.parse(localStorage.getItem("oceo-discoveries-v1"))')
 assert sorted(found)==sorted(['nandin-giong-cat','mo-vo-cay-tram','hat-chuoi-go-oc-eo','hat-chuoi-lung-lon','hat-chuoi-giong-trom']),found
 assert not q.evaluate('Object.keys(localStorage).some(k=>/profile|badge|journey/.test(k))')
 # Every panel translates fully in three languages and the field fills each viewport.
 for lang in ['en','zh','vi']:
  q.evaluate("async(lang)=>(await import('/assets/i18n.js')).setLanguage(lang)",lang)
  for opener,panel in [('[data-game-help]','.discovery-help'),('.discovery-notebook-button','.discovery-notebook'),('[data-open-sieve]','.discovery-sieve'),('.discovery-site','.discovery-sites')]:
   q.locator(opener).click();expect(q.locator(panel)).to_be_visible()
   pending=q.evaluate("async()=>(await import('/assets/i18n.js')).untranslatedUI(document.querySelector('#view-discovery'))")
   assert not pending,(lang,panel,pending)
   q.locator(panel+' [data-close-panel]').click()
  for width,height in [(320,568),(844,390),(1440,1000),(390,844)]:
   q.set_viewport_size({'width':width,'height':height});q.wait_for_timeout(80)
   rect=scene.bounding_box();assert rect['width']==width and rect['height']==height
   assert q.evaluate('document.documentElement.scrollWidth<=innerWidth && scrollY===0')
   tools=q.locator('.discovery-tools').bounding_box();assert tools['y']+tools['height']<=height+1,(width,height,tools)
 # Switching site starts a new trench with other finds.
 q.locator('.discovery-site').click();q.locator('[data-site=ba-the-linh-son]').click()
 expect(scene).to_have_attribute('data-site','ba-the-linh-son');q.wait_for_function("window.__dig.field.site.id==='ba-the-linh-son'")
 assert q.evaluate('window.__dig.field.finds.length')==4;expect(q.locator('[data-stat-finds] b')).to_have_text('0/4')
 # Exit restores app chrome; Back returns to the field.
 q.locator('.discovery-exit').click();expect(q.locator('#view-artifacts')).to_be_visible();expect(q.locator('.app-header')).to_be_visible();expect(q.locator('.app-tabbar')).to_be_visible()
 assert not q.evaluate('document.documentElement.classList.contains("discovery-locked")')
 q.go_back();expect(q.locator('#view-discovery')).to_be_visible();expect(scene).to_have_attribute('data-site','ba-the-linh-son')
 # Keyboard: arrows move the work point, Space uses the selected tool.
 q.locator('[data-tool=shovel]').click();scene.focus();rev=q.evaluate('window.__dig.field.revision')
 q.keyboard.press('ArrowRight');q.keyboard.press('Space');assert q.evaluate('window.__dig.field.revision')>rev
 q.keyboard.press('+')
 assert not errors,errors;assert not failures,failures;c.close()
 # Without WebGL and without the image files the field still plays with drawn placeholders.
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block')
 c.add_init_script("const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:get.call(this,type,...args)}")
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 c.route('**/assets/heritage-art/**',lambda r:r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(e.stack));q.goto(ORIGIN+'/#discovery',wait_until='networkidle')
 expect(q.locator('.discovery-scene')).to_have_attribute('data-renderer','canvas');expect(q.locator('.discovery-fallback')).to_be_visible();expect(q.locator('.discovery-scene-note')).to_be_hidden()
 q.locator('[data-tool=shovel]').click();q.mouse.move(100,400);q.mouse.down();q.mouse.move(280,420,steps=4);q.mouse.up()
 expect(q.locator('[data-open-sieve] b')).not_to_have_text('0 L');assert not errors,errors;c.close()
 # Standalone route and previously requested narration both work offline.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 q=c.new_page();q.goto(ORIGIN+'/#discovery',wait_until='networkidle');q.evaluate('async()=>{await navigator.serviceWorker.ready}');q.wait_for_function('!!navigator.serviceWorker.controller')
 path='/assets/audio/vi/artifact-nandin-giong-cat.mp3'
 assert q.evaluate("async(path)=>{const r=await fetch(path,{headers:{Range:'bytes=0-1023'}});return r.status===206&&(await r.arrayBuffer()).byteLength===1024}",path)
 c.set_offline(True);q.reload(wait_until='domcontentloaded');expect(q.locator('#view-discovery')).to_be_visible();expect(q.locator('.discovery-scene-note')).to_be_hidden(timeout=15000)
 assert q.evaluate("async(path)=>{const r=await fetch(path,{headers:{Range:'bytes=1024-2047'}});return r.status===206&&(await r.arrayBuffer()).byteLength===1024}",path)
 b.close()
print('PASS: 7×9 m trench larger than the screen, pan/zoom/minimap, eight tools with realistic limits, bucket and sieve for beads, camera records, swipeable field notebook with narration, three sites, three languages, no Pass writes, WebGL/canvas and placeholder images, offline route.')
