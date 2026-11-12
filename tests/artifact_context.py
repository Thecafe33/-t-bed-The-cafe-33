"""Opening artifact details must not navigate away from the referring page."""
from playwright.sync_api import sync_playwright, expect
ORIGIN = 'http://127.0.0.1:8000'
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True)
    context = browser.new_context(viewport={'width':390,'height':844}, reduced_motion='reduce', service_workers='block')
    context.route('**/*', lambda r: r.continue_() if r.request.url.startswith(ORIGIN) else r.abort())
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(ORIGIN + '/#story', wait_until='networkidle')
    for close in ['#close-modal', '#artifact-back', '[data-action="artifact-return"]', 'Escape']:
        link = page.locator('#story-content [data-discovery-record]').first
        link.scroll_into_view_if_needed()
        page.evaluate("document.addEventListener('click',()=>{window.beforeArtifact={y:scrollY,history:history.length}},{capture:true,once:true})")
        link.click()
        before = page.evaluate('beforeArtifact')
        expect(page.locator('#modal')).to_be_visible()
        expect(page.locator('#view-story')).to_be_visible()
        assert page.url.endswith('#story')
        assert page.evaluate('history.length') == before['history']
        expect(page.locator('#artifact-back')).to_have_text('← Quay lại')
        if close == 'Escape': page.keyboard.press('Escape')
        else: page.locator(close).click()
        expect(page.locator('#modal')).to_be_hidden()
        assert abs(page.evaluate('scrollY') - before['y']) < 2, (close,before,page.evaluate('scrollY'))
        expect(link).to_be_focused()
    # Artifact links inside a destination dialog keep the Explore background too.
    page.goto(ORIGIN + '/#explore', wait_until='networkidle')
    page.locator('#places-grid [data-place="chua-linh-son"]').first.click()
    page.locator('#modal [data-artifact]').first.click()
    expect(page.locator('#view-explore')).to_be_visible()
    assert page.url.endswith('#explore')
    page.locator('#close-modal').click()
    expect(page.locator('#modal')).to_be_hidden()
    assert page.url.endswith('#explore')
    assert not errors, errors
    browser.close()
print('PASS: Story and place links preserve tab/history; X, back, footer and Escape retain Story scroll/focus.')
