from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 q=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 q.goto('http://127.0.0.1:8000/#artifacts',wait_until='networkidle')
 assert q.locator('.artifact-deck-actions,#artifact-open,#artifact-next,#artifact-previous').count()==0
 q.locator('#artifact-site-filter').select_option('go-cay-thi')
 card=q.locator('[data-deck-active]');assert card.evaluate('e=>getComputedStyle(e).backgroundColor') not in ['rgba(0, 0, 0, 0)','transparent']
 card.click();expect(q.locator('.artifact-detail')).to_be_visible();q.locator('#artifact-back').click()
 q.locator('[data-deck-active]').press('ArrowRight');expect(q.locator('[data-deck-active]')).to_have_attribute('data-gallery-index','1')
 q.locator('#artifact-site-filter').select_option('go-giong-cat');img=q.locator('[data-deck-active] img');assert 'heritage-art/nandin' in img.get_attribute('src');img.evaluate('(i)=>i.decode()')
 q.locator('#artifact-site-filter').select_option('linh-son-bac')
 q.locator('#artifact-view-toggle').click();assert 'heritage-art/linh-son' in q.locator('[data-artifact="phat-linh-son-bac"] img').get_attribute('src')
 q.goto('http://127.0.0.1:8000/#map',wait_until='networkidle');q.locator('#map-directory > summary').click()
 q.locator('[data-map-show="go-ut-trach"]').click();expect(q.locator('#map-selection')).to_contain_text('Gò Út Trạnh')
 assert not errors,errors
 b.close()
print('PASS: removed buttons, opaque Cây Thị, direct tap/keyboard, original illustration assets and Út Trạnh map selection')
