import test from 'node:test';
import assert from 'node:assert/strict';
import {CURATED} from '../assets/content.js';
import {JOURNEY,journeyState,journeyHTML,journeyMessages} from '../assets/journey.js';

const fixture=()=>structuredClone({places:CURATED.places,stops:CURATED.stops});

test('a fixed three-stop journey counts unique valid profile badges separately from the Pass',()=>{
 const site=fixture(),before=structuredClone(site),badges=[JOURNEY.stops[0],JOURNEY.stops[0],'chua-linh-son','fake'];
 const state=journeyState(site,badges);
 assert.equal(state.count,1);assert.equal(state.total,3);assert.equal(state.pass.count,2);assert.equal(state.pass.total,15);
 assert.equal(state.complete,false);assert.equal(state.canStart,true);assert.equal(state.canStory,true);
 assert.deepEqual(state.stops.map(stop=>stop.id),JOURNEY.stops);
 assert.equal(state.ready.length,3);assert.deepEqual(site,before);assert.equal(badges.length,4);
 assert.equal(journeyState(site,[...JOURNEY.stops]).complete,true);
 assert.equal(journeyState(site,['chua-linh-son']).count,0);
 assert.equal(journeyState(site,['chua-linh-son']).canStory,true);
 assert.equal(journeyState(site,['fake']).canStory,false);
});

test('missing, out-of-scope or unsourced stops stay in the denominator and cannot be started',()=>{
 for(const change of [
  p=>({...p,scopeConfirmed:false}),p=>({...p,sourceUrl:''}),p=>({...p,category:'rest'}),p=>({...p,collectible:false}),
 ]){
  const site=fixture();site.places=site.places.map(p=>p.id===JOURNEY.stops[1]?change(p):p);
  const state=journeyState(site,[...JOURNEY.stops]);
  assert.equal(state.total,3);assert.equal(state.count,2);assert.equal(state.complete,false);assert.equal(state.canStart,false);
  assert.equal(state.stops[1].available,false);
 }
 const site=fixture();site.places=site.places.filter(p=>p.id!==JOURNEY.stops[2]);
 assert.equal(journeyState(site,JOURNEY.stops).count,2);assert.equal(journeyState(site,JOURNEY.stops).total,3);
 assert.equal(journeyState(undefined,['fake']).total,3);
});

test('temporary closure or missing GPS disables new actions without rewriting an existing valid stamp',()=>{
 for(const changes of [{accessStatus:'closed'},{accessStatus:'temporarily-closed'},{verified:false},{lat:null},{coordinateSource:''}]){
  const site=fixture();site.places=site.places.map(p=>p.id===JOURNEY.stops[0]?{...p,...changes}:p);
  const state=journeyState(site,[JOURNEY.stops[0]]);
  assert.equal(state.total,3);assert.equal(state.count,1);assert.equal(state.canStart,false);assert.equal(state.stops[0].available,false);
  const html=journeyHTML(site,[JOURNEY.stops[0]]);
  assert.match(html,new RegExp(`data-place="${JOURNEY.stops[0]}" disabled`));
 }
});

test('ambiguous duplicate records and non-array badge input cannot fabricate route progress',()=>{
 const site=fixture();site.places.push({...site.places.find(p=>p.id===JOURNEY.stops[0])});
 const state=journeyState(site,[...JOURNEY.stops]);
 assert.equal(state.count,2);assert.equal(state.total,3);assert.equal(state.canStart,false);
 assert.equal(journeyState(fixture(),{[JOURNEY.stops[0]]:true}).count,0);
});

test('mobile journey markup offers source-led stops, distinct progress, safe booking and complete translation rows',()=>{
 const html=journeyHTML(fixture(),['chua-linh-son'],{active:true});
 assert.match(html,/data-journey-id="theo-dau-co-vat-v1"/);assert.match(html,/data-journey-version="1"/);
 assert.equal((html.match(/data-journey-stop=/g)||[]).length,3);
 for(const action of ['stop','story','map','share','pack'])assert.ok(html.includes(`data-journey-action="${action}"`));
 assert.match(journeyHTML(fixture(),[]),/data-journey-action="start"/);
 assert.match(html,/href="https:\/\/the-cafe-33.web.app\/?"/);
 assert.match(html,/không xác nhận thời điểm/);assert.match(html,/không đồng nghĩa/);assert.match(html,/không cộng vào tiến độ 3 điểm của lộ trình hoặc cấp thêm tem/);
 assert.equal((html.match(/class="journey-source text-button"/g)||[]).length,3);
 assert.ok(journeyMessages.length>35);assert.ok(journeyMessages.every(row=>row.length===3&&row.every(value=>typeof value==='string'&&value.trim())));
 const site=fixture();site.stops.find(p=>p.id==='the-cafe-33').bookingUrl='javascript:alert(1)';
 assert.doesNotMatch(journeyHTML(site,[]),/javascript:/);
 site.places[0].name='<img src=x onerror=alert(1)>';
 assert.doesNotMatch(journeyHTML(site,[]),/<img src=x/);
});
