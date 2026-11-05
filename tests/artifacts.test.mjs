import test from 'node:test';
import assert from 'node:assert/strict';
import {ARTIFACTS,artifactsForPlaces,artifactMessageRows} from '../assets/artifacts.js';
import {artifactSection,artifactIndexHTML} from '../assets/artifact-view.js';
import {CURATED} from '../assets/content.js';
import {passProgress} from '../assets/model.js';
globalThis.location={origin:'https://oceotownwalk.web.app'};
test('each artifact has a scoped discovery site, official source and three-language evidence',()=>{
 assert.equal(ARTIFACTS.length,9);assert.equal(new Set(ARTIFACTS.map(a=>a.id)).size,9);
 for(const a of ARTIFACTS){
  const place=CURATED.places.find(p=>p.id===a.placeId);
  assert.ok(place?.scopeConfirmed);assert.equal(place.category,'heritage');assert.notEqual(place.collectible,false);
  assert.equal(new URL(a.sourceUrl).host,'vanhoaoceo.angiang.gov.vn');
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
test('the exhibition house only claims the two displays explicitly shown by the source',()=>{
 const museum=CURATED.places.find(p=>p.recordType==='museum');
 const html=artifactSection(museum,CURATED.places);
 assert.match(html,/data-artifact="phat-linh-son-bac"/);assert.match(html,/data-artifact="mo-vo-cay-tram"/);
 assert.doesNotMatch(html,/data-artifact="nandin-giong-cat"/);assert.doesNotMatch(html,/data-artifact="dau-phat-naga"/);
 const filtered=artifactIndexHTML(CURATED.places,'go-giong-cat');
 assert.match(filtered,/data-artifact="nandin-giong-cat"/);assert.doesNotMatch(filtered,/data-artifact="hat-chuoi-giong-trom"/);
});
test('admin scope changes suppress related cards and research cards do not add stamp destinations',()=>{
 const places=CURATED.places.map(p=>p.id==='linh-son-bac'?{...p,scopeConfirmed:false}:p);
 assert.equal(artifactsForPlaces(places).some(a=>a.placeId==='linh-son-bac'),false);
 assert.equal(passProgress(CURATED.places,[]).total,15);
 assert.equal(passProgress(CURATED.places,[]).count,0);
});
