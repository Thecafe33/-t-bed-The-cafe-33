import test from 'node:test';
import assert from 'node:assert/strict';
import {ARTIFACTS,artifactsForPlaces,artifactMessageRows} from '../assets/artifacts.js';
import {artifactSection,artifactListHTML} from '../assets/artifact-view.js';
import {CURATED} from '../assets/content.js';
import {passProgress} from '../assets/model.js';
globalThis.location={origin:'https://oceotownwalk.web.app'};
test('each artifact has a scoped discovery site, reviewed source and three-language evidence',()=>{
 assert.equal(ARTIFACTS.length,13);assert.equal(new Set(ARTIFACTS.map(a=>a.id)).size,13);
 for(const a of ARTIFACTS){
  const place=CURATED.places.find(p=>p.id===a.placeId);
  assert.ok(place?.scopeConfirmed);assert.equal(place.category,'heritage');assert.notEqual(place.collectible,false);
  assert.ok(['vanhoaoceo.angiang.gov.vn','ispace.angiang.vn'].includes(new URL(a.sourceUrl).host));
  for(const field of ['name','period','discovered','material','story','holding','onSite','atDisplay','question','explanation']){
   assert.equal(a[field].length,3);assert.ok(a[field].every(v=>typeof v==='string'&&v.trim()));
  }
  assert.equal(a.options.length,3);assert.ok(a.options.every(v=>v.length===3&&v.every(Boolean)));
  assert.ok(Number.isInteger(a.answer)&&a.answer>=0&&a.answer<a.options.length);
 }
 assert.ok(artifactMessageRows().length>100);
});
test('finds stay attached to their documented origins rather than a nearby temple or museum',()=>{
 const origins=Object.fromEntries(ARTIFACTS.map(a=>[a.id,a.placeId]));
 assert.equal(origins['nandin-giong-cat'],'go-giong-cat');
 assert.equal(origins['phat-linh-son-bac'],'linh-son-bac');
 assert.equal(origins['dau-phat-naga'],'linh-son-bac');
 assert.equal(origins['mo-vo-cay-tram'],'go-cay-tram');
 assert.equal(origins['mo-vo-linh-son-nam'],'linh-son-nam');
 assert.equal(origins['hat-chuoi-giong-trom'],'go-giong-trom');
 assert.match(ARTIFACTS.find(a=>a.id==='mo-vo-cay-tram').discovered[0],/2018–2019/);
});
test('the exhibition house only claims displays explicitly documented by the sources',()=>{
 const museum=CURATED.places.find(p=>p.recordType==='museum');
 const html=artifactSection(museum,CURATED.places);
 assert.match(html,/data-artifact="phat-linh-son-bac"/);assert.match(html,/data-artifact="mo-vo-cay-tram"/);
 assert.doesNotMatch(html,/data-artifact="nandin-giong-cat"/);assert.match(html,/data-artifact="dau-phat-naga"/);
 const filtered=artifactListHTML(CURATED.places,'go-giong-cat');
 assert.match(filtered,/data-artifact="nandin-giong-cat"/);assert.doesNotMatch(filtered,/data-artifact="hat-chuoi-giong-trom"/);
});
test('admin scope changes suppress related cards and research cards do not add stamp destinations',()=>{
 const places=CURATED.places.map(p=>p.id==='linh-son-bac'?{...p,scopeConfirmed:false}:p);
 assert.equal(artifactsForPlaces(places).some(a=>a.placeId==='linh-son-bac'),false);
 assert.equal(passProgress(CURATED.places,[]).total,15);
 assert.equal(passProgress(CURATED.places,[]).count,0);
});

test('new finds keep distinct discovery dates, qualified ages and supported holding links',()=>{
 const get=id=>ARTIFACTS.find(a=>a.id===id);
 const temple=get('vishnu-phat-bon-tay'),b=get('vishnu-cay-thi-b'),a=get('phat-dong-cay-thi-a'),steles=get('bia-da-linh-son');
 assert.equal(temple.placeId,'chua-linh-son');assert.equal(temple.displayPlaceId,'chua-linh-son');
 assert.match(temple.discovered[0],/7\/1912/);assert.match(steles.discovered[0],/1879/);
 assert.match(a.discovered[0],/2\/1942/);assert.match(b.discovered[0],/1928/);
 for(const record of [a,b]){
  assert.equal(record.placeId,'go-cay-thi');assert.equal(record.displayPlaceId,undefined);
  assert.match(record.period[0],/Chưa xác minh/);assert.match(record.mediaNote[0],/chưa có ảnh/);
 }
 assert.match(get('phat-linh-son-bac').material[0],/granite/);
 assert.match(get('linga-yoni-linh-son').material[0],/hai loại đá/i);
 assert.equal(ARTIFACTS.some(r=>/khánh bình|mukhalinga|giồng xoài/i.test(r.name[0])),false,'unresolved origins must not be assigned to a convenient site');
 assert.equal(passProgress(CURATED.places,[]).total,15,'research cards are not new check-in destinations');
});
