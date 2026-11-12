from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 q=b.new_page(reduced_motion='reduce');errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 q.goto('http://127.0.0.1:8000/',wait_until='networkidle')
 for w in [320,390,768,1440]:
  q.set_viewport_size({'width':w,'height':844})
  r=q.evaluate('''()=>{const r=document.querySelector('#places-grid').getBoundingClientRect(),a=document.querySelector('.app-main').getBoundingClientRect();return [r.left-a.left,a.right-r.right,document.documentElement.scrollWidth<=innerWidth]}''')
  assert abs(r[0])<=1 and abs(r[1])<=1 and r[2],(w,r)
 q.goto('http://127.0.0.1:8000/#map',wait_until='networkidle')
 q.locator('#map-directory > summary').click();q.locator('[data-map-show="go-sau-thuan"]').click()
 expect(q.locator('#map-selection')).to_contain_text('Đối diện Chùa Linh Sơn')
 expect(q.locator('#map-selection .directions-link')).to_contain_text('Đến mốc tham khảo')
 assert q.evaluate('''async()=>{const {CURATED}=await import('/assets/content.js');const {canCollectStamp}=await import('/assets/model.js');return !canCollectStamp(CURATED.places.find(p=>p.id==='go-sau-thuan'))}''')
 assert not errors,errors
 b.close()
print('PASS: edge-to-edge destination carousel; Sau Thuan landmark selection, explicit location hint, no false GPS stamp eligibility')
