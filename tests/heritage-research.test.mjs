import test from 'node:test';
import assert from 'node:assert/strict';
import {CURATED} from '../assets/content.js';
import {HERITAGE_RESEARCH} from '../assets/heritage-research.js';
import {heritageResearchHTML} from '../assets/heritage-research-view.js';
import {narrationFor} from '../assets/narration-scripts.js';
globalThis.location={origin:'https://thecafe33.github.io'};

test('research panels are limited to sourced heritage within the existing commune catalogue',()=>{
 assert.equal(Object.keys(HERITAGE_RESEARCH).length,5);
 for(const [id,record] of Object.entries(HERITAGE_RESEARCH)){
  const place=CURATED.places.find(p=>p.id===id);
  assert.ok(place?.scopeConfirmed);
  assert.equal(place.description,record.summary[0]);
  assert.equal(place.lookFor,record.observe[0]);
  assert.match(heritageResearchHTML(place),/class="heritage-research"/);
  assert.equal(heritageResearchHTML({...place,scopeConfirmed:false}),'');
  assert.equal(heritageResearchHTML({...place,sourceUrl:'javascript:alert(1)'}),'');
  for(const field of ['summary','history','period','finds','observe','limits']){
   assert.equal(record[field].length,3);
   assert.ok(record[field].every(s=>s.trim()&&!s.includes('\uFFFD')));
  }
  assert.ok(record.sources.some(s=>new URL(s.url).hostname==='ispace.angiang.vn'));
 }
 assert.equal(heritageResearchHTML({id:'nen-chua',category:'heritage',scopeConfirmed:false}),'');
});

test('contradictory discovery dates and object dates remain distinct and attributed',()=>{
 const ut=HERITAGE_RESEARCH['go-ut-trach'];
 assert.match(ut.history[0],/9\/2010/);assert.match(ut.history[0],/7–9\/2011/);
 assert.match(ut.limits[0],/2002/);assert.match(ut.limits[0],/iSpace/);
 const cay=HERITAGE_RESEARCH['go-cay-thi'];
 assert.match(cay.period[0],/VI–VII/);assert.match(cay.period[0],/không dùng khoảng này/);
 assert.match(cay.limits[0],/2019/);assert.match(cay.limits[0],/2010/);
 const nam=HERITAGE_RESEARCH['linh-son-nam'];
 assert.match(nam.period[0],/không phải niên đại riêng của mộ vò/);
 assert.match(nam.finds[0],/Chưa đủ mã kiểm kê/);
 for(const id of Object.keys(HERITAGE_RESEARCH)){
  const spoken=narrationFor('place',id,'vi');
  assert.match(spoken,/iSpace/);
  assert.doesNotMatch(spoken,/\b[IVX]+–[IVX]+\b/,'Vietnamese narration should speak century names');
 }
});
