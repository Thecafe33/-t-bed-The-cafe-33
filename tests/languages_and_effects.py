"""Public localisation, accessible motion and opt-in audio; substituted cloud only."""
from pathlib import Path
import json,struct
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
out=Path('/workspace/outputs');out.mkdir(exist_ok=True)
fixture='''
import {cloneDefault} from './model.js';
export const state={user:{uid:'locale-test'},admin:false,ready:true};
export async function connect(){return state;}
export async function watchSite(cb){const data=cloneDefault();data.operator='Test operator';data.contactEmail='test@example.org';cb(data);return ()=>{};}
export async function loadProfile(){return null;}
export async function saveProfile(){}
export async function loadReviews(){return {items:[{id:'test-review',name:'Khám phá',text:'Bản đồ',rating:5,photoURL:'/assets/art.svg'}],more:false};}
export async function myReviews(){return [];}
export async function myReports(){return [];}
export function friendlyError(e){return e.message;}
'''
instrument='''
window.__audioContexts=0;window.__tones=0;window.__reveals=0;
const Base=window.AudioContext;
if(Base)window.AudioContext=class extends Base {
 constructor(...args){super(...args);window.__audioContexts++;}
 createOscillator(){window.__tones++;return super.createOscillator();}
};
const animate=Element.prototype.animate;
Element.prototype.animate=function(...args){if(this.classList.contains('app-view'))window.__reveals++;return animate.apply(this,args)};
'''
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(service_workers='block',viewport={'width':390,'height':844},accept_downloads=True)
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 c.route('**/assets/cloud.js',lambda r:r.fulfill(status=200,content_type='text/javascript',body=fixture))
 page=c.new_page();errors=[];failures=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:failures.append(r.url) if r.url.startswith(origin) and r.status>=400 else None)
 page.add_init_script(instrument)
 page.goto(origin,wait_until='networkidle');expect(page.locator('.place-card')).to_have_count(16)
 assert page.evaluate('window.__audioContexts')==0
 expect(page.locator('#sound-toggle')).to_have_attribute('aria-pressed','false')
 ids=page.evaluate("async()=>{const {CURATED}=await import('/assets/content.js');return [...CURATED.places,...CURATED.stops].map(p=>p.id)}")
 pending=set()
 def collect():
  pending.update(page.evaluate("async()=>{const m=await import('/assets/i18n.js');return m.untranslatedUI()}"))
 def go(tab):page.locator(f'.app-tabbar [data-route={tab}]').click()
 for lang in ['en','zh']:
  page.locator('#language-select').select_option(lang)
  expect(page.locator('html')).to_have_attribute('lang','en' if lang=='en' else 'zh-Hans')
  go('explore');page.evaluate('scrollTo(0,0)');collect()
  for width in [320,390,430,1440]:
   page.set_viewport_size({'width':width,'height':844})
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(lang,width)
   for button in page.locator('.app-tabbar a').all():
    assert button.bounding_box()['height']>=44
  page.set_viewport_size({'width':390,'height':844})
  page.screenshot(path=str(out/f'oc-eo-{lang}-phone.png'))
  for tab in ['map','day','pass','community']:go(tab);collect()
  assert page.locator('.memory p').text_content()=='Bản đồ'
  assert page.locator('.memory-footer [data-no-translate]').text_content()=='Khám phá'
  go('map')
  for id in ids:
   page.evaluate("id=>document.querySelector('#map-list [data-place=\"'+id+'\"]').click()",id)
   expect(page.locator('#modal')).to_be_visible();collect()
   assert page.locator('#modal').evaluate('e=>e.scrollWidth<=e.clientWidth+1'),(lang,id)
   page.locator('#close-modal').click()
  page.locator('#account-button').click();collect();page.locator('#my-reviews').click();collect();page.locator('#close-modal').click()
  go('community');page.locator('#write-review').click();collect()
  page.locator('[name=name]').fill('Khám phá');page.locator('[name=text]').fill('Bản đồ')
  # A language change must never edit user input, even if it matches a UI label.
  page.evaluate("async lang=>(await import('/assets/i18n.js')).setLanguage(lang)",lang)
  expect(page.locator('[name=name]')).to_have_value('Khám phá');expect(page.locator('[name=text]')).to_have_value('Bản đồ')
  page.locator('#close-modal').click();page.locator('[data-report]').click();collect()
  # Translated option labels must retain the original stored category value.
  assert page.locator('#report-form [name=reason]').input_value()=='Xâm phạm quyền riêng tư'
  page.locator('#close-modal').click()
  go('pass');page.locator('#passport-name').fill('Linh · Óc Eo')
  page.evaluate("()=>{window.__svg='';const create=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{if(blob.type.startsWith('image/svg+xml'))blob.text().then(s=>window.__svg=s);return create(blob)}}")
  with page.expect_download() as download:page.locator('#save-pass-image').click()
  data=Path(download.value.path()).read_bytes();assert struct.unpack('>II',data[16:24])==(1080,1920)
  Path(out/f'oc-eo-pass-{lang}.png').write_bytes(data)
  assert page.evaluate("window.__svg.includes('Linh · Óc Eo') && window.__svg.includes('url(data:')")
  assert page.evaluate("window.__svg.includes('Your first stamp')" if lang=='en' else "window.__svg.includes('第一枚印章')")
 assert not pending,sorted(pending)
 page.reload(wait_until='networkidle');expect(page.locator('#language-select')).to_have_value('zh')
 assert page.evaluate('window.__audioContexts')==0
 go('pass');page.locator('#sound-toggle').click();expect(page.locator('#sound-toggle')).to_have_attribute('aria-pressed','true')
 page.wait_for_function('window.__tones>0')
 tones=page.evaluate('window.__tones');page.locator('#toggle-book').click();page.wait_for_function(f'window.__tones>{tones}')
 page.locator('#sound-toggle').click();tones=page.evaluate('window.__tones');page.locator('#open-book').click()
 assert page.evaluate('window.__tones')==tones
 # Normal tab changes invoke one short reveal; reduced-motion changes invoke none.
 reveals=page.evaluate('window.__reveals');go('day');assert page.evaluate('window.__reveals')==reveals+1
 page.emulate_media(reduced_motion='reduce');reveals=page.evaluate('window.__reveals');go('pass');assert page.evaluate('window.__reveals')==reveals
 page.locator('#language-select').select_option('vi');go('explore');expect(page.locator('h1:visible')).to_contain_text('Óc Eo,')
 page.goto(origin+'/privacy.html',wait_until='networkidle');page.locator('#language-select').select_option('zh')
 expect(page.locator('#privacy-content')).to_contain_text('仅在点击签到或地图上的附近地点按钮时请求位置')
 expect(page.locator('#privacy-content')).to_contain_text('隐私')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not page.evaluate("async()=>{const m=await import('/assets/i18n.js');return m.untranslatedUI()} ")
 assert not errors,errors
 assert not failures,failures
 c.close()
 # Real worker: saved Chinese UI, local font and Pass export must work offline.
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce',accept_downloads=True)
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();page.goto(origin,wait_until='networkidle');page.locator('#language-select').select_option('zh')
 page.evaluate('async()=>{await navigator.serviceWorker.ready}');page.wait_for_function('!!navigator.serviceWorker.controller')
 c.set_offline(True);page.reload(wait_until='domcontentloaded');expect(page.locator('.place-card')).to_have_count(16)
 expect(page.locator('html')).to_have_attribute('lang','zh-Hans');go('map')
 expect(page.locator('.townwalk-cartography svg').first).to_be_visible()
 expect(page.locator('#map-network-state')).not_to_be_visible()
 expect(page.locator('.leaflet-tile')).to_have_count(0)
 go('pass')
 with page.expect_download() as download:page.locator('#save-pass-image').click()
 assert Path(download.value.path()).stat().st_size>10000
 b.close()
print('PASS: VI/EN/Chinese public views + 25 details, privacy, preserved user text, stable report values, 9:16 local-font PNG, mobile widths, language persistence/offline; muted by default, opt-in tones and reduced motion. No live cloud writes.')
