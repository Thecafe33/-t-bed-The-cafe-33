"""Deterministic UI integration checks using a substituted cloud transport.
The fixture never reaches Firebase, and test locations are not production content.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
fixture='''
import {cloneDefault} from './model.js';
export const state={user:{uid:'test-user'},admin:false,ready:true};
const fixture=cloneDefault(); fixture.stops=[]; fixture.itinerary=fixture.itinerary.map(s=>({...s,placeId:''})); fixture.operator='Đơn vị kiểm thử';fixture.contactEmail='test@example.org';
fixture.places=fixture.places.slice(0,1).map(p=>({...p,verified:true,scopeConfirmed:true,sourceUrl:'https://example.org/test-only',coordinateSource:'https://example.org/test-only-coordinates',lat:10.2557721,lng:105.1534925}));
export async function connect(){return state;}
export async function watchSite(cb){cb(fixture);return ()=>{};}
export async function loadProfile(){return null;}
export async function saveProfile(profile){window.__savedProfile=profile;}
export async function login(){}
export async function logout(){}
export async function loadReviews(){return {items:window.__testReview?[{id:'test-review',...window.__testReview}]:[],more:false};}
export async function preparePhoto(file){return file;}
export async function postReview(data){window.__testReview={...data,photoURL:'/assets/art.svg'};}
export async function myReviews(){return [];}
export async function myReports(){return [];}
export async function deleteAccount(){}
export async function reportReview(id,reason){window.__reported={id,reason};}
export function friendlyError(e){return e.message;}
'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
 ctx=browser.new_context(service_workers='block',viewport={'width':1100,'height':900},permissions=['geolocation'],geolocation={'latitude':10.2557721,'longitude':105.1534925,'accuracy':10},accept_downloads=True)
 ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith('http://127.0.0.1:8000') else r.abort())
 ctx.route('**/assets/cloud.js',lambda r:r.fulfill(status=200,content_type='text/javascript',body=fixture))
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8000',wait_until='networkidle')
 expect(page.locator('.place-card')).to_have_count(1)
 page.locator('.app-tabbar [data-route=map]').click()
 expect(page.locator('.osm-pin')).to_have_count(1)
 expect(page.locator('#schematic')).to_have_count(0)
 page.locator('.app-tabbar [data-route=explore]').click()
 page.locator('.place-art').click()
 expect(page.locator('#checkin')).to_be_enabled()
 page.locator('#checkin').click()
 expect(page.locator('.desk-stamp')).to_have_count(1)
 page.locator('#toggle-book').click()
 expect(page.locator('.passport-cover')).to_be_visible()
 page.locator('#open-book').click()
 expect(page.locator('.passport-spread')).to_be_visible()
 page.locator('#passport-name').fill('Bạn Óc Eo')
 page.locator('#save-name').click()
 expect(page.locator('#certificate')).to_be_enabled()
 page.evaluate("() => { window.__exportSVG=''; const create=URL.createObjectURL.bind(URL); URL.createObjectURL=function(blob){if(blob.type.startsWith('image/svg+xml'))blob.text().then(t=>window.__exportSVG=t);return create(blob)}; }")
 page.locator('#certificate').click()
 expect(page.locator('.certificate-preview')).to_be_visible()
 with page.expect_download() as download:
  page.locator('#download-certificate').click()
 assert download.value.suggested_filename=='oc-eo-townwalk.png'
 assert page.evaluate("window.__exportSVG.includes('>ÓC EO</text>') && window.__exportSVG.includes('>TOWNWALK</text>') && !window.__exportSVG.includes('ký ức') && !window.__exportSVG.includes('hộ chiếu')")
 page.locator('#close-modal').click()
 page.locator('.app-tabbar [data-route=pass]').click();page.locator('#view-pass .memories-switch [data-memories=community]').click()
 page.locator('#write-review').click()
 page.locator('[name=name]').fill('Người khám phá')
 page.locator('[name=text]').fill('Một chuyến đi đáng nhớ. Nội dung kiểm thử, không gửi lên Firebase.')
 page.locator('[name=consent]').check()
 page.locator('#submit-review').click()
 assert page.evaluate('!window.__testReview')
 page.locator('#review-photo').set_input_files({'name':'photo.png','mimeType':'image/png','buffer':bytes.fromhex('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c636000020000050001a5f645400000000049454e44ae426082')})
 expect(page.locator('#photo-preview')).to_be_visible()
 page.locator('#submit-review').click()
 expect(page.locator('#modal')).not_to_be_visible()
 expect(page.locator('.memory p').first).to_contain_text('Một chuyến đi đáng nhớ.')
 assert page.evaluate('window.__testReview.rating')==5
 page.locator('[data-report]').click()
 page.locator('#report-form button').click()
 expect(page.locator('#modal')).not_to_be_visible()
 assert page.evaluate('window.__reported.id')=='test-review'
 # Distant GPS must not award a stamp. Clear the fixture profile and change geolocation.
 page.evaluate("localStorage.clear()")
 ctx.set_geolocation({'latitude':10.5,'longitude':105.5,'accuracy':10})
 page.goto('http://127.0.0.1:8000/#explore',wait_until='networkidle');page.reload(wait_until='networkidle');page.locator('.place-art').click();page.locator('#checkin').click()
 expect(page.locator('#toast')).to_contain_text('Bạn còn cách điểm')
 assert page.evaluate('!window.__savedProfile')
 assert not errors,errors
 print('PASS: verified GPS award; distant GPS refusal; animated passport cover; named PNG export; photo-required review form; immediate UI publication; report action (substituted cloud transport only).')
 browser.close()
