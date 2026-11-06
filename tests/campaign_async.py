"""Account/GPS/modal races and cold offline story export, using fake transport only."""
from pathlib import Path
import struct
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
repo=Path(__file__).resolve().parent.parent
fixture='''
import {cloneDefault} from './model.js';
export const state={user:null,ready:true,admin:false};
window.__site=cloneDefault();window.__saves=[];
export async function watchSite(cb){window.__watch=cb;cb(window.__site);return()=>{};}
export async function connect(){return state;}
export async function loadProfile(){return null;}
export async function saveProfile(data,uid){window.__saves.push({uid,data:structuredClone(data)});}
export async function loadReviews(){return{items:[],more:false};}
export function friendlyError(e){return e.message;}
window.__user=id=>{state.user=id?{uid:id}:null;window.dispatchEvent(new CustomEvent('cloud-state'));};
'''
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 c.route('**/assets/cloud.js',lambda r:r.fulfill(content_type='text/javascript',body=fixture))
 c.add_init_script("Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(success,error){window.__gps={success,error};}}})")
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(origin+'/#day',wait_until='networkidle')
 q.locator('[data-journey-action=start]').click()
 q.evaluate("window.__user('test-A')");expect(q.locator('[data-journey-action=start]')).to_be_visible()
 q.locator('[data-journey-action=start]').click();assert q.evaluate("JSON.parse(localStorage.getItem('oceo-passport-test-A:journey')).active")
 q.evaluate("window.__user('test-B')");expect(q.locator('[data-journey-action=start]')).to_be_visible()
 assert q.evaluate("localStorage.getItem('oceo-passport-test-B:journey')") is None
 def checkin():
  q.locator('.journey-stop [data-place=nha-trung-bay-van-hoa-oc-eo]').first.click();q.locator('#checkin').click()
 def respond(offset=0):
  q.evaluate("offset=>{const p=window.__site.places.find(p=>p.id==='nha-trung-bay-van-hoa-oc-eo');window.__gps.success({coords:{latitude:p.lat+offset,longitude:p.lng,accuracy:10}})}",offset)
 checkin();q.evaluate("window.__user('test-C')");respond()
 assert q.evaluate('window.__saves.length')==0
 assert q.evaluate("localStorage.getItem('oceo-passport-test-C')") is None
 # A point closed while GPS is pending cannot issue a stamp.
 q.locator('#close-modal').click();checkin()
 q.evaluate("()=>{window.__site.places.find(p=>p.id==='nha-trung-bay-van-hoa-oc-eo').closed=true;window.__watch(window.__site)}")
 respond();assert q.evaluate('window.__saves.length')==0
 q.locator('#close-modal').click()
 q.evaluate("()=>{window.__site.places.find(p=>p.id==='nha-trung-bay-van-hoa-oc-eo').closed=false;window.__watch(window.__site)}")
 checkin();q.evaluate("()=>{window.__site.radius=35;window.__watch(window.__site)}");respond(.001)
 expect(q.locator('#toast')).to_contain_text('35 m');assert q.evaluate('window.__saves.length')==0
 # A current successful check-in is saved under the current owner only.
 q.locator('#checkin').click();respond();expect(q.locator('.stamp.earned')).to_have_count(1)
 assert q.evaluate("window.__saves.every(s=>s.uid==='test-C'&&s.data.badges.length===1)")
 assert q.evaluate("JSON.parse(localStorage.getItem('oceo-passport-test-C')).badges")==['nha-trung-bay-van-hoa-oc-eo']
 # The older collection export must not replace a newer personal editor.
 q.route('**/assets/pass-art.js',lambda r:r.fulfill(content_type='text/javascript',body=(repo/'assets/pass-art.js').read_text().replace('export async function passArtwork(options){','export async function passArtwork(options){await new Promise(resolve=>setTimeout(resolve,600));')))
 # The app's imported module is already cached; a new page uses the delayed fixture.
 q.evaluate("localStorage.setItem('oceo-passport-guest',JSON.stringify({name:'Elio',badges:['linh-son-bac']}))")
 q.goto(origin+'/#pass',wait_until='networkidle');q.locator('#certificate').click();q.locator('.pass-story-entry [data-journey-action=story]').click()
 expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=15000)
 q.wait_for_timeout(1000);expect(q.locator('#modal')).to_have_attribute('data-view','story')
 assert not errors,errors
 c.close()
 # Cold offline load includes code, fonts, imagery and demo; personal photos stay local.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce',accept_downloads=True)
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 c.add_init_script("if(!localStorage.getItem('oceo-passport-guest'))localStorage.setItem('oceo-passport-guest',JSON.stringify({name:'Elio',badges:['linh-son-bac']}))")
 q=c.new_page();q.on('pageerror',lambda e:errors.append(str(e)));q.goto(origin+'/?journey=theo-dau-co-vat-v1#day',wait_until='networkidle')
 q.evaluate('async()=>{await navigator.serviceWorker.ready}');q.wait_for_function('!!navigator.serviceWorker.controller')
 q.locator('[data-journey-action=pack]').click();expect(q.locator('#toast')).to_contain_text('Đã chuẩn bị',timeout=15000)
 c.set_offline(True);q.reload(wait_until='domcontentloaded')
 q.locator('.journey-finish [data-journey-action=story]').click();expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=15000)
 q.locator('[data-story-field=photo]').set_input_files(str(repo/'assets/photos/ba-the.jpg'));expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=15000)
 with q.expect_download() as pending:q.locator('[data-story-action=download]').click()
 assert struct.unpack('>II',Path(pending.value.path()).read_bytes()[16:24])==(1080,1920)
 assert not errors,errors
 b.close()
print('PASS: per-account journey state, stale-owner GPS ignored, closure/current radius revalidated, current-owner stamp saved once; late legacy preview cannot replace creator; cold offline photo PNG export and map/material pack.')
