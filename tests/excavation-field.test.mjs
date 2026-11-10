import test from 'node:test';
import assert from 'node:assert/strict';
import {ExcavationField,placeFinds,squareName,CELLS_PER_METER} from '../assets/excavation-field.js';
import {SITES,FINDS} from '../assets/excavation-sites.js';
import {ARTIFACTS} from '../assets/artifacts.js';
const seeded=(s=7)=>()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
const site={id:'t',cols:6,rows:8,finds:[]};
const field=finds=>new ExcavationField(site,finds);
function sweep(f,tool,find,rounds=1,reach=.75){
 for(let n=0;n<rounds;n++)for(let y=find.y-reach;y<=find.y+reach;y+=.05){
  f.apply(tool,{x:find.x-reach,y},{x:find.x+reach,y});
 }
}
test('every configured find refers to a sourced artifact card and appears in a site',()=>{
 const ids=new Set(ARTIFACTS.map(a=>a.id));
 for(const id of Object.keys(FINDS))assert.ok(ids.has(id),id);
 for(const s of SITES)for(const id of s.finds)assert.ok(FINDS[id],id);
 assert.ok(SITES.some(s=>s.finds.length===Object.keys(FINDS).length));
});
test('sites hold several finds, placed apart and inside the trench',()=>{
 for(const s of SITES){
  const finds=placeFinds(s,FINDS,seeded(11));assert.equal(finds.length,s.finds.length);assert.ok(finds.length>=4);
  for(const f of finds){assert.ok(f.x>.5&&f.x<s.cols-.5&&f.y>.5&&f.y<s.rows-.5,f.id);}
  for(let i=0;i<finds.length;i++)for(let j=i+1;j<finds.length;j++)assert.ok(Math.hypot(finds[i].x-finds[j].x,finds[i].y-finds[j].y)>.5);
 }
});
test('each tool works only in its own soil band, so the kit is used in order',()=>{
 const jar={id:'jar',kind:'jar',size:1,x:3,y:4,angle:0};let f=field([jar]);
 // Trowel, pick, brush and blower cannot break untouched topsoil.
 for(const tool of ['trowel','pick','brush','blower']){const r=f.apply(tool,{x:2,y:4},{x:4,y:4});assert.equal(r.changed,false,tool);assert.equal(r.blocked,'firm',tool);}
 // The shovel stops at the culture layer and never reaches a find.
 sweep(f,'shovel',jar,8);assert.ok(f.depth.reduce((m,v)=>Math.min(m,v),1)>=.619);assert.equal(f.finds[0].status,'buried');
 assert.equal(f.apply('shovel',{x:2.8,y:4},{x:3.2,y:4}).blocked,'floor');
 // Trowel through the culture layer, then brush: exposed without damage.
 sweep(f,'trowel',jar,8);assert.equal(f.finds[0].status,'buried');assert.ok(f.depth.reduce((m,v)=>Math.min(m,v),1)>=.199);
 sweep(f,'brush',jar,10);assert.equal(f.finds[0].status,'exposed');assert.equal(f.conservation,100);
 assert.equal(f.finds[0].origin,squareName(3,4));
});
test('fragile gold needs the bamboo pick: the trowel scratches it near the surface',()=>{
 const ring={id:'ring',kind:'ring',size:.6,x:2.5,y:3.5,angle:.3,fragile:true};
 let f=field([ring]);sweep(f,'shovel',ring,5,.5);sweep(f,'trowel',ring,12,.4);assert.ok(f.damageEvents>0);assert.ok(f.conservation<100);
 f=field([ring]);sweep(f,'shovel',ring,5,.5);sweep(f,'trowel',ring,3,.4);const before=f.damageEvents;sweep(f,'pick',ring,12,.4);sweep(f,'brush',ring,8,.4);
 assert.equal(f.damageEvents,before);assert.equal(f.finds[0].status,'exposed');
});
test('blower and lens never dig',()=>{
 const f=field([]);sweep(f,'shovel',{x:3,y:3},5,.5);sweep(f,'trowel',{x:3,y:3},8,.4);const before=f.depth.slice();
 f.apply('blower',{x:2.8,y:3},{x:3.2,y:3});f.apply('lens',{x:2.8,y:3},{x:3.2,y:3});assert.deepEqual(f.depth,before);
});
test('glass beads travel in the excavated soil and only appear after sieving',()=>{
 const beads={id:'beads',kind:'beads',small:true,x:3,y:3,angle:0};const f=field([beads]);
 sweep(f,'shovel',beads,5,.5);assert.equal(f.finds[0].status,'buried');sweep(f,'trowel',beads,4,.5);assert.equal(f.finds[0].status,'bucket');assert.ok(f.bucket.soil>0);
 assert.equal(f.record(0),null);
 let r;do{r=f.sieve(5);}while(r.soil>0);assert.deepEqual(r.revealed,[0]);assert.equal(f.finds[0].status,'sieved');
 assert.deepEqual(f.record(0),{id:'beads',square:'D4',small:true});assert.equal(f.complete,true);
});
test('a long stroke passing over beads still sends them to the bucket',()=>{
 const f=field([{id:'beads',kind:'beads',small:true,x:3,y:3,angle:0}]);
 for(const tool of ['shovel','trowel'])for(let k=0;k<4;k++)for(let y=2.5;y<3.5;y+=.1)f.apply(tool,{x:.5,y},{x:5.5,y});
 assert.equal(f.finds[0].status,'bucket');
});
test('recording requires an exposed find and is counted once',()=>{
 const jar={id:'jar',kind:'jar',size:1,x:3,y:4,angle:0};const f=field([jar]);
 assert.equal(f.findAt(3,4,['buried']),0);assert.equal(f.record(0),null);
 sweep(f,'shovel',jar,6);sweep(f,'trowel',jar,8);sweep(f,'brush',jar,10);assert.equal(f.findAt(3.1,4.1),0);
 assert.ok(f.record(0));assert.equal(f.record(0),null);assert.equal(f.recorded,1);
});
test('field resolution matches the simulated trench in metres',()=>{
 const f=field([]);assert.equal(f.cols,6*CELLS_PER_METER);assert.equal(f.rows,8*CELLS_PER_METER);assert.equal(squareName(0.2,0.2),'A1');assert.equal(squareName(5.9,7.9),'F8');
});
