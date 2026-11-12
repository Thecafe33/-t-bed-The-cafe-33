import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ARTIFACTS} from '../assets/artifacts.js';
import {artifactPhoto,artifactMediaHTML,artifactDetailHTML} from '../assets/artifact-view.js';
import {CURATED} from '../assets/content.js';
globalThis.location={origin:'https://thecafe33.github.io'};
const root=new URL('../',import.meta.url),manifest=JSON.parse(readFileSync(new URL('assets/photos/artifacts/sources.json',root)));
test('seven reference images preserve original bytes and retain per-object provenance',()=>{
 assert.equal(manifest.length,7);
 for(const record of manifest){
  const a=ARTIFACTS.find(a=>a.id===record.id),bytes=readFileSync(new URL(record.url,root));
  assert.ok(artifactPhoto(a));assert.equal(bytes.length,record.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
  assert.equal(a.photo.sourceImageUrl,record.sourceImageUrl);
  assert.equal(a.photo.license,undefined,'no invented open licence for a reference image');
  for(const field of ['caption','alt'])assert.ok(a.photo[field].length===3&&a.photo[field].every(Boolean));
  const detail=artifactDetailHTML(a,CURATED.places);
  assert.ok(detail.includes(a.photo.sourceUrl));assert.match(detail,/Xem ảnh lớn/);
  assert.doesNotMatch(artifactMediaHTML(a),/<a\b/,'gallery buttons must not contain nested links');
 }
 const jar=ARTIFACTS.find(a=>a.id==='mo-vo-cay-tram');assert.equal(jar.placeId,'go-cay-tram');
 assert.match(jar.photo.sourceImageUrl,/IMG_4394/);
 assert.match(ARTIFACTS.find(a=>a.id==='bia-da-linh-son').photo.caption[0],/không phải ảnh của cả hai bia/);
});
test('unreviewed, unsourced and unsafe media stay as labelled illustrations',()=>{
 const a=ARTIFACTS[0];
 for(const change of [{verified:false},{sourceUrl:''},{sourceUrl:'javascript:alert(1)'},{url:'javascript:alert(1)'},{credit:''}]){
  const edited={...a,photo:{...a.photo,...change}};
  assert.equal(artifactPhoto(edited),null);assert.doesNotMatch(artifactMediaHTML(edited),/<img/);
 }
 for(const id of ['phat-dong-cay-thi-a','vishnu-cay-thi-b','mo-vo-linh-son-nam'])assert.equal(artifactPhoto(ARTIFACTS.find(a=>a.id===id)),null);
});
