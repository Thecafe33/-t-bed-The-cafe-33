import test from 'node:test';
import assert from 'node:assert/strict';
import {ArtifactDeckState} from '../assets/artifact-deck-state.js';
test('a shuffled round contains each card once and ends instead of silently repeating',()=>{
 const ids=['a','b','c','d','e'],deck=new ArtifactDeckState({rng:()=>.37});deck.setItems(ids);
 const seen=[];while(!deck.complete){seen.push(deck.current);deck.next();}
 assert.equal(new Set(seen).size,ids.length);assert.deepEqual([...seen].sort(),ids);
 assert.equal(deck.current,null);assert.equal(deck.next(),false);assert.equal(deck.index,5);
 assert.deepEqual(deck.items,ids);
});
test('previous and reopening the same collection preserve the actual deck order and position',()=>{
 const deck=new ArtifactDeckState({random:false});deck.setItems(['a','b','c']);
 deck.next();deck.next();assert.equal(deck.current,'c');deck.previous();assert.equal(deck.current,'b');
 deck.setItems(['a','b','c']);assert.equal(deck.current,'b');assert.equal(deck.index,1);
 deck.next();deck.next();deck.previous();assert.equal(deck.current,'c');
});
test('explicit shuffle avoids repeating the current first card and ordered mode is predictable',()=>{
 const deck=new ArtifactDeckState({random:false,rng:()=>.999});deck.setItems(['a','b','c']);
 const old=deck.current;deck.shuffle();assert.equal(deck.random,true);assert.notEqual(deck.current,old);
 assert.deepEqual(new Set(deck.order),new Set(['a','b','c']));
 deck.setRandom(false);assert.deepEqual(deck.order,['a','b','c']);assert.equal(deck.current,'a');
});
test('filter changes, duplicate identifiers, one card and empty collections remain bounded',()=>{
 const deck=new ArtifactDeckState({rng:()=>.1});deck.setItems(['a','a','b']);assert.equal(deck.total,2);
 deck.next();deck.setItems(['b']);assert.equal(deck.current,'b');assert.equal(deck.index,0);
 deck.shuffle();assert.equal(deck.current,'b');deck.next();assert.equal(deck.complete,true);deck.previous();assert.equal(deck.current,'b');
 deck.setItems([]);assert.equal(deck.total,0);assert.equal(deck.complete,true);assert.equal(deck.previous(),false);deck.shuffle();assert.equal(deck.current,null);
});
