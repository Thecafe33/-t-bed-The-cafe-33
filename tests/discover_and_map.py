"""Discovery entry points and map selection with local vector cartography and deterministic GPS, no live writes."""
from playwright.sync_api import sync_playwright,expect
from ui_helpers import fill_map_search
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce',permissions=['geolocation'],geolocation={'latitude':10.2465818,'longitude':105.1549758,'accuracy':10})
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(origin,wait_until='networkidle')
 expect(page.locator('.curiosity-card')).to_have_count(3)
 page.locator('.curiosity-card[data-place=go-giong-cat]').click();expect(page.locator('.detail-description').first).to_contain_text('Nandin');page.locator('#close-modal').click()
 page.locator('.curiosity-card[data-place=nha-trung-bay-cu-ba-the]').click();expect(page.locator('.access-warning')).to_contain_text('mưa');expect(page.locator('#checkin')).to_have_count(0);page.locator('#close-modal').click()
 page.locator('.campaign-landscape>summary').click();page.locator('#surprise-me').click();first=page.locator('#modal h2').first.inner_text();page.locator('#close-modal').click();page.locator('#surprise-me').click();assert page.locator('#modal h2').first.inner_text()!=first;page.locator('#close-modal').click()
 page.locator('.app-tabbar [data-route=map]').click();expect(page.locator('#map-network-state')).not_to_be_visible()
 expect(page.locator('.townwalk-cartography svg').first).to_be_visible()
 expect(page.locator('.leaflet-tile')).to_have_count(0)
 assert not page.locator('#map-directory').evaluate('e=>e.open')
 assert page.locator('#osm-map').bounding_box()['height']>=450
 page.wait_for_function("document.querySelectorAll('.osm-pin').length+[...document.querySelectorAll('[data-cluster-count]')].reduce((n,e)=>n+Number(e.dataset.clusterCount),0)===11")
 expect(page.locator('.map-cluster').first).to_be_visible()
 largest=max(int(v) for v in page.locator('[data-cluster-count]').all_text_contents())
 page.locator(f'.map-cluster:has([data-cluster-count="{largest}"])').first.click()
 # Zooming a group must expose named real pins, rather than opening an arbitrary place.
 expect(page.locator('#modal')).not_to_be_visible();page.wait_for_function("document.querySelectorAll('.osm-pin').length>=2")
 page.locator('#fit-map').click();page.locator('[data-map-jump=chua-linh-son]').click()
 expect(page.locator('#map-selection h2')).to_have_text('Chùa Linh Sơn');expect(page.locator('#modal')).not_to_be_visible()
 expect(page.locator('.osm-pin[title="Chùa Linh Sơn"]')).to_have_class(__import__('re').compile('is-selected'))
 page.locator('#map-selection [data-place]').click();expect(page.locator('#modal')).to_be_visible();page.locator('#close-modal').click()
 # Returning to Map preserves the chosen point and zoom (the neighbouring Linh Sơn pins stay separate).
 page.locator('.app-tabbar [data-route=day]').click();page.locator('.app-tabbar [data-route=map]').click()
 expect(page.locator('#map-selection h2')).to_have_text('Chùa Linh Sơn');expect(page.locator('.osm-pin[title="Linh Sơn Nam"]')).to_be_visible()
 page.locator('#locate-me').click();expect(page.locator('.map-user-location')).to_have_count(1)
 expect(page.locator('#map-selection h2')).to_have_text('Chùa Linh Sơn');expect(page.locator('#map-selection')).to_contain_text('đường chim bay')
 assert not page.evaluate("JSON.parse(localStorage.getItem('oceo-passport-guest')||'{}').badges?.length")
 # Pending coordinates are searchable in the directory; no made-up pin or external directions.
 fill_map_search(page,'go 6 thuan');expect(page.locator('.map-list-item')).to_have_count(1)
 expect(page.locator('#map-directory')).to_have_attribute('open','');expect(page.locator('.osm-pin')).to_have_count(0)
 expect(page.locator('#map-selection')).to_contain_text('chưa có pin')
 page.locator('.map-list-item').click();expect(page.locator('#checkin')).to_be_disabled();expect(page.locator('#focus-on-map')).to_have_count(0);page.locator('#close-modal').click()
 fill_map_search(page,'');page.keyboard.press('Escape');page.evaluate('scrollTo(0,0)');page.locator('#fit-map').click()
 # A selected point at any phone width stays above the nav; controls do not overflow the map.
 for width in [320,360,390,430,768,1440]:
  page.set_viewport_size({'width':width,'height':844});page.locator('[data-map-jump=chua-linh-son]').click() if page.locator('[data-map-jump=chua-linh-son]').count() else None
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
  box=page.locator('#map-selection').bounding_box();board=page.locator('.map-board').bounding_box()
  assert box['x']>=board['x'] and box['x']+box['width']<=board['x']+board['width']+1
 for width,height in [(320,568),(360,640),(390,844)]:
  page.set_viewport_size({'width':width,'height':height});page.evaluate('scrollTo(0,0)')
  page.locator('#fit-map').click();page.locator('[data-map-jump=chua-linh-son]').click();page.evaluate('scrollTo(0,0)')
  actions=page.locator('.map-card-actions').bounding_box();nav=page.locator('.app-tabbar').bounding_box()
  assert actions['y']+actions['height']<=nav['y'],(width,height,actions,nav)
 assert not errors,errors
 b.close()
print('PASS: three source-linked curiosity cards, non-repeating surprise, clustered real positions, pin preview, preserved selection/zoom, opt-in nearby search without stamps/storage, pending locations, mobile map layout. Local vectors and test GPS only; no live writes.')
