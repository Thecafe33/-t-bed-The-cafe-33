"""Serve exactly like project GitHub Pages: root /assets must fail, prefixed resources must work."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer
from threading import Thread
from urllib.request import urlopen
from urllib.error import HTTPError
import importlib.util,struct
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('preview_server',root/'tools/dev_server.py');server_module=importlib.util.module_from_spec(spec);spec.loader.exec_module(server_module)
class QuietHandler(server_module.Handler):
 def log_message(self,*args):pass
prefix='/-t-bed-The-cafe-33'
server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(root),base_path=prefix));Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}';base=origin+prefix+'/'
out=Path('/workspace/outputs');out.mkdir(exist_ok=True)
try:
 for missing in ['/assets/style.css',prefix+'/.git/config',prefix+'/%252egit/config']:
  try:urlopen(origin+missing);raise AssertionError('Expected 404: '+missing)
  except HTTPError as error:assert error.code==404
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
  ctx=browser.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce',accept_downloads=True)
  ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
  page=ctx.new_page();errors=[];failures=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:failures.append((r.status,r.url)) if r.url.startswith(origin) and r.status>=400 else None)
  page.goto(base+'index.html',wait_until='networkidle');expect(page.locator('.place-card')).to_have_count(16)
  assert page.locator('.app-tabbar').evaluate('e=>getComputedStyle(e).position')=='fixed'
  assert page.locator('.pocket-hero>img').evaluate('e=>e.complete && e.naturalWidth>0')
  assert page.locator('link[rel=stylesheet]').evaluate_all('els=>els.every(e=>e.href.includes("/-t-bed-The-cafe-33/assets/"))')
  page.screenshot(path=str(out/'oc-eo-github-pages-mobile.png'))
  for width in [320,390,1440]:
   page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert page.locator('.app-main').bounding_box()['width']<=560
  page.set_viewport_size({'width':390,'height':844});page.locator('#place-search').fill('go cay thi');page.locator('.place-art').click()
  assert page.locator('.detail-illustration img').evaluate('e=>e.complete && e.naturalWidth>0 && e.src.includes("/-t-bed-The-cafe-33/assets/photos/")')
  page.locator('#close-modal').click();page.locator('.app-tabbar [data-route=map]').click()
  page.wait_for_function("document.querySelectorAll('.osm-pin').length+[...document.querySelectorAll('[data-cluster-count]')].reduce((n,e)=>n+Number(e.dataset.clusterCount),0)===11")
  page.wait_for_function("performance.getEntriesByType('resource').some(e=>e.name.endsWith('/-t-bed-The-cafe-33/assets/data/oceo-town-map.geojson'))")
  page.locator('.app-tabbar [data-route=pass]').click()
  page.evaluate("() => {window.__svg='';const create=URL.createObjectURL.bind(URL);URL.createObjectURL=b=>{if(b.type.startsWith('image/svg+xml'))b.text().then(s=>window.__svg=s);return create(b)};}")
  with page.expect_download() as download:page.locator('#save-pass-image').click()
  data=Path(download.value.path()).read_bytes();assert struct.unpack('>II',data[16:24])==(1080,1920)
  assert page.evaluate("/url\\(data:[^)]*base64,/.test(window.__svg)")
  page.goto(base+'admin.html',wait_until='networkidle');expect(page.locator('#publish')).to_be_disabled()
  assert page.locator('a.brand').get_attribute('href')=='./index.html'
  page.goto(base+'privacy.html',wait_until='networkidle');expect(page.locator('#privacy-content h2')).to_contain_text('Quyền riêng tư')
  page.locator('a.brand').click();expect(page.locator('.place-card')).to_have_count(16)
  assert page.url.startswith(base)
  assert not errors,errors
  assert not failures,failures
  ctx.close()
  # A real worker must register and cache only within the project directory.
  ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
  page=ctx.new_page();page.goto(base+'index.html',wait_until='networkidle')
  page.evaluate('async()=>{await navigator.serviceWorker.ready;}');page.wait_for_function('!!navigator.serviceWorker.controller')
  reg=page.evaluate('async()=>({scope:(await navigator.serviceWorker.getRegistration()).scope,script:navigator.serviceWorker.controller.scriptURL})')
  assert reg['scope']==base and reg['script']==base+'sw.js',reg
  urls=page.evaluate('async()=>{let out=[];for(const k of await caches.keys()){const c=await caches.open(k);out.push(...(await c.keys()).map(r=>r.url))}return out}')
  assert urls and all(u.startswith(base+'assets/') or u==base+'index.html' for u in urls),urls
  ctx.set_offline(True);page.reload(wait_until='domcontentloaded');expect(page.locator('.place-card')).to_have_count(16);expect(page.locator('#connection-state')).to_be_visible()
  page.locator('#place-search').fill('cay thi');page.locator('.place-art').click();expect(page.locator('#modal')).to_be_visible()
  browser.close()
 print('PASS: project-prefix HTML/CSS/JS/fonts/photos; mobile/desktop layout; map data; PNG with embedded fonts; admin/privacy links; scoped Service Worker and offline reload; no root resource 404s or live writes.')
finally:server.shutdown();server.server_close()
