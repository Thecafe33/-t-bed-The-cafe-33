"""Owned cartography loads from local data; handles failure and preserves provenance."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 c.route('**/assets/data/oceo-town-map.geojson',lambda r:r.fulfill(status=404,body='Missing test fixture'))
 page=c.new_page();errors=[];requests=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
 page.goto(origin+'/#map',wait_until='networkidle');expect(page.locator('#map-network-state')).to_be_visible()
 page.locator('#show-map-list').click();expect(page.locator('#map-directory')).to_have_attribute('open','')
 expect(page.locator('#map-list')).to_contain_text('Gò Sáu Thuận')
 c.unroute('**/assets/data/oceo-town-map.geojson');page.locator('#reload-map').click()
 expect(page.locator('#map-network-state')).not_to_be_visible();expect(page.locator('.townwalk-cartography svg').first).to_be_visible()
 assert page.locator('.townwalk-cartography path').count()>100
 expect(page.locator('.leaflet-tile')).to_have_count(0)
 expect(page.locator('.leaflet-control-attribution')).to_contain_text('OpenStreetMap contributors')
 page.locator('#map-search').fill('xofa');page.locator('.map-list-item').click()
 expect(page.locator('.source-links')).to_contain_text('Trang địa điểm Google Maps')
 assert 'Plus Code' not in page.locator('#modal').inner_text()
 expect(page.locator('.coordinate-details')).not_to_have_attribute('open','')
 page.locator('.coordinate-details>summary').click();expect(page.locator('.coordinate-details')).to_contain_text('Plus Code')
 assert not any('tile.openstreetmap.org' in url or 'maps.googleapis.com' in url for url in requests),requests
 assert not errors,errors
 b.close()
print('PASS: local vector failure/retry, directory fallback, real SVG geometry, no remote tile/API calls, compact OSM credit, plain Google listing label with inspectable Plus Code provenance. No live writes.')
