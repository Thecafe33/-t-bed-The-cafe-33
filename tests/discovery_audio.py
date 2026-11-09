"""Mobile excavation gestures and real narration media, with all external writes blocked."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ORIGIN='http://127.0.0.1:8000'
ROOT=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
    context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,service_workers='block')
    context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
    page=context.new_page();errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.goto(ORIGIN+'/#discovery',wait_until='networkidle')
    expect(page.locator('#view-discovery')).to_be_visible()
    expect(page.locator('.discovery-scene-note')).to_contain_text('Chạm và kéo')
    expect(page.locator('#modal')).to_be_hidden()
    page.evaluate('window.gameCanvas=document.querySelectorAll(".discovery-earth")[2];window.profileBefore=Object.fromEntries(Object.entries(localStorage).filter(([k])=>/profile|badge|journey/.test(k)))')
    page.locator('.discovery-workbench').evaluate('(e)=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-100,behavior:"instant"})')
    page.wait_for_timeout(220)
    scene=page.locator('.discovery-scene');rect=scene.bounding_box();cdp=context.new_cdp_session(page)
    def swipe(y):
        points=[{'x':rect['x']+rect['width']*(.08+i*.084),'y':rect['y']+rect['height']*y} for i in range(11)]
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[points[0]]})
        for point in points[1:]:cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[point]})
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    offset=page.evaluate('scrollY');swipe(.18)
    assert page.locator('progress').evaluate('(e)=>e.value')>0
    assert abs(page.evaluate('scrollY')-offset)<2,'Canvas touch must not scroll the page'
    assert page.evaluate('gameCanvas===document.querySelectorAll(".discovery-earth")[2]'),'Do not recreate the canvas on drag'
    first=page.locator('progress').evaluate('(e)=>e.value');swipe(.18)
    assert page.locator('progress').evaluate('(e)=>e.value')==first,'Repeated strokes must not manufacture progress'
    expect(page.locator('[data-tool="brush"]')).to_be_disabled()
    for stage in [0,1]:
        for y in [.12,.22,.32,.42,.52,.62,.72,.82,.9]:
            if scene.get_attribute('data-stage')!=str(stage):break
            swipe(y);page.wait_for_timeout(250)
        expect(scene).to_have_attribute('data-stage',str(stage+1))
    # Finishing the lower layer asks for the brush; a trowel cannot finish cleaning.
    before=page.locator('progress').evaluate('(e)=>e.value');swipe(.4)
    assert page.locator('progress').evaluate('(e)=>e.value')==before
    page.locator('[data-tool="brush"]').click()
    # The click can scroll to the tools, so reframe before more physical touch input.
    page.locator('.discovery-workbench').evaluate('(e)=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-100,behavior:"instant"})');page.wait_for_timeout(250);rect=scene.bounding_box()
    for y in [.12,.20,.28,.36,.44,.52,.60,.68,.76,.84,.9]:
        if scene.get_attribute('data-stage')=='3':break
        swipe(y);page.wait_for_timeout(250)
    expect(page.locator('.discovery-result')).to_be_visible()
    expect(page.locator('progress')).to_have_js_property('value',100)
    assert page.evaluate('JSON.stringify(profileBefore)===JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>/profile|badge|journey/.test(k))))')
    assert json.loads(page.evaluate('localStorage.getItem("oceo-discoveries-v1")'))==['nandin-giong-cat']
    audio=page.locator('.discovery-result audio');audio.evaluate('(a)=>a.play()');page.wait_for_function('document.querySelector("audio").currentTime>.2')
    assert audio.evaluate('(a)=>a.duration>20 && !a.error')
    page.locator('[data-narration-rate]').select_option('1.3');assert audio.evaluate('(a)=>a.playbackRate')==1.3
    page.wait_for_function('(()=>{const a=document.querySelector("audio");return a.buffered.length&&a.buffered.end(0)>=a.duration-.1})()');audio.evaluate('(a)=>{a.pause();a.currentTime=10}');page.wait_for_function('document.querySelector("audio").paused && document.querySelector("audio").currentTime>=9.9')
    page.evaluate('window.oldAudio=document.querySelector("audio")')
    page.locator('[data-discovery-record]').click();expect(page.locator('#view-artifacts')).to_be_visible();expect(page.locator('#modal')).to_be_visible()
    assert page.evaluate('oldAudio.paused')
    audio=page.locator('#modal audio');audio.evaluate('(a)=>a.play()');page.wait_for_function('document.querySelector("#modal audio").currentTime>.1')
    page.locator('#artifact-back').click();assert audio.evaluate('(a)=>a.paused')
    page.go_back();expect(page.locator('#view-discovery')).to_be_visible();expect(page.locator('.discovery-result')).to_be_visible()
    page.locator('.discovery-scene').scroll_into_view_if_needed();page.screenshot(path='/workspace/outputs/discovery-reveal-mobile.png')
    # A second mission is playable, resets only the simulation and supports keyboard assist.
    page.locator('.discovery-missions [data-mission="1"]').click();expect(scene).to_have_attribute('data-stage','0')
    for i in range(90):
        page.wait_for_function('!document.querySelector(".discovery-result").hidden || !document.querySelector("[data-game-assist]").disabled')
        if page.locator('.discovery-result').is_visible():break
        page.locator('[data-game-assist]').click()
    expect(page.locator('.discovery-result')).to_be_visible();assert i<90
    assert set(json.loads(page.evaluate('localStorage.getItem("oceo-discoveries-v1")')))=={'nandin-giong-cat','phat-linh-son-bac'}
    for language in ['en','zh','vi']:
        page.locator('#language-select').select_option(language)
        expect(page.locator('.discovery-result audio')).to_have_attribute('src',__import__('re').compile('/audio/'+language+'/'))
        page.locator('.discovery-result audio').evaluate('(a)=>a.play()')
        page.wait_for_function('document.querySelector(".discovery-result audio").currentTime>.1')
        for width,height in [(320,568),(390,844),(1440,1000)]:
            page.set_viewport_size({'width':width,'height':height})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(language,width)
        assert not page.evaluate("async()=>(await import('/assets/i18n.js')).untranslatedUI(document.querySelector('#view-discovery'))"),language
    page.set_viewport_size({'width':390,'height':844});page.locator('[data-game-reset]').click()
    page.evaluate('scrollTo({top:0,behavior:"instant"})');page.screenshot(path='/workspace/outputs/discovery-page-mobile.png',full_page=True)
    assert not errors,errors
    context.close()
    # Failed images cannot complete the game; audio failures keep a readable transcript.
    context=browser.new_context(viewport={'width':390,'height':844},service_workers='block')
    context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
    context.route('**/assets/heritage-art/**',lambda r:r.abort())
    page=context.new_page();page.goto(ORIGIN+'/#discovery',wait_until='networkidle')
    expect(page.locator('[data-image-retry]')).to_be_visible();expect(page.locator('[data-game-assist]')).to_be_disabled()
    context.unroute('**/assets/heritage-art/**');page.locator('[data-image-retry]').click();expect(page.locator('[data-game-assist]')).to_be_enabled()
    context.route('**/assets/audio/**',lambda r:r.abort())
    page.goto(ORIGIN+'/?place=chua-linh-son',wait_until='networkidle')
    expect(page.locator('#modal .narration-player')).to_be_visible()
    page.locator('#modal audio').evaluate('(a)=>a.play().catch(()=>{})');expect(page.locator('.narration-error')).to_be_visible()
    page.locator('.narration-player summary').click();expect(page.locator('.narration-transcript')).to_be_visible()
    context.unroute('**/assets/audio/**');page.locator('[data-narration-retry]').click();page.wait_for_function('document.querySelector("#modal audio").currentTime>.1')
    context.close()
    # On-demand cache: range playback, seeking and a previously heard story offline.
    context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
    context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
    page=context.new_page();page.goto(ORIGIN+'/#discovery',wait_until='networkidle')
    page.evaluate('async()=>{await navigator.serviceWorker.ready}');page.wait_for_function('!!navigator.serviceWorker.controller')
    path='/assets/audio/vi/artifact-nandin-giong-cat.mp3'
    assert page.evaluate("async(path)=>{const r=await fetch(path,{headers:{Range:'bytes=0-1023'}});return r.status===206&&(await r.arrayBuffer()).byteLength===1024}",path)
    context.set_offline(True)
    assert page.evaluate("async(path)=>{const r=await fetch(path,{headers:{Range:'bytes=1024-2047'}});return r.status===206&&(await r.arrayBuffer()).byteLength===1024}",path)
    page.evaluate('(path)=>{const a=document.createElement("audio");a.id="offline-test-audio";a.src=path;document.body.append(a);return a.play()}',path)
    page.wait_for_function('document.querySelector("#offline-test-audio").currentTime>.1')
    page.locator('#offline-test-audio').evaluate('(a)=>{a.pause();a.currentTime=10}')
    page.wait_for_function('document.querySelector("#offline-test-audio").currentTime>=9.9')
    assert page.evaluate("async(path)=>(await fetch(path,{headers:{Range:'bytes=999999999-'}})).status",path)==416
    page.reload(wait_until='domcontentloaded');expect(page.locator('#view-discovery')).to_be_visible()
    page.locator('[data-game-assist]').click();assert page.locator('progress').evaluate('(e)=>e.value')>0
    browser.close()
print('PASS: physical touch, stable canvas, area-based progress, tool stages, both missions, no Pass rewards, real audio, seek/rate/pause, route return, three languages, responsive layout and offline range cache.')
