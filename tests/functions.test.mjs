import test from 'node:test';
import assert from 'node:assert/strict';
import {publishReview,deleteMyAccount} from '../functions/index.js';
test('anonymous clients cannot publish or request account deletion',async()=>{
 await assert.rejects(publishReview.run({auth:null,data:{}}),{code:'unauthenticated'});
 await assert.rejects(deleteMyAccount.run({auth:null,data:{}}),{code:'unauthenticated'});
});
test('malformed review requests are rejected before touching any cloud service',async()=>{
 await assert.rejects(publishReview.run({auth:{uid:'test'},data:{id:'bad',name:'Test',text:'Test',rating:5,policyVersion:'2026-11-04'}}),{code:'invalid-argument'});
 await assert.rejects(publishReview.run({auth:{uid:'test'},data:{id:'a'.repeat(20),name:'Test',text:'Test',rating:6,policyVersion:'2026-11-04'}}),{code:'invalid-argument'});
});
test('account deletion requires recent Google authentication',async()=>{
 await assert.rejects(deleteMyAccount.run({auth:{uid:'test',token:{auth_time:1}},data:{}}),{code:'failed-precondition'});
});

test('missing authentication time cannot bypass account deletion reauthentication',async()=>{
 await assert.rejects(deleteMyAccount.run({auth:{uid:'test',token:{}},data:{}}),{code:'failed-precondition'});
});
