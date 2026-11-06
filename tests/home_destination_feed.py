"""Phone home: visible landscape, clear destinations, save without losing position."""
from playwright.sync_api import sync_playwright,expect
origin='http://127.0.0.1:8000'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},service_workers='block',reduced_motion='reduce')
 c.route('**/*',lambda r:r.continue_() if r.request.url.startswith(origin) else r.abort())
 q=c.new_page();errors=[];q.on('pageerror',lambda e:errors.append(str(e)))
 q.goto(origin,wait_until='networkidle')
 photo=q.locator('.pocket-hero>img');assert photo.evaluate('e=>e.complete&&e.naturalWidth>0')
 assert photo.bounding_box()['y']<500
 assert q.locator('.cover-wordmark').bounding_box()['y']<photo.bounding_box()['y']
 assert q.locator('.artifact-launch').bounding_box()['y']>q.locator('#places-grid').bounding_box()['y']
 expect(q.locator('h1:visible')).to_have_count(1)
 for action,view in [('.hub-map','map'),('.hub-walk','day'),('.hub-community','community')]:
  q.locator(action).click();expect(q.locator(f'#view-{view}')).to_be_visible()
  q.locator('.app-tabbar [data-route=explore]').click()
 q.locator('.hub-story').click();expect(q.locator('#modal')).to_have_attribute('data-view','story-sample');q.locator('#close-modal').click()
 rail=q.locator('#places-grid');first=q.locator('.feed-card').first
 expect(first.locator('h3')).to_have_text('Chùa Linh Sơn')
 assert first.locator('img').evaluate('e=>e.complete&&e.naturalWidth>0')
 assert rail.evaluate('e=>e.scrollWidth>e.clientWidth')
 q.locator('[data-catalog-move="1"]').click();q.wait_for_function("document.querySelector('#places-grid').scrollLeft>250")
 position=rail.evaluate('e=>e.scrollLeft')
 card=q.locator('.feed-card').nth(1);save=card.locator('[data-save-place]');site=save.get_attribute('data-save-place')
 save.click();expect(save).to_have_attribute('aria-pressed','true');assert abs(rail.evaluate('e=>e.scrollLeft')-position)<3
 assert q.evaluate("localStorage.getItem('oceo-passport-guest')") is None
 card.locator('.feed-open').click();expect(q.locator('#modal')).to_be_visible()
 expect(q.locator('#save-place')).to_contain_text('Đã lưu')
 q.locator('#close-modal').click();q.locator('.app-tabbar [data-route=day]').click();expect(q.locator('#saved-trip')).to_contain_text('Linh Sơn Nam')
 q.locator('.app-tabbar [data-route=explore]').click()
 q.locator('#place-search').fill('Gò Sáu Thuận');expect(q.locator('.feed-card')).to_have_count(1)
 assert rail.evaluate('e=>getComputedStyle(e).display')=='grid'
 expect(q.locator('.feed-card .place-media-note')).to_be_visible()
 q.locator('#place-search').fill('Nhà trưng bày cũ');expect(q.locator('.place-access-warning')).to_be_visible()
 q.locator('#place-search').fill('')
 # The longer hidden-gem warning stays fully usable when reached in the rail.
 hidden=q.locator('.feed-card:has([data-save-place=nha-trung-bay-cu-ba-the])')
 hidden.locator('.feed-open').scroll_into_view_if_needed()
 q.wait_for_function("(()=>{const rail=document.querySelector('#places-grid'),card=document.querySelector('.feed-card:has([data-save-place=nha-trung-bay-cu-ba-the])');return rail.clientHeight>=card.offsetHeight})()")
 hidden.locator('.feed-open').click();expect(q.locator('.access-warning')).to_contain_text('mưa');q.locator('#close-modal').click()
 for lang in ['vi','en','zh']:
  q.locator('#language-select').select_option(lang)
  for width in [320,390,430]:
   q.set_viewport_size({'width':width,'height':844})
   assert q.evaluate('document.documentElement.scrollWidth<=innerWidth'),(lang,width)
   title=q.locator('.townwalk-cover h1').bounding_box();photo=q.locator('.townwalk-cover>img').bounding_box()
   assert title['y']+title['height']<=photo['y']+5,(lang,width)
   for btn in q.locator('.hub-widget').all():
    assert btn.locator('.hub-cta').bounding_box()['height']>=44
    assert btn.evaluate('e=>e.scrollWidth<=e.clientWidth+1'),(lang,width)
  assert not q.evaluate("async()=>(await import('/assets/i18n.js')).untranslatedUI(document.querySelector('#view-explore'))"),lang
 assert not errors,errors
 b.close()
print('PASS: mountain first, four widget actions, photo-first swipe rail, save keeps scroll and grants no stamps, saved trip sync, search, access warning, three languages at320/390/430.')
