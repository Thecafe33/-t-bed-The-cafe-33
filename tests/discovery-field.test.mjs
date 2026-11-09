import test from 'node:test';
import assert from 'node:assert/strict';
import {DiscoveryField,choosePlacement} from '../assets/discovery-field.js';
const placement={x:.33,y:.37,width:180,height:240,angle:.25};
function sweep(f,tool,rounds=1){
 const t=f.target;
 for(let n=0;n<rounds;n++)for(let y=t.y-t.height/f.height*.65;y<t.y+t.height/f.height*.65;y+=.035){
  f.apply(tool,{x:t.x-.32,y},{x:t.x+.32,y});
  f.apply(tool,{x:t.x+.32,y:y+.012},{x:t.x-.32,y:y+.012});
 }
}
test('tools are a choice: brush and lens cannot clear firm soil; shovel does not clean an object',()=>{
 const f=new DiscoveryField(390,844,{...placement});sweep(f,'brush',3);sweep(f,'lens',3);assert.equal(f.progress,0);
 sweep(f,'trowel',7);assert.ok(f.progress>.3&&f.progress<.5);assert.equal(f.complete,false);
 const before=f.depth.slice();sweep(f,'lens');assert.deepEqual(f.depth,before);
 sweep(f,'brush',8);assert.equal(f.complete,true);
});
test('excavation is local, unrelated soil cannot complete a discovery',()=>{
 const f=new DiscoveryField(390,844,{...placement});
 for(let i=0;i<35;i++){f.apply('trowel',{x:.9,y:.8},{x:.9,y:.85});f.apply('brush',{x:.9,y:.8},{x:.9,y:.85});}
 assert.equal(f.progress,0);assert.equal(f.complete,false);
 assert.ok(f.depth.some(v=>v===0)&&f.depth.some(v=>v===1));
});
test('portrait/landscape rotation retains worked ground and matching object geometry',()=>{
 const f=new DiscoveryField(390,844,{...placement});sweep(f,'trowel',5);sweep(f,'brush',1);const progress=f.progress;
 f.resize(844,390);assert.ok(Math.abs(f.progress-progress)<.025);assert.equal(f.width,844);assert.ok(f.mask.some(Boolean));
 sweep(f,'trowel',6);sweep(f,'brush',8);assert.equal(f.complete,true);
});
test('new placements avoid the previous spot and stay away from a fixed central reveal',()=>{
 let previous;let state=123;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<30;i++){const next=choosePlacement(390,844,previous,random);if(previous)assert.ok(Math.hypot(next.x-previous.x,next.y-previous.y)>.18);assert.ok(Math.abs(next.x-.5)>.1);assert.ok(next.x>0.25&&next.x<.75);assert.ok(next.y>.28&&next.y<.68);previous=next;}
});
