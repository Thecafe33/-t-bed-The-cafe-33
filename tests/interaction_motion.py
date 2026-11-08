from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
fixture="""export const state={user:null,ready:true,admin:false};export async function connect(){return state;}export async function watchSite(){return ()=>{};}export async function loadProfile(){return null;}export async function loadReviews(){return {items:[],more:false};}export function friendlyError(e){return e.message;}"""
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 for reduced in [False,True]:
  c=b.new_context(service_workers='block',viewport={'width':390,'height':844},permissions=['geolocation'],geolocation={'latitude':0,'longitude':0,'accuracy':5},reduced_motion='reduce' if reduced else 'no-preference')
  c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort());c.route('**/assets/cloud.js',lambda r:r.fulfill(content_type='text/javascript',body=fixture))
  c.add_init_script("localStorage.setItem('oceo-passport-guest',JSON.stringify({name:'Elio',badges:['nha-trung-bay-van-hoa-oc-eo','chua-linh-son','linh-son-bac','linh-son-nam']}));window.motionLog=[];const animate=Element.prototype.animate;Element.prototype.animate=function(frames,options){motionLog.push({className:this.className,frames});return animate.call(this,frames,options)}")
  q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(origin+'/#pass',wait_until='networkidle')
  q.locator('.pass-destinations summary').click();q.locator('.pass-destinations [data-place=go-giong-cat]').click();q.locator('#checkin').click();expect(q.locator('#toast')).to_contain_text('Bạn còn cách điểm')
  assert not q.evaluate("motionLog.some(x=>JSON.stringify(x.frames).includes('scale(1.38)'))")
  coords=q.evaluate("async()=>{const {CURATED}=await import('/assets/content.js');const p=CURATED.places.find(p=>p.id==='go-giong-cat');return {latitude:p.lat,longitude:p.lng,accuracy:5}}")
  c.set_geolocation(coords);q.locator('#checkin').click();stamp=q.locator('.stamp[data-place=go-giong-cat]');expect(stamp).to_be_visible();expect(q.locator('.passport-controls')).to_contain_text('2 / 2')
  q.wait_for_function("document.querySelector('.stamp[data-place=\"go-giong-cat\"]').getBoundingClientRect().bottom<innerHeight")
  assert q.evaluate("motionLog.some(x=>JSON.stringify(x.frames).includes('scale(1.38)'))")== (not reduced)
  q.wait_for_function("document.querySelectorAll('.stamp-spark').length===0")
  before=q.evaluate('motionLog.length');stamp.click();q.locator('#checkin').click();assert not q.evaluate("start=>motionLog.slice(start).some(x=>JSON.stringify(x.frames).includes('scale(1.38)'))",before)
  q.locator('.header-deck').click();q.locator('#artifact-open').click();expect(q.locator('.artifact-detail')).to_be_visible();q.locator('#artifact-back').click();expect(q.locator('[data-deck-active]')).to_have_count(1)
  q.locator('#artifact-next').click();q.evaluate("location.hash='explore'");expect(q.locator('#view-explore')).to_be_visible();expect(q.locator('#modal')).not_to_be_visible()
  assert not errors,errors;c.close()
 b.close()
print('PASS: failed GPS never celebrates; fifth earned stamp opens its page and animates once; particles clean up; reduced motion bypass; detail flip/back and closing mid-swipe stay usable. Local transport only.')
