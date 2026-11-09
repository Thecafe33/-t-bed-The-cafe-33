// Simulation geometry, not a reconstruction of an archaeological excavation.
export const FIELD_WIDTH=128;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function choosePlacement(width,height,previous,random=Math.random){
 const short=Math.min(width,height),size=short*(width>height?.30+random()*.035:.43+random()*.05);
 const slots=width>height?[[.25,.43],[.7,.44],[.4,.56],[.78,.56]]:[[.32,.33],[.66,.36],[.34,.61],[.67,.59]];
 const allowed=slots.filter(([x,y])=>!previous||Math.hypot(x-previous.x,y-previous.y)>.23);
 const [x,y]=(allowed.length?allowed:slots)[Math.floor(random()*(allowed.length||slots.length))];
 return {x:x+(random()-.5)*.035,y:width>height?.49+(random()-.5)*.025:y+(random()-.5)*.035,width:size,height:size*1.35,angle:(random()-.5)*.7};
}
export class DiscoveryField{
 constructor(width,height,placement,alpha=null){
  this.width=width;this.height=height;this.target=placement;this.alpha=alpha;
  this.cols=FIELD_WIDTH;this.rows=clamp(Math.round(FIELD_WIDTH*height/width),64,288);
  const count=this.cols*this.rows;
  this.depth=new Float32Array(count).fill(1);this.dust=new Float32Array(count).fill(1);
  this.mask=new Uint8Array(count);this.pixels=new Uint8Array(count*4);
  const cos=Math.cos(-placement.angle),sin=Math.sin(-placement.angle);
  this.targetCount=0;
  for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
   const dx=((x+.5)/this.cols-placement.x)*width,dy=((y+.5)/this.rows-placement.y)*height;
   const u=(dx*cos-dy*sin)/placement.width+.5,v=(dx*sin+dy*cos)/placement.height+.5;
   const inside=u>=0&&u<1&&v>=0&&v<1;
   const hit=inside&&(alpha?alpha.data[(Math.floor(v*alpha.height)*alpha.width+Math.floor(u*alpha.width))*4+3]>90:((u-.5)**2/.24+(v-.5)**2/.24)<1);
   if(hit){this.mask[y*this.cols+x]=1;this.targetCount++;}
  }
  this.revision=0;this.updatePixels();
 }
 updatePixels(){
  this.revision++;
  for(let i=0;i<this.depth.length;i++){const p=i*4;this.pixels[p]=Math.round(this.depth[i]*255);this.pixels[p+1]=Math.round(this.dust[i]*255);this.pixels[p+2]=this.mask[i]*255;this.pixels[p+3]=255;}
 }
 get progress(){
  if(!this.targetCount)return 0;
  let sum=0;for(let i=0;i<this.mask.length;i++)if(this.mask[i])sum+=(1-this.depth[i])*.45+(1-this.dust[i])*.55;
  return Math.min(1,sum/this.targetCount);
 }
 get complete(){
  if(!this.targetCount)return false;
  let clear=0;for(let i=0;i<this.mask.length;i++)if(this.mask[i]&&this.depth[i]<.055&&this.dust[i]<.14)clear++;
  return clear/this.targetCount>=.88;
 }
 apply(tool,from,to){
  if(!['trowel','brush'].includes(tool))return {changed:false,contact:false};
  const radius=Math.min(this.width,this.height)*(tool==='trowel'?.068:.088),step=radius*.48;
  const distance=Math.hypot((to.x-from.x)*this.width,(to.y-from.y)*this.height),steps=Math.max(1,Math.ceil(distance/step));
  const strength=distance===0?.28:Math.min(1,distance/step/steps);
  let changed=false,contact=false;
  for(let s=1;s<=steps;s++){
   const px=(from.x+(to.x-from.x)*s/steps)*this.width,py=(from.y+(to.y-from.y)*s/steps)*this.height;
   const x0=clamp(Math.floor((px-radius)/this.width*this.cols),0,this.cols-1),x1=clamp(Math.ceil((px+radius)/this.width*this.cols),0,this.cols-1);
   const y0=clamp(Math.floor((py-radius)/this.height*this.rows),0,this.rows-1),y1=clamp(Math.ceil((py+radius)/this.height*this.rows),0,this.rows-1);
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const d=Math.hypot(((x+.5)/this.cols*this.width-px),((y+.5)/this.rows*this.height-py))/radius;if(d>=1)continue;
    const i=y*this.cols+x,weight=(1-d*d)*strength;
    if(tool==='trowel'){
     const old=this.depth[i],floor=this.mask[i]?.17:0;
     if(old>floor)this.depth[i]=Math.max(floor,old-.2*weight);
     if(this.depth[i]<old-.0001)changed=true;
     if(this.mask[i]&&this.depth[i]<.3)contact=true;
    }else if(this.depth[i]<.32){
     const old=this.depth[i]+this.dust[i];
     this.depth[i]=Math.max(0,this.depth[i]-.1*weight);
     this.dust[i]=Math.max(0,this.dust[i]-.24*weight);
     if(this.depth[i]+this.dust[i]<old-.0001)changed=true;
    }
   }
  }
  if(changed)this.updatePixels();return {changed,contact};
 }
 resize(width,height){
  const t=this.target,newSize=Math.min(t.width*Math.min(width,height)/Math.min(this.width,this.height),Math.min(width,height)*(width>height?.335:.48));
  const scale=newSize/t.width,next=new DiscoveryField(width,height,{...t,y:width>height?.49:t.y,width:newSize,height:t.height*scale},this.alpha);
  // Reproject worked ground around the find, so a rotation never separates the
  // visible object from its collision mask or discards a partially cleaned find.
  for(let y=0;y<next.rows;y++)for(let x=0;x<next.cols;x++){
   const oldX=(((x+.5)/next.cols-next.target.x)*width/scale+t.x*this.width)/this.width;
   const oldY=(((y+.5)/next.rows-next.target.y)*height/scale+t.y*this.height)/this.height;
   if(oldX<0||oldX>=1||oldY<0||oldY>=1)continue;
   const old=Math.floor(oldY*this.rows)*this.cols+Math.floor(oldX*this.cols),i=y*next.cols+x;
   next.depth[i]=this.depth[old];next.dust[i]=this.dust[old];
  }
  next.updatePixels();next.revision=this.revision+1;Object.assign(this,next);
 }
}
