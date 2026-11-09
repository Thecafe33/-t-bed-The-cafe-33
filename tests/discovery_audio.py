"""Full-viewport free exploration and narration; external services always blocked."""
from playwright.sync_api import sync_playwright, expect
ORIGIN='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,service_workers='block',reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(e.stack));q.goto(ORIGIN+'/#discovery',wait_until='networkidle')
 scene=q.locator('.discovery-scene');expect(scene).to_have_attribute('data-renderer','webgl')
 assert scene.bounding_box()=={'x':0,'y':0,'width':390,'height':844}
 expect(q.locator('.app-header')).to_be_hidden();expect(q.locator('.app-tabbar')).to_be_hidden()
 expect(q.locator('.discovery-panel:visible')).to_have_count(0)
 expect(q.locator('[data-tool]')).to_have_count(3)
 for button in q.locator('[data-tool]').all():expect(button).to_be_enabled();expect(button).to_have_attribute('aria-pressed','false')
 assert q.locator('.discovery-missions,progress,[data-game-stage]').count()==0
 q.evaluate('window.originalTerrain=document.querySelector(".discovery-terrain");window.originalProfile=Object.fromEntries(Object.entries(localStorage).filter(([k])=>/profile|badge|journey/.test(k)))')
 # Optional guidance is only opened by a deliberate request.
 q.locator('[data-game-help]').click();expect(q.locator('.discovery-help')).to_be_visible();expect(q.locator('.discovery-hint')).to_be_empty()
 q.locator('[data-request-hint]').click();expect(q.locator('.discovery-hint')).not_to_be_empty();q.locator('.discovery-help [data-close-panel]').click()
 # A real touch stroke on the wrong tool neither scrolls the page nor earns a find.
 q.locator('[data-tool=brush]').click();cdp=c.new_cdp_session(q)
 cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':80,'y':300}]})
 cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':290,'y':380}]})
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 assert q.evaluate('scrollY')==0;assert scene.get_attribute('data-complete') is None
 assert q.evaluate('originalTerrain===document.querySelector(".discovery-terrain")')
 def sweep(tool,rounds):
  q.locator('[data-tool='+tool+']').click()
  for k in range(rounds):
   if scene.get_attribute('data-complete')=='true':break
   q.mouse.move(25,140);q.mouse.down()
   for i in range(15):
    q.mouse.move(365,140+i*37);q.mouse.move(25,140+i*37)
   q.mouse.up()
 sweep('trowel',6);assert scene.get_attribute('data-complete') is None
 q.screenshot(path='/workspace/outputs/discovery-free-dug.png')
 # Cancelling a gesture leaves no stuck pointer or page scrolling.
 q.mouse.move(100,300);q.mouse.down();q.evaluate('document.querySelector(".discovery-scene").dispatchEvent(new PointerEvent("pointercancel",{pointerId:1,bubbles:true}))');q.mouse.up()
 sweep('brush',9);expect(q.locator('[data-open-find]')).to_be_visible()
 assert q.evaluate('JSON.stringify(originalProfile)===JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>/profile|badge|journey/.test(k))))')
 assert q.evaluate('JSON.parse(localStorage.getItem("oceo-discoveries-v1")).length')==1
 q.screenshot(path='/workspace/outputs/discovery-free-found.png')
 q.locator('[data-tool=lens]').click();q.mouse.move(130,330);q.mouse.down();q.mouse.move(190,400);q.mouse.up()
 q.locator('[data-open-find]').click();expect(q.locator('.discovery-find')).to_be_visible()
 q.locator('.discovery-find audio').evaluate('(a)=>a.play()');q.wait_for_function('document.querySelector(".discovery-find audio").currentTime>.1')
 q.locator('[data-narration-rate]').select_option('1.3');assert q.locator('.discovery-find audio').evaluate('(a)=>a.playbackRate')==1.3
 q.locator('.discovery-find audio').evaluate('(a)=>{a.pause();a.currentTime=10}');q.wait_for_function('document.querySelector(".discovery-find audio").currentTime>=9.9')
 q.locator('.discovery-find [data-close-panel]').click();expect(q.locator('.discovery-find')).to_be_hidden()
 assert q.locator('.discovery-find audio').evaluate('(a)=>a.paused')
 for lang in ['en','zh','vi']:
  q.evaluate("async(lang)=>(await import('/assets/i18n.js')).setLanguage(lang)",lang)
  assert not q.evaluate("async()=>(await import('/assets/i18n.js')).untranslatedUI(document.querySelector('#view-discovery'))"),lang
  for width,height in [(320,568),(844,390),(1440,1000),(390,844)]:
   q.set_viewport_size({'width':width,'height':height});q.wait_for_timeout(70)
   rect=scene.bounding_box();assert rect['width']==width and rect['height']==height
   assert q.evaluate('document.documentElement.scrollWidth<=innerWidth && scrollY===0')
   expect(q.locator('[data-open-find]')).to_be_visible()
 # Exit restores normal page chrome and browser Back restores the same find.
 q.locator('.discovery-exit').click();expect(q.locator('#view-artifacts')).to_be_visible();expect(q.locator('.app-header')).to_be_visible();expect(q.locator('.app-tabbar')).to_be_visible()
 assert not q.evaluate('document.documentElement.classList.contains("discovery-locked")')
 q.go_back();expect(q.locator('[data-open-find]')).to_be_visible()
 q.locator('.discovery-tools [data-game-reset]').click();expect(q.locator('[data-open-find]')).to_be_hidden();q.wait_for_function('document.querySelector(".discovery-scene-note").hidden')
 # Keyboard and opt-in assistance do not select a tool on the player's behalf.
 q.locator('[data-tool=brush]').click();scene.focus();q.keyboard.press('ArrowRight');q.keyboard.press('Space')
 expect(q.locator('[data-tool=brush]')).to_have_attribute('aria-pressed','true');assert scene.get_attribute('data-complete') is None
 assert not errors,errors;c.close()
 # Low-GPU clients still get playable canvas terrain; failed assets expose retry.
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block')
 c.add_init_script("const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:get.call(this,type,...args)}")
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 c.route('**/assets/heritage-art/**',lambda r:r.abort());q=c.new_page();q.goto(ORIGIN+'/#discovery',wait_until='networkidle');expect(q.locator('[data-image-retry]')).to_be_visible()
 c.unroute('**/assets/heritage-art/**');q.locator('[data-image-retry]').click();expect(q.locator('.discovery-scene')).to_have_attribute('data-renderer','canvas');expect(q.locator('.discovery-fallback')).to_be_visible();c.close()
 # Standalone route and previously requested narration both work offline.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce');c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
 q=c.new_page();q.goto(ORIGIN+'/#discovery',wait_until='networkidle');q.evaluate('async()=>{await navigator.serviceWorker.ready}');q.wait_for_function('!!navigator.serviceWorker.controller')
 path='/assets/audio/vi/artifact-nandin-giong-cat.mp3'
 assert q.evaluate("async(path)=>{const r=await fetch(path,{headers:{Range:'bytes=0-1023'}});return r.status===206&&(await r.arrayBuffer()).byteLength===1024}",path)
 c.set_offline(True);q.reload(wait_until='domcontentloaded');expect(q.locator('#view-discovery')).to_be_visible();q.wait_for_function('document.querySelector(".discovery-scene-note").hidden')
 assert q.evaluate("async(path)=>{const r=await fetch(path,{headers:{Range:'bytes=1024-2047'}});return r.status===206&&(await r.arrayBuffer()).byteLength===1024}",path)
 b.close()
print('PASS: full viewport, free tool choice, optional hints, real touch, local terrain, manual cleaning, narration, rotation/history persistence, restored chrome, no Pass rewards, three languages, fallback/retry and offline route.')
