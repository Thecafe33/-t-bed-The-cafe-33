"""The real guest journey, image editor and referral loop. No live cloud writes."""
from pathlib import Path
import struct
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
repo=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce',accept_downloads=True,permissions=['clipboard-read','clipboard-write'])
 requests=[]
 def route(r):
  requests.append((r.request.method,r.request.url))
  r.continue_() if r.request.url.startswith(origin) else r.abort()
 c.route('**/*',route)
 c.route('**/assets/cloud.js',lambda r:r.fulfill(content_type='text/javascript',body="""
export const state={user:null,ready:true,admin:false};
export async function connect(){return state;}
export async function watchSite(){return ()=>{};}
export async function loadProfile(){return null;}
export async function loadReviews(){return {items:[],more:false};}
export function friendlyError(e){return e.message;}
"""))
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(origin,wait_until='networkidle')
 expect(q.locator('h1:visible')).to_contain_text('Ngàn năm tuổi.')
 assert q.locator('.pocket-hero>img').bounding_box()['y']<500
 assert q.evaluate("localStorage.getItem('oceo-passport-guest')") is None
 q.locator('.campaign-home [data-journey-action=sample]').click()
 expect(q.locator('#modal')).to_have_attribute('data-view','story-sample')
 assert q.locator('.story-sample img').evaluate('e=>e.complete&&e.naturalWidth===1080&&e.naturalHeight===1920')
 q.locator('.story-sample [data-journey-action=open]').click()
 expect(q.locator('#view-day')).to_be_visible();assert not q.locator('#modal').evaluate('e=>e.open')
 progress=q.locator('.journey-progress strong');expect(progress.nth(0)).to_have_text('0 / 3');expect(progress.nth(1)).to_have_text('0 / 15')
 q.locator('[data-journey-action=start]').click();expect(q.locator('.journey-active')).to_be_visible()
 assert q.evaluate("JSON.parse(localStorage.getItem('oceo-passport-guest:journey')).active")
 assert q.evaluate("localStorage.getItem('oceo-passport-guest')") is None
 q.reload(wait_until='networkidle');expect(q.locator('.journey-active')).to_be_visible()
 q.locator('.journey-primary-actions [data-journey-action=map]').click()
 q.wait_for_function("document.querySelectorAll('.osm-pin').length+[...document.querySelectorAll('[data-cluster-count]')].reduce((n,e)=>n+Number(e.dataset.clusterCount),0)===3")
 expect(q.locator('#journey-map-bar [aria-pressed=true]')).to_be_visible()
 q.locator('#journey-map-bar [data-journey-action=all-map]').first.click()
 q.wait_for_function("document.querySelectorAll('.osm-pin').length+[...document.querySelectorAll('[data-cluster-count]')].reduce((n,e)=>n+Number(e.dataset.clusterCount),0)===11")
 # Old valid stamps count in both independent projections; no claim about visit dates.
 ids=['nha-trung-bay-van-hoa-oc-eo','linh-son-bac','go-giong-cat','go-cay-thi']
 q.evaluate("ids=>localStorage.setItem('oceo-passport-guest',JSON.stringify({name:'Khám phá',badges:[...ids,ids[0],'not-a-stop']}))",ids)
 q.goto(origin+'/?journey=theo-dau-co-vat-v1&uid=DO-NOT-SHARE#day',wait_until='networkidle')
 expect(q.locator('.journey-progress strong').nth(0)).to_have_text('3 / 3');expect(q.locator('.journey-progress strong').nth(1)).to_have_text('4 / 15')
 q.locator('.journey-finish [data-journey-action=story]').click()
 expect(q.locator('#modal')).to_have_attribute('data-view','story')
 assert q.locator('#modal').bounding_box()=={'x':0,'y':0,'width':390,'height':844}
 expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=15000)
 assert q.locator('[data-story-field=featured] option').count()==4
 q.locator('[data-story-field=photo]').set_input_files(str(repo/'assets/photos/ba-the.jpg'))
 expect(q.locator('.story-photo-controls')).to_be_visible();expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=15000)
 q.locator('[data-story-field=name]').fill('Khám phá')
 q.locator('[data-story-field=caption]').fill('Góc kể · 我的Óc Eo')
 q.evaluate("async()=>{const {setLanguage}=await import('/assets/i18n.js');setLanguage('en')}")
 expect(q.locator('[data-story-field=name]')).to_have_value('Khám phá');expect(q.locator('[data-story-field=caption]')).to_have_value('Góc kể · 我的Óc Eo')
 expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=15000)
 q.locator('[data-story-field=fit]').select_option('contain')
 expect(q.locator('[data-story-field=focusY]')).to_be_disabled()
 q.locator('[data-story-mode=trip]').click();expect(q.locator('[data-story-action=download]')).to_be_enabled(timeout=15000)
 before=q.evaluate("localStorage.getItem('oceo-passport-guest')")
 with q.expect_download() as pending:q.locator('[data-story-action=download]').click()
 png=Path(pending.value.path()).read_bytes();assert png[:8]==b'\x89PNG\r\n\x1a\n';assert struct.unpack('>II',png[16:24])==(1080,1920)
 q.locator('[data-story-action=copy]').click()
 link=q.evaluate('navigator.clipboard.readText()');assert link==origin+'/index.html?journey=theo-dau-co-vat-v1#day',link
 assert 'uid' not in link and 'Khám' not in link
 q.locator('#modal-body').evaluate('e=>e.scrollTop=0');q.screenshot(path='/workspace/outputs/oc-eo-personal-story-editor.png')
 assert q.evaluate("localStorage.getItem('oceo-passport-guest')")==before
 q.locator('#close-modal').click();expect(q.locator('.story-creator')).to_have_count(0)
 q.goto(link,wait_until='networkidle');expect(q.locator('#view-day')).to_be_visible()
 assert not [r for r in requests if r[0] not in ['GET','HEAD']],requests
 # No-stamp browsing, opening source cards and incoming links do not issue stamps.
 q.evaluate("localStorage.removeItem('oceo-passport-guest')")
 q.goto(origin+'/?journey=theo-dau-co-vat-v1#day',wait_until='networkidle')
 expect(q.locator('.journey-progress strong').nth(0)).to_have_text('0 / 3')
 for lang in ['vi','en','zh']:
  q.locator('#language-select').select_option(lang)
  for width in [320,390,430]:
   q.set_viewport_size({'width':width,'height':844});assert q.evaluate('document.documentElement.scrollWidth<=innerWidth'),(lang,width)
  assert not q.evaluate("async()=>{const m=await import('/assets/i18n.js');return m.untranslatedUI(document.querySelector('#view-day'))}"),lang
 assert not errors,errors
 b.close()
print('PASS: guest home/sample/journey, persistent trip without stamps, 3-stop map/all map, 3/3 vs4/15, actual-photo PNG1080x1920, native text preserved across language, clean referral URL, no profile/photo network writes, 3-language phone widths.')
