"""Upgrade a genuinely controlling older worker with incompatible cached modules."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright,expect
root=Path(__file__).resolve().parent.parent
mode={'old':True}
old_worker='''const C='oceo-townwalk:%2F:old-upgrade-test';
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['/index.html','/assets/app.js','/assets/model.js','/assets/campaign.css'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;
if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));return;}
if(u.pathname.startsWith('/assets/'))e.respondWith(caches.open(C).then(async c=>(await c.match(e.request))||fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r})));});'''
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_GET(self):
  path=self.path.split('?')[0]
  if mode['old'] and path in ['/','/index.html','/sw.js','/assets/app.js','/assets/model.js','/assets/campaign.css']:
   if path in ['/','/index.html']:body="<title>Old app</title><p id='old'>Old app</p><script>navigator.serviceWorker.register('/sw.js')</script>";mime='text/html'
   elif path=='/sw.js':body=old_worker;mime='text/javascript'
   elif path=='/assets/campaign.css':body='.campaign-home{background:rgb(53,27,39)!important}';mime='text/css'
   else:body='export const OLD_BUILD=true;';mime='text/javascript'
   self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(body.encode());return
  super().do_GET()
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(root)));Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}'
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
  c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
  q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(origin,wait_until='networkidle')
  q.evaluate('async()=>{await navigator.serviceWorker.ready}');q.wait_for_function('!!navigator.serviceWorker.controller')
  assert q.evaluate("async()=> (await caches.match('/assets/model.js')).text()")=='export const OLD_BUILD=true;'
  mode['old']=False;q.goto(origin+'/index.html?upgrade=1#day',wait_until='networkidle')
  expect(q.locator('#journey-title')).to_be_visible(timeout=25000)
  expect(q.locator('#boot-state')).to_be_hidden()
  assert q.evaluate("async()=>(await import('/assets/app.js')).APP_BUILD")=='campaign-v1'
  assert q.evaluate("async()=>typeof(await import('/assets/model.js')).isAccessClosed")=='function'
  q.locator('.app-tabbar [data-route=explore]').click()
  assert q.locator('.campaign-home').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(251, 248, 239)'
  q.locator('.app-tabbar [data-route=day]').click()
  assert q.evaluate("async()=>!(await caches.keys()).some(k=>k.includes('old-upgrade-test'))")
  c.set_offline(True);q.reload(wait_until='domcontentloaded');expect(q.locator('#journey-title')).to_be_visible(timeout=15000)
  assert not errors,errors
  b.close()
 print('PASS: an old controlling cache with incompatible app/model modules upgrades atomically before campaign imports; no blank mixed-version UI; new build reopens offline.')
finally:server.shutdown();server.server_close()
