"""Four real UI check-in actions with test-only coordinates/transport, never production writes."""
from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import struct
ids=['chua-linh-son','linh-son-bac','linh-son-nam','go-sau-thuan']
fixture='''
import {cloneDefault} from './model.js';
export const state={user:null,admin:false,ready:true};
const site=cloneDefault(), ids=['chua-linh-son','linh-son-bac','linh-son-nam','go-sau-thuan'];
site.places=site.places.map(p=>{const i=ids.indexOf(p.id);return {...p,verified:i>=0,coordinateSource:i>=0?'https://example.org/test-only-coordinates':'',lat:i>=0?10.24+i*.01:null,lng:i>=0?105.17:null,checkInRadius:45};});
export async function connect(){return state;}
export async function watchSite(cb){cb(site);return()=>{};}
export async function loadProfile(){return null;}
export async function saveProfile(){}
export async function loadReviews(){return{items:[],more:false};}
export function friendlyError(e){return e.message;}
'''
out=Path('/workspace/outputs');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce',accept_downloads=True,permissions=['geolocation'],geolocation={'latitude':10.5,'longitude':105.5,'accuracy':10})
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 c.route('**/assets/cloud.js',lambda r:r.fulfill(status=200,content_type='text/javascript',body=fixture))
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000/#pass',wait_until='networkidle');expect(page.locator('.stamp')).to_have_count(0)
 expect(page.locator('.passport-page').first).to_contain_text('0 / 15')
 def open_point(id):
  if not page.locator('.pass-destinations').evaluate('e=>e.open'):page.locator('.pass-destinations summary').click()
  page.locator(f'.pass-destinations [data-place={id}]').click()
 open_point(ids[0]);page.locator('#checkin').click();expect(page.locator('#toast')).to_contain_text('Bạn còn cách điểm');expect(page.locator('.stamp')).to_have_count(0)
 c.set_geolocation({'latitude':10.24,'longitude':105.17,'accuracy':99});page.locator('#checkin').click();expect(page.locator('#toast')).to_contain_text('GPS chưa đủ chính xác');expect(page.locator('.stamp')).to_have_count(0)
 page.locator('#close-modal').click()
 for i,id in enumerate(ids):
  c.set_geolocation({'latitude':10.24+i*.01,'longitude':105.17,'accuracy':10})
  open_point(id);page.locator('#checkin').click();expect(page.locator('.stamp.earned')).to_have_count(i+1)
  expect(page.locator('.passport-page').first).to_contain_text(f'{i+1} / 15')
  assert page.locator('.stamp.locked').count()==0
 # Reopening an earned point does not create a second stamp.
 page.locator('.stamp[data-place=chua-linh-son]').click();page.locator('#checkin').click();expect(page.locator('.stamp.earned')).to_have_count(4)
 page.locator('#passport-name').fill('Linh đi Óc Eo');page.locator('#save-name').click();expect(page.locator('#certificate')).to_be_enabled()
 page.evaluate("() => {window.__exportSVG='';const f=URL.createObjectURL.bind(URL);URL.createObjectURL=b=>{if(b.type.startsWith('image/svg+xml'))b.text().then(s=>window.__exportSVG=s);return f(b);};}")
 with page.expect_download() as download:page.locator('#save-pass-image').click()
 download.value.save_as(out/'oc-eo-story-four-checkins.png');data=Path(download.value.path()).read_bytes();assert struct.unpack('>II',data[16:24])==(1080,1920)
 svg=page.evaluate('window.__exportSVG');assert svg.count('data-earned-stamp=')==4
 for id in ids:assert f'data-earned-stamp="{id}"' in svg
 assert 'go-cay-thi' not in svg and 'Ít lướt' not in svg
 page.reload(wait_until='networkidle');expect(page.locator('.stamp.earned')).to_have_count(4);expect(page.locator('.passport-page').first).to_contain_text('4 / 15')
 for width in [320,390]:
  page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.set_viewport_size({'width':390,'height':844});page.evaluate('scrollTo(0,0)');page.screenshot(path=str(out/'oc-eo-pass-four-checkins.png'))
 assert not errors,errors
 b.close()
print('PASS: no stamps before check-in; far and inaccurate GPS rejected; four successful actions produce exactly 4/15; no duplicate or future stamps; guest persistence; 9:16 PNG contains those four only. Test-only coordinates, no live writes.')
