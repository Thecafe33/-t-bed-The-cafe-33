import test from 'node:test';
import assert from 'node:assert/strict';
import {CURATED} from '../assets/content.js';
import {heritageSymbol,HERITAGE_IMAGES} from '../assets/heritage-symbols.js';
import {buildPassSVG} from '../assets/pass-art.js';

test('artifact stamp imagery keeps documented discovery and display associations distinct',()=>{
 const symbol=id=>heritageSymbol(CURATED.places.find(p=>p.id===id));
 assert.equal(symbol('go-giong-cat').key,'ring');assert.equal(symbol('go-giong-cat').relation,'find');
 assert.equal(symbol('linh-son-bac').key,'relief');assert.equal(symbol('linh-son-bac').relation,'find');
 assert.equal(symbol('nha-trung-bay-van-hoa-oc-eo').relation,'display');
 assert.equal(symbol('linh-son-nam').key,'jar-nam');assert.equal(symbol('go-cay-tram').key,'jar-tram');
 assert.equal(symbol('go-sau-thuan').relation,'typography');assert.equal(symbol('go-ut-trach').relation,'typography');
 assert.equal(symbol('go-cay-thi').relation,'architecture');assert.equal(symbol('nha-trung-bay-cu-ba-the').relation,'architecture');
 for(const p of CURATED.places){const s=heritageSymbol(p);assert.equal(s.label.length,3);if(s.relation==='find'||s.relation==='display')assert.match(s.sourceUrl,/^https:\/\/vanhoaoceo\.angiang\.gov\.vn\//);}
 assert.equal(Object.keys(HERITAGE_IMAGES).length,4);
});
test('a cultural hero illustration never adds an unearned stamp or changes the 15-stop collection',()=>{
 const collection=CURATED.places.filter(p=>p.category==='heritage'&&p.collectible!==false);
 assert.equal(collection.length,15);
 const earned=collection.filter(p=>['chua-linh-son','linh-son-nam','go-giong-cat'].includes(p.id));
 const {svg,width,height}=buildPassSVG({collection,earned,name:'Elio <&>',date:'06/11/2026'});
 assert.equal(width,1080);assert.equal(height,1920);assert.match(svg,/Elio &lt;&amp;&gt;/);
 assert.equal((svg.match(/data-earned-stamp=/g)||[]).length,3);
 assert.doesNotMatch(svg,/data-earned-stamp="linh-son-bac"/);
 assert.match(svg,/data-symbol="jar-nam"/);assert.doesNotMatch(svg,/data-symbol="jar-tram"/);
});
