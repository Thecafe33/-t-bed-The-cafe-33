/** A finite deck: each source card appears once per round; state stays in memory. */
export class ArtifactDeckState {
 constructor({random=true,rng=Math.random}={}){
  this.random=random;this.rng=rng;this.items=[];this.order=[];this.index=0;
  this.selected='all';this.view='deck';
 }
 get current(){return this.order[this.index]??null;}
 get total(){return this.order.length;}
 get complete(){return this.index>=this.total;}
 setItems(ids){
  const next=[...new Set(ids)];
  if(next.length===this.items.length&&next.every((id,i)=>id===this.items[i]))return;
  const previous=this.current;this.items=next;this.reset(previous);
 }
 reset(avoidFirst=null){
  this.order=[...this.items];this.index=0;
  if(this.random){
   for(let i=this.order.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[this.order[i],this.order[j]]=[this.order[j],this.order[i]];}
   if(this.order.length>1&&this.order[0]===avoidFirst)[this.order[0],this.order[1]]=[this.order[1],this.order[0]];
  }
 }
 shuffle(){const previous=this.current??this.order.at(-1);this.random=true;this.reset(previous);}
 setRandom(enabled){if(this.random===enabled)return;const previous=this.current;this.random=enabled;this.reset(previous);}
 next(){if(this.complete)return false;this.index++;return true;}
 previous(){if(this.index===0)return false;this.index--;return true;}
}
