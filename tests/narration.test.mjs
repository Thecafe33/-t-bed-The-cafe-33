import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {CURATED} from '../assets/content.js';
import {ARTIFACTS} from '../assets/artifacts.js';
import {NARRATION_SCRIPTS,narrationFor} from '../assets/narration-scripts.js';
import {NARRATION_SOURCES} from '../assets/narration-sources.js';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const catalogue=JSON.parse(readFileSync(new URL('assets/audio/catalog.json',root)));
test('every curated place and artifact has distinct authored narration in all three languages and a matching complete audio file',()=>{
 const records=[...[...CURATED.places,...CURATED.stops].map(p=>['place',p]),...ARTIFACTS.map(a=>['artifact',a])];
 assert.equal(NARRATION_SCRIPTS.length,records.length);
 assert.equal(new Set(NARRATION_SCRIPTS.map(r=>r[0]+'/'+r[1])).size,records.length);
 for(const [kind,record] of records)for(const lang of ['vi','en','zh']){
  const script=narrationFor(kind,record.id,lang);assert.ok(script.trim().length>0,`${kind}/${record.id}/${lang}`);
  assert.notEqual(script,record.description||record.story?.[0]);
  const key=`${lang}/${kind}-${record.id}`,meta=catalogue[key];assert.ok(meta?.duration>5);
  const hash=createHash('sha256').update(meta.voice+'|-5%|'+script).digest('hex');assert.equal(meta.scriptHash,hash);
  assert.equal(statSync(new URL(`assets/audio/${key}.mp3`,root)).size,meta.bytes);
 }
});
test('unknown remote/admin records never receive another place’s narration',()=>{
 assert.equal(narrationFor('place','not-a-curated-record'),'');
 assert.equal(narrationFor('artifact','go-giong-cat'),'');
});
test('heritage narration has per-record evidence without borrowing another find location',()=>{
 const records=[...CURATED.places.map(p=>['place',p.id]),...ARTIFACTS.map(a=>['artifact',a.id])];
 for(const [kind,id] of records){
  const sources=NARRATION_SOURCES[`${kind}/${id}`];
  assert.ok(sources?.length,`${kind}/${id} has no evidence links`);
  for(const source of sources){
   assert.ok(source.title);
   assert.ok(['https://vanhoaoceo.angiang.gov.vn','https://ispace.angiang.vn','https://www.khuditichoceo.com'].includes(new URL(source.url).origin));
  }
 }
 const ring=narrationFor('artifact','nandin-giong-cat');
 assert.match(ring,/Giồng Cát năm 2018/);
 assert.match(ring,/thế kỷ thứ năm/);
 assert.match(ring,/chưa xác nhận vị trí trưng bày/);
 assert.equal(NARRATION_SOURCES['artifact/not-a-record'],undefined);
});
