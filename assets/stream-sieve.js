// Wet-sieving scene: a forest stream where the excavation sieve is washed.
// Adapted, with reductions for phones, from a three.js "Forest Stream" scene supplied by the
// project owner. three.js r128 (MIT) is NOT stored in this repository: it is loaded from cdnjs
// only when the player opens the sieve while online. Offline, the dry sieve keeps working.
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
let threeLoad = null;

// 'ok' | 'offline' | 'cellular' | 'savedata'
export function streamAvailability() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'offline';
  const c = typeof navigator !== 'undefined' ? navigator.connection : null;
  if (c && c.saveData) return 'savedata';
  if (c && c.type === 'cellular') return 'cellular';
  return 'ok';
}

export function loadThree(timeout = 15000) {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (threeLoad) return threeLoad;
  threeLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = THREE_URL; script.async = true; script.crossOrigin = 'anonymous'; script.referrerPolicy = 'no-referrer';
    const timer = setTimeout(() => fail(new Error('three.js timed out')), timeout);
    function fail(error) { clearTimeout(timer); script.remove(); threeLoad = null; reject(error); }
    script.onload = () => { clearTimeout(timer); window.THREE ? resolve(window.THREE) : fail(new Error('three.js missing')); };
    script.onerror = () => fail(new Error('three.js failed to load'));
    document.head.append(script);
  });
  return threeLoad;
}

const TAU = Math.PI * 2, LOOP = 8;
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* ---------- tileable noise ---------- */
const NS = 256;
function fbmArray(seed, octs) {
  const r = mulberry32(seed), out = new Float32Array(NS * NS), n = NS * NS; let amp = 1;
  for (const f of octs) {
    const gx = new Float32Array(f * f), gy = new Float32Array(f * f);
    for (let i = 0; i < f * f; i++) { const a = r() * TAU; gx[i] = Math.cos(a); gy[i] = Math.sin(a); }
    for (let y = 0; y < NS; y++) {
      const v = y / NS * f, y0 = Math.floor(v), fy = v - y0, y1 = (y0 + 1) % f, wy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
      for (let x = 0; x < NS; x++) {
        const u = x / NS * f, x0 = Math.floor(u), fx = u - x0, x1 = (x0 + 1) % f, wx = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
        const i00 = y0 * f + x0, i10 = y0 * f + x1, i01 = y1 * f + x0, i11 = y1 * f + x1;
        const A = gx[i00] * fx + gy[i00] * fy, B = gx[i10] * (fx - 1) + gy[i10] * fy, C = gx[i01] * fx + gy[i01] * (fy - 1), D = gx[i11] * (fx - 1) + gy[i11] * (fy - 1);
        out[y * NS + x] += amp * ((A + (B - A) * wx) * (1 - wy) + (C + (D - C) * wx) * wy);
      }
    }
    amp *= 0.5;
  }
  let m = 0, s = 0;
  for (let i = 0; i < n; i++) m += out[i]; m /= n;
  for (let i = 0; i < n; i++) s += (out[i] - m) ** 2; s = Math.sqrt(s / n);
  for (let i = 0; i < n; i++) out[i] = clamp(0.5 + (out[i] - m) / s * 0.16, 0, 1);
  return out;
}
let noiseCache = null;
function noiseArrays() { return noiseCache || (noiseCache = { nA: fbmArray(11, [3, 6, 12, 24]), nB: fbmArray(47, [4, 8, 16, 32, 64]) }); }
function sn(arr, u, v) {
  u = (u - Math.floor(u)) * NS; v = (v - Math.floor(v)) * NS;
  const xf = Math.floor(u), yf = Math.floor(v), fx = u - xf, fy = v - yf;
  const x0 = xf % NS, y0 = yf % NS, x1 = (x0 + 1) % NS, y1 = (y0 + 1) % NS;
  const a = arr[y0 * NS + x0], b = arr[y0 * NS + x1], c = arr[y1 * NS + x0], d = arr[y1 * NS + x1];
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}

/* ---------- terrain ---------- */
const centerZ = x => 0.55 * Math.sin(x * 0.28 + 0.4) + 0.2 * Math.sin(x * 0.63 + 1.7);
const halfW = x => 3.3 + 0.4 * Math.sin(x * 0.41 + 2.0) + 0.2 * Math.sin(x * 0.93 + 0.6);
const ROCKS = [
  { x: -5.4, z: -1.7, s: 1.45, sy: 1.05, y: -0.12, seed: 1.3 },
  { x: -7.6, z: 2.9, s: 1.90, sy: 1.25, y: -0.05, seed: 4.1 },
  { x: 1.6, z: -1.0, s: 0.82, sy: 0.62, y: -0.12, seed: 7.7 },
  { x: 3.9, z: 2.3, s: 1.50, sy: 1.00, y: -0.15, seed: 2.9 },
  { x: 7.0, z: 3.6, s: 1.35, sy: 1.00, y: 0.05, seed: 9.4 },
  { x: -2.4, z: -2.6, s: 0.68, sy: 0.50, y: -0.08, seed: 5.5 },
  { x: 5.6, z: -1.5, s: 0.74, sy: 0.52, y: -0.10, seed: 3.3 },
  { x: -3.0, z: 1.9, s: 0.50, sy: 0.38, y: -0.08, seed: 6.2 },
];
ROCKS.forEach(R => { R.a = R.s * 1.05; R.top = R.y + R.sy; });
const SIEVE = { x: -0.6, z: centerZ(-0.6), r: 0.82 };

function makeTerrain(nA, nB) {
  return function terrainH(x, z) {
    const d = z - centerZ(x), w = halfW(x), t = Math.abs(d) / w;
    const n = sn(nB, x * 0.031 + 0.2, z * 0.031 + 0.7) - 0.5, n2 = sn(nA, x * 0.09 + 0.5, z * 0.09 + 0.1) - 0.5;
    let h;
    if (t < 1) {
      const s = 1 - t; h = -0.55 * Math.pow(s, d < 0 ? 1.5 : 0.85);
      const k = Math.min(1, s * 2.5);
      h -= 0.5 * k * Math.exp(-((x - 1.2) ** 2 / 16 + (z - 1.1) ** 2 / 2.0));
      h -= 0.3 * k * Math.exp(-((x + 4.5) ** 2 / 9 + (z + 0.3) ** 2 / 2.5));
      h += (n * 0.3 + n2 * 0.12) * Math.min(1, s * 3);
    } else {
      const e = (t - 1) * w;
      h = d < 0 ? 0.75 * (1 - Math.exp(-e * 0.30)) : 0.95 * (1 - Math.exp(-e * 0.6));
      h += (n * 0.35 + n2 * 0.15) * Math.min(1, e * 0.7);
    }
    return h;
  };
}
const inRock = (x, z, k) => ROCKS.some(R => Math.hypot(x - R.x, z - R.z) < R.a * k);

/* ---------- GLSL (from the supplied scene, plus silt and sieve) ---------- */
const COMMON = `#define NR 8
#define TAU 6.2831853
uniform float uTime; uniform float uLoop; uniform vec3 uSun;
uniform sampler2D tNoise; uniform sampler2D tRipple; uniform vec4 uSimRect; uniform vec4 uRocks[NR];
float gLit;
float nz(vec2 p){return texture2D(tNoise,p).r;}
float nzb(vec2 p){return texture2D(tNoise,p).a;}
float dapple(vec3 wp){
  vec2 p=wp.xz-uSun.xz/uSun.y*wp.y;
  vec2 sw=0.012*vec2(sin(TAU*uLoop),cos(TAU*uLoop*2.0));
  float a=nz(p*0.043+sw); float b=nzb(p*0.11+vec2(0.37,0.71)-sw*1.7); float c=nz(p*0.31+vec2(0.13,0.57)+sw*2.0);
  return smoothstep(0.50,0.565,a*0.52+b*0.33+c*0.15);
}
float caustic(vec2 p,float t){
  vec2 q=p*4.2-250.0; vec2 i=q; float c=1.0;
  for(int n=0;n<4;n++){
    float tt=t*(1.0-3.5/float(n+1));
    i=q+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
    c+=1.0/length(vec2(q.x/(sin(i.x+tt)/0.005),q.y/(cos(i.y+tt)/0.005)));
  }
  c/=4.0; c=1.17-pow(c,1.4); return pow(abs(c),8.0);
}
float rockAO(vec3 wp){
  float ao=1.0;
  for(int i=0;i<NR;i++){ vec4 r=uRocks[i]; float hh=max(r.w-wp.y,0.0)*0.45; vec2 c=r.xy-uSun.xz/uSun.y*hh;
    ao=min(ao,mix(0.45,1.0,smoothstep(r.z*0.85,r.z*1.45,length(wp.xz-c)))); }
  return ao;
}
vec3 shade(vec3 alb,vec3 N,vec3 wp,float ao){
  float br=nz(wp.xz*0.83+wp.y*0.37);
  float ndl=dot(N,uSun)+(br-0.5)*0.4;
  float lit=smoothstep(-0.02,0.30,ndl);
  float dp=dapple(wp);
  float s=lit*dp*smoothstep(0.45,0.95,ao); gLit=s;
  vec3 amb=mix(vec3(0.15,0.23,0.25),vec3(0.36,0.47,0.51),N.y*0.5+0.5)*mix(0.55,1.0,ao);
  vec3 sunC=vec3(0.86,0.77,0.52);
  vec3 col=alb*(amb+sunC*s);
  if(wp.y<0.0){
    float dpt=-wp.y; vec2 sp=wp.xz+uSun.xz/uSun.y*dpt;
    vec2 wv=vec2(nz(sp*0.09+0.3),nzb(sp*0.09+0.6))-0.5;
    float ca=caustic(sp+wv*0.8,uTime*0.55+nz(sp*0.05)*6.0);
    vec2 suv=(sp-uSimRect.xy)*uSimRect.zw;
    float inb=step(0.0,suv.x)*step(suv.x,1.0)*step(0.0,suv.y)*step(suv.y,1.0);
    float lap=texture2D(tRipple,suv).b*inb;
    float cf=smoothstep(0.0,0.14,dpt)*(0.35+0.65*max(N.y,0.0));
    float cl=(ca*1.25+clamp(-lap*9.0,-0.22,1.2)*min(dpt*3.0,1.0))*(0.2+0.8*dp)*mix(0.5,1.0,ao);
    col=max(col+alb*sunC*cl*cf,0.0);
  }
  return col;
}
vec3 haze(vec3 c,vec3 wp){ float d=length(wp-cameraPosition); return mix(c,vec3(0.50,0.70,0.60),smoothstep(14.0,32.0,d)*0.55); }`;

const VS_BASIC = `varying vec3 vW; varying vec3 vN;
void main(){ vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`;

const FS_BED = COMMON + `
varying vec3 vW; varying vec3 vN;
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
void main(){
  vec3 N=normalize(vN); float h=vW.y;
  float b1=nz(vW.xz*0.21), b2=nzb(vW.xz*0.57+0.31);
  vec2 gp=vW.xz*5.2+(vec2(b2,b1)-0.5)*0.6; vec2 ci=floor(gp), cf=fract(gp);
  float d1=9.0, d2=9.0; vec2 id=vec2(0.0);
  for(int j=-1;j<=1;j++){ for(int i=-1;i<=1;i++){
    vec2 g=vec2(float(i),float(j)); vec2 o=hash2(ci+g); vec2 r=g+o-cf; float d=dot(r,r);
    if(d<d1){d2=d1;d1=d;id=ci+g;}else if(d<d2){d2=d;} }}
  float edge=sqrt(d2)-sqrt(d1); vec2 rid=hash2(id+3.7);
  float stoneM=smoothstep(0.03,0.16,edge);
  vec3 stoneC=mix(vec3(0.40,0.38,0.33),vec3(0.76,0.73,0.64),rid.x);
  stoneC=mix(stoneC,vec3(0.58,0.41,0.30),step(0.80,rid.y)); stoneC=mix(stoneC,vec3(0.34,0.38,0.43),step(rid.y,0.12));
  stoneC*=0.82+0.28*smoothstep(0.1,0.5,edge);
  vec3 alb=mix(vec3(0.15,0.14,0.11),stoneC,stoneM); alb*=0.80+0.42*b1;
  alb=mix(alb,vec3(0.22,0.25,0.15)*(0.7+0.6*b2),smoothstep(0.45,1.05,-h)*0.55);
  float wet=1.0-smoothstep(0.0,0.05,h+(b2-0.5)*0.03); alb*=mix(1.08,0.74,wet);
  vec3 soil=vec3(0.37,0.30,0.20)*(0.8+0.4*b2); alb=mix(alb,soil,smoothstep(0.08,0.20,h+(b2-0.5)*0.1)*0.6);
  float gm=smoothstep(0.14,0.30,h+(b1-0.5)*0.22+(b2-0.5)*0.1);
  vec3 grassC=mix(vec3(0.15,0.35,0.13),vec3(0.42,0.62,0.18),nzb(vW.xz*0.33)); grassC*=0.85+0.3*nz(vW.xz*2.1);
  alb=mix(alb,grassC,gm);
  gl_FragColor=vec4(haze(shade(alb,N,vW,rockAO(vW)),vW),1.0);
}`;

const VS_PEBBLE = `attribute vec3 aOff; attribute vec3 aScl; attribute vec2 aRot; attribute vec3 aCol;
varying vec3 vW; varying vec3 vN; varying vec3 vC;
vec3 rot(vec3 p,vec2 r){ float c=cos(r.y), s=sin(r.y); p=vec3(p.x,p.y*c-p.z*s,p.y*s+p.z*c); c=cos(r.x); s=sin(r.x); return vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c); }
void main(){ vec3 p=rot(position*aScl,aRot)+aOff; vN=normalize(rot(normal/aScl,aRot)); vW=p; vC=aCol; gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0); }`;
const FS_PEBBLE = COMMON + `
varying vec3 vW; varying vec3 vN; varying vec3 vC;
void main(){
  vec3 N=normalize(vN); float b=nz(vW.xz*1.7+vC.r), b2=nzb(vW.xz*6.0);
  vec3 alb=vC*(0.84+0.3*b)*(0.9+0.2*b2); float wet=1.0-smoothstep(0.0,0.05,vW.y); alb*=mix(1.05,0.76,wet);
  float ao=rockAO(vW)*mix(0.5,1.0,smoothstep(-0.7,0.35,N.y));
  vec3 col=shade(alb,N,vW,ao);
  col+=vec3(0.16,0.15,0.12)*gLit*smoothstep(0.80,0.97,dot(N,normalize(uSun+vec3(0.0,0.6,0.0))));
  gl_FragColor=vec4(haze(col,vW),1.0);
}`;
const FS_ROCK = COMMON + `
varying vec3 vW; varying vec3 vN;
void main(){
  vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW);
  float n1=nz(vW.xz*0.33+vW.y*0.21), n2=nzb(vW.xy*0.7+vW.z*0.41), n3=nz(vW.zy*1.9+vW.x*0.7);
  vec3 stone=mix(vec3(0.33,0.34,0.37),vec3(0.68,0.65,0.58),n1); stone*=0.72+0.56*n2;
  stone=mix(stone,vec3(0.47,0.40,0.33),smoothstep(0.55,0.75,n3)*0.5);
  float y=vW.y;
  float mm=smoothstep(0.15,0.55,N.y+(n1-0.5)*1.1+(n3-0.5)*0.5)*smoothstep(0.04,0.24,y+(n2-0.5)*0.2);
  vec3 moss=mix(vec3(0.12,0.30,0.10),vec3(0.48,0.66,0.15),smoothstep(0.3,0.7,n3*0.6+n2*0.4));
  vec3 alb=mix(stone,moss,mm);
  float wet=1.0-smoothstep(0.02,0.09,y+(n3-0.5)*0.05); alb*=mix(1.0,0.62,wet); alb=mix(alb,alb*vec3(0.62,0.82,0.60),step(y,0.0));
  float ao=mix(0.55,1.0,smoothstep(-0.35,0.45,y));
  vec3 col=shade(alb,N,vW,ao);
  float rim=pow(1.0-max(dot(N,V),0.0),3.0); col+=mm*vec3(0.30,0.36,0.08)*rim*(0.25+0.75*gLit);
  gl_FragColor=vec4(haze(col,vW),1.0);
}`;
const VS_GRASS = `#define TAU 6.2831853
attribute vec3 aOff; attribute vec4 aPar; attribute vec3 aRnd; uniform float uLoop;
varying vec3 vW; varying float vT; varying vec3 vR; varying float vX;
void main(){
  float t=position.y; float h=aPar.x, yaw=aPar.z; vec2 dir=vec2(cos(yaw),sin(yaw)); vec2 side=vec2(-dir.y,dir.x);
  float ph=aOff.x*0.42+aOff.z*0.31+aRnd.x*1.3;
  float sway=sin(TAU*uLoop-ph)*0.085+sin(TAU*2.0*uLoop-ph*1.7+1.3)*0.04+sin(TAU*5.0*uLoop+ph*2.9)*0.012;
  float L=clamp(aPar.w+sway*0.8,0.0,1.6); float taper=pow(max(1.0-t,0.0),0.6);
  vec3 p=aOff; p.xz+=side*(position.x*aPar.y*taper); p.xz+=dir*(L*t*t*h); p.xz+=vec2(0.9,0.35)*(sway*t*t*h*0.7);
  p.y+=h*(t*(1.0+0.25*L)-0.62*L*t*t);
  vW=p; vT=t; vR=aRnd; vX=position.x; gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0);
}`;
const FS_GRASS = COMMON + `
varying vec3 vW; varying float vT; varying vec3 vR; varying float vX;
void main(){
  vec3 root=vec3(0.06,0.20,0.11), mid=vec3(0.20,0.48,0.13), tip=vec3(0.60,0.80,0.24);
  vec3 alb=mix(root,mid,smoothstep(0.0,0.55,vT)); alb=mix(alb,tip,smoothstep(0.4,1.0,vT)*(0.35+0.65*vR.y));
  alb*=0.78+0.44*vR.z; alb*=0.92+0.16*step(0.0,vX);
  float dp=dapple(vW); float ao=0.45+0.55*smoothstep(0.0,0.6,vT);
  vec3 col=alb*(vec3(0.33,0.47,0.45)*ao+vec3(0.98,0.90,0.52)*dp*(0.3+0.7*vT));
  gl_FragColor=vec4(haze(col,vW),1.0);
}`;
const VS_FERN = `#define TAU 6.2831853
attribute float aShade; attribute vec3 aOff; attribute vec4 aPar; uniform float uLoop;
varying vec3 vW; varying float vT; varying float vS; varying float vR;
void main(){
  float t=position.z; float L=aPar.x; float yaw=aPar.y; vec2 dir=vec2(cos(yaw),sin(yaw)); vec2 side=vec2(-dir.y,dir.x);
  float ph=aOff.x*0.4+aOff.z*0.3+aPar.w*4.0; float sway=sin(TAU*uLoop-ph)*0.06+sin(TAU*3.0*uLoop+ph*1.9)*0.018;
  vec3 p=aOff; p.xz+=dir*(t*L*(1.0-0.15*aPar.z*t))+side*(position.x*L); p.xz+=side*(sway*t*L*0.6);
  p.y+=L*(aPar.z*(1.5*t-1.25*t*t)+position.y+sway*t*0.5);
  vW=p; vT=t; vS=aShade; vR=aPar.w; gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0);
}`;
const FS_FERN = COMMON + `
varying vec3 vW; varying float vT; varying float vS; varying float vR;
void main(){
  vec3 alb=mix(vec3(0.08,0.27,0.12),vec3(0.30,0.58,0.17),vS); alb=mix(alb,vec3(0.55,0.76,0.26),smoothstep(0.5,1.0,vT)*0.5*vR); alb*=0.8+0.4*vR;
  float dp=dapple(vW); vec3 col=alb*(vec3(0.34,0.48,0.46)*(0.6+0.4*vT)+vec3(0.98,0.90,0.52)*dp);
  gl_FragColor=vec4(haze(col,vW),1.0);
}`;
const VS_WATER = `varying vec3 vW; varying float vZ;
void main(){ vec4 w=modelMatrix*vec4(position,1.0); vec4 mv=viewMatrix*w; vW=w.xyz; vZ=-mv.z; gl_Position=projectionMatrix*mv; }`;
const FS_WATER = COMMON + `
uniform sampler2D tScene; uniform sampler2D tDepth; uniform vec2 uRes; uniform vec2 uNF; uniform vec2 uTexel; uniform vec3 uSieve;
varying vec3 vW; varying float vZ;
float linZ(float d){float z=d*2.0-1.0;return 2.0*uNF.x*uNF.y/(uNF.y+uNF.x-z*(uNF.y-uNF.x));}
vec3 wave(vec2 p,vec2 vel,float sc,float T,float off){
  float ph=uTime/T+off; float p0=fract(ph), p1=fract(ph+0.5); float w=abs(1.0-2.0*p0);
  vec4 a=texture2D(tNoise,(p-vel*((p0-0.5)*T))*sc); vec4 b=texture2D(tNoise,(p-vel*((p1-0.5)*T))*sc+vec2(0.37,0.61));
  vec4 m=(mix(a,b,w)-0.5)/sqrt(w*w+(1.0-w)*(1.0-w)); return vec3(m.g*2.0,m.b*2.0,m.r+0.5);
}
vec3 envRefl(vec3 R,vec3 P){
  R.y=max(R.y,0.06); vec2 q=P.xz+R.xz/R.y*5.0; vec2 sw=0.01*vec2(sin(TAU*uLoop),cos(TAU*uLoop));
  float n=nz(q*0.047+sw+0.21)*0.6+nzb(q*0.15-sw+0.43)*0.4; float n2=nzb(q*0.31+0.77);
  float hole=smoothstep(0.545,0.585,n);
  vec3 leaf=mix(vec3(0.07,0.20,0.09),vec3(0.36,0.58,0.16),smoothstep(0.35,0.65,n2)); leaf=mix(leaf,vec3(0.62,0.80,0.25),smoothstep(0.49,0.545,n)*0.6);
  vec3 sky=mix(vec3(0.60,0.90,1.0),vec3(0.95,1.0,1.0),smoothstep(0.585,0.67,n))*1.8;
  return mix(leaf,sky,hole);
}
void main(){
  vec2 p=vW.xz;
  float cz=0.55*sin(p.x*0.28+0.4)+0.2*sin(p.x*0.63+1.7); float dcz=0.154*cos(p.x*0.28+0.4)+0.126*cos(p.x*0.63+1.7);
  float phi=p.x, psi=p.y-cz; vec2 vel=vec2(1.0,dcz);
  float eMin=1000.0; vec2 dMin=vec2(1.0,0.0); float aMin=1.0;
  for(int i=0;i<NR;i++){
    vec4 rk=uRocks[i]; vec2 d=p-rk.xy; float a2=rk.z*rk.z; float dd=dot(d,d); float r2=max(dd,a2*0.6);
    phi+=a2*d.x/r2; psi-=a2*d.y/r2; vel+=vec2(-a2*(d.x*d.x-d.y*d.y),-2.0*a2*d.x*d.y)/(r2*r2);
    float e=sqrt(dd)-rk.z; if(e<eMin){eMin=e;dMin=d;aMin=rk.z;}
  }
  vel*=0.55; float dLen=length(dMin)+0.0001; vec2 dDir=dMin/dLen; float up=clamp(0.5-0.5*dDir.x,0.0,1.0);
  vec2 uv=gl_FragCoord.xy/uRes; vec3 ray=vW-cameraPosition; float L=length(ray); vec3 V=-ray/L;
  float zb0=linZ(texture2D(tDepth,uv).x); float vd0=max(-(cameraPosition.y+ray.y*(zb0/vZ)),0.0); float dp=dapple(vW);
  vec3 w1=wave(p,vel,0.16,4.0,0.0); vec3 w2=wave(p,vel,0.53,2.6,0.37);
  vec2 w3=(texture2D(tNoise,p*0.33+uTime*vec2(-0.011,0.017)).gb-0.5)*2.0;
  float prox=1.0-smoothstep(0.0,1.3,eMin); float calm=smoothstep(0.0,0.25,vd0);
  vec2 slope=(w1.xy*0.11+w2.xy*0.10+w3*0.07)*(0.5+0.5*calm)*(1.0+0.9*prox);
  vec2 suv=(p-uSimRect.xy)*uSimRect.zw; float inb=step(0.0,suv.x)*step(suv.x,1.0)*step(0.0,suv.y)*step(suv.y,1.0);
  float rh=texture2D(tRipple,suv).r*inb;
  float rx=texture2D(tRipple,suv+vec2(uTexel.x,0.0)).r-texture2D(tRipple,suv-vec2(uTexel.x,0.0)).r;
  float ry=texture2D(tRipple,suv+vec2(0.0,uTexel.y)).r-texture2D(tRipple,suv-vec2(0.0,uTexel.y)).r;
  slope+=vec2(rx,ry)*inb*0.55;
  float fn=w2.z, fn2=w1.z; float ang=atan(dMin.y,dMin.x);
  float bph=(eMin+(fn-0.5)*0.22+0.03*sin(ang*6.0+uTime*1.1))*12.0-uTime*1.6;
  float bfall=(1.0-smoothstep(0.05,0.85,eMin))*(0.3+0.7*up);
  slope+=dDir*cos(bph)*0.10*bfall;
  float bowLine=smoothstep(0.90,0.985,sin(bph))*bfall*smoothstep(0.30,0.50,fn+0.25*up);
  float refrK=smoothstep(0.0,0.3,vd0)*(0.6+0.8*min(vd0,1.0));
  vec2 off=(mat3(viewMatrix)*vec3(slope.x,0.0,slope.y)).xy*(refrK*1.5/vZ); off.x*=uRes.y/uRes.x;
  float zb1=linZ(texture2D(tDepth,uv+off).x); float ok=step(vZ+0.005,zb1); off*=ok; zb1=mix(zb0,zb1,ok);
  vec3 refr; refr.r=texture2D(tScene,uv+off*1.15).r; refr.g=texture2D(tScene,uv+off).g; refr.b=texture2D(tScene,uv+off*0.85).b;
  float path=clamp((zb1-vZ)*L/vZ,0.0,6.0); vec3 Tr=exp(-path*vec3(1.45,0.42,0.80));
  vec3 deep=vec3(0.03,0.15,0.11)*(0.7+0.5*dp); vec3 col=refr*Tr+deep*(1.0-exp(-path*0.85));
  // Silt washed out of the sieve drifts downstream as a cloudy plume.
  vec2 sdv=p-uSieve.xy; float down=max(sdv.x,0.0);
  float plume=exp(-(sdv.y*sdv.y)/(0.6+down*0.45))*exp(-max(-sdv.x,0.0)*1.8)*exp(-down*0.22);
  float cloud=nzb(vec2(sdv.x*0.55-uTime*0.22,sdv.y*1.3+0.2))*0.65+nz(p*0.37-vec2(uTime*0.04,0.0))*0.35;
  float silt=uSieve.z*plume*smoothstep(0.32,0.7,cloud+0.3*plume);
  col=mix(col,vec3(0.46,0.35,0.22)*(0.7+0.5*dp),clamp(silt,0.0,0.85));
  vec3 Nr=normalize(vec3(-slope.x*1.5,1.0,-slope.y*1.5)); float cosT=max(dot(V,Nr),0.0);
  float F=0.02+0.98*pow(1.0-cosT,2.6); F*=smoothstep(0.0,0.05,vd0); col=mix(col,envRefl(reflect(-V,Nr),vW),F);
  vec3 w4=wave(p,vel,1.9,1.7,0.61); vec2 sg=slope*1.3+w4.xy*0.09; vec3 Ng=normalize(vec3(-sg.x,1.0,-sg.y));
  float sd=dot(reflect(-V,Ng),uSun); float glint=smoothstep(0.9955,0.9985,sd); float sheen=pow(max(sd,0.0),60.0);
  col+=vec3(1.0,0.97,0.86)*(glint*1.6+sheen*0.10)*(0.08+0.92*dp)*smoothstep(0.0,0.04,vd0);
  float nearRock=1.0-smoothstep(0.2,0.7,eMin); float cw=0.05+0.16*fn*(0.4+0.9*up);
  float contact=(1.0-smoothstep(cw*0.6,cw,vd0))*nearRock;
  float wake=smoothstep(0.0,0.6,dMin.x/aMin)*(1.0-smoothstep(0.3,1.0,abs(dMin.y)/aMin))*(1.0-smoothstep(0.2,2.6,eMin));
  float blobs=smoothstep(0.62,0.66,fn*0.6+fn2*0.4+0.04*wake)*wake;
  float lp=psi*2.1+(fn-0.5)*0.55+(fn2-0.5)*0.8; float ld=abs(fract(lp)-0.5); float streak=1.0-smoothstep(0.02,0.055,ld);
  float dash=nzb(vec2(phi*0.13-uTime*0.07,psi*0.45+0.3)); float proxW=1.0-smoothstep(0.3,2.4,eMin);
  streak*=smoothstep(0.56,0.66,dash)*(0.22+0.78*proxW)*smoothstep(0.04,0.22,vd0);
  float ring=smoothstep(0.025,0.085,rh);
  float white=clamp(max(contact,blobs*0.85)+bowLine*0.9+streak*0.75+ring*0.6,0.0,1.0);
  vec3 wc=mix(vec3(0.66,0.82,0.84),vec3(1.0,1.0,0.96),dp); col=mix(col,wc,white);
  col+=wc*0.08*(1.0-smoothstep(0.004,0.03,vd0))*(1.0-nearRock);
  gl_FragColor=vec4(haze(col,vW),1.0);
}`;
const FS_SIM = `uniform sampler2D tPrev; uniform sampler2D tMask; uniform vec2 uTexel; uniform vec3 uDrop; varying vec2 vUv;
void main(){
  vec4 c=texture2D(tPrev,vUv); float h=c.r, hp=c.g;
  float n=texture2D(tPrev,vUv+vec2(uTexel.x,0.0)).r+texture2D(tPrev,vUv-vec2(uTexel.x,0.0)).r+texture2D(tPrev,vUv+vec2(0.0,uTexel.y)).r+texture2D(tPrev,vUv-vec2(0.0,uTexel.y)).r;
  float lap=n-4.0*h; float hn=h+(h-hp)*0.986+0.22*lap; hn*=0.9985;
  vec2 d=(vUv-uDrop.xy)/uTexel; float r2=dot(d,d)/6.0; hn+=uDrop.z*(1.0-r2)*exp(-r2);
  hn*=texture2D(tMask,vUv).r; vec2 e=min(vUv,1.0-vUv); hn*=smoothstep(0.0,0.03,min(e.x,e.y));
  gl_FragColor=vec4(hn,h,lap,1.0);
}`;
const FS_WING = `varying vec2 vUv;
void main(){
  vec2 p=vUv; vec2 a=p-vec2(0.47,0.70); a=vec2(a.x*0.966+a.y*0.259,-a.x*0.259+a.y*0.966); a/=vec2(0.50,0.25);
  vec2 b=(p-vec2(0.36,0.30))/vec2(0.36,0.29); float s=max(1.0-length(a),1.0-length(b)); if(s<0.0) discard;
  float core=smoothstep(0.05,0.38,s); vec3 blue=mix(vec3(0.03,0.22,0.90),vec3(0.25,0.78,1.0),smoothstep(0.25,0.95,s));
  float vein=0.5+0.5*sin(atan(p.y-0.5,p.x+0.05)*34.0); blue*=0.82+0.18*smoothstep(0.1,0.4,vein);
  gl_FragColor=vec4(mix(vec3(0.02,0.03,0.07),blue,core)*1.1,1.0);
}`;
// Wooden sieve frame, wire mesh, soil heap and glass beads.
const FS_WOOD = COMMON + `
varying vec3 vW; varying vec3 vN;
void main(){ vec3 N=normalize(vN); float g=nz(vec2(atan(vW.z,vW.x)*3.0,vW.y*9.0));
  vec3 alb=mix(vec3(0.42,0.27,0.14),vec3(0.66,0.47,0.27),g); float wet=1.0-smoothstep(0.0,0.05,vW.y); alb*=mix(1.0,0.7,wet);
  gl_FragColor=vec4(haze(shade(alb,N,vW,1.0),vW),1.0); }`;
const FS_MESH = COMMON + `
uniform vec2 uCenter; varying vec3 vW; varying vec3 vN;
void main(){ vec2 g=abs(fract((vW.xz-uCenter)*16.0)-0.5); if(min(g.x,g.y)>0.09) discard;
  vec3 col=shade(vec3(0.72,0.70,0.62),vec3(0.0,1.0,0.0),vW,1.0); gl_FragColor=vec4(haze(col,vW),1.0); }`;
const FS_DIRT = COMMON + `
varying vec3 vW; varying vec3 vN;
void main(){ vec3 N=normalize(vN); float g=nz(vW.xz*3.1)*0.6+nzb(vW.xz*9.0)*0.4;
  vec3 alb=mix(vec3(0.30,0.21,0.14),vec3(0.52,0.38,0.24),g); gl_FragColor=vec4(haze(shade(alb,N,vW,1.0)*1.05,vW),1.0); }`;
const FS_BEAD = COMMON + `
uniform vec3 uColor; varying vec3 vW; varying vec3 vN;
void main(){ vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW);
  float spec=pow(max(dot(reflect(-uSun,N),V),0.0),40.0); float rim=pow(1.0-max(dot(N,V),0.0),2.0);
  vec3 col=uColor*(0.55+0.55*max(dot(N,uSun),0.0))+vec3(1.0)*spec*1.4+uColor*rim*0.6; gl_FragColor=vec4(col,1.0); }`;
const BEAD_COLORS = [[0.18, 0.62, 0.58], [0.82, 0.27, 0.2], [0.9, 0.7, 0.24], [0.24, 0.36, 0.78], [0.5, 0.25, 0.6], [0.92, 0.88, 0.78], [0.86, 0.47, 0.17], [0.12, 0.45, 0.3]];

/**
 * Builds the stream inside `container`. Returns {shake, setSoil, revealBeads, destroy}.
 * Throws if the device lacks the WebGL features the scene needs; the caller keeps the dry sieve.
 */
export function createStreamSieve(container, { onShake = () => {}, reducedMotion = false } = {}) {
  const THREE = window.THREE; if (!THREE) throw new Error('three.js not loaded');
  const { nA, nB } = noiseArrays(), terrainH = makeTerrain(nA, nB), rnd = mulberry32(1337);
  const canvas = document.createElement('canvas'); canvas.className = 'stream-canvas'; container.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'default' });
  const gl2 = renderer.capabilities.isWebGL2;
  if (!gl2 && !renderer.extensions.has('WEBGL_depth_texture')) { renderer.dispose(); canvas.remove(); throw new Error('depth textures unsupported'); }
  const ripplesOK = gl2 || (renderer.extensions.has('OES_texture_half_float') && renderer.extensions.has('EXT_color_buffer_half_float'));
  // Full-screen scene: keep the pixel count phone-friendly.
  { const r = container.getBoundingClientRect(); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, r.width * r.height > 300000 ? 1 : 1.25)); }
  renderer.setClearColor(0x14261b, 1);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 0.5, 60);
  const disposables = [];
  const keep = x => { disposables.push(x); return x; };

  const noiseTex = (() => {
    const data = new Uint8Array(NS * NS * 4), gx = new Float32Array(NS * NS), gy = new Float32Array(NS * NS); let gs = 0;
    for (let y = 0; y < NS; y++) for (let x = 0; x < NS; x++) {
      const i = y * NS + x;
      gx[i] = (nA[y * NS + (x + 1) % NS] - nA[y * NS + (x + NS - 1) % NS]) * 0.5; gy[i] = (nA[((y + 1) % NS) * NS + x] - nA[((y + NS - 1) % NS) * NS + x]) * 0.5;
      gs += gx[i] * gx[i] + gy[i] * gy[i];
    }
    const gk = 1 / (3 * Math.sqrt(gs / (2 * NS * NS)));
    for (let i = 0; i < NS * NS; i++) {
      data[i * 4] = Math.round(nA[i] * 255); data[i * 4 + 1] = Math.round(clamp(gx[i] * gk * 0.5 + 0.5, 0, 1) * 255);
      data[i * 4 + 2] = Math.round(clamp(gy[i] * gk * 0.5 + 0.5, 0, 1) * 255); data[i * 4 + 3] = Math.round(nB[i] * 255);
    }
    const t = keep(new THREE.DataTexture(data, NS, NS, THREE.RGBAFormat));
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.minFilter = THREE.LinearMipMapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
    return t;
  })();

  // Ripple simulation (half-float ping-pong). Without float targets the water still renders, just without rings.
  const SX0 = -9, SZ0 = -5.6, SW = 18, SH = 11.25, SIMW = 360, SIMH = 225;
  const simRT = () => keep(new THREE.WebGLRenderTarget(SIMW, SIMH, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false }));
  let simA = ripplesOK ? simRT() : null, simB = ripplesOK ? simRT() : null;
  const zeroTex = keep(new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat)); zeroTex.needsUpdate = true;
  const maskTex = (() => {
    const MW = 192, MH = 120, md = new Uint8Array(MW * MH * 4);
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const x = SX0 + (i + 0.5) / MW * SW, z = SZ0 + (j + 0.5) / MH * SH; let m = clamp(-terrainH(x, z) / 0.07, 0, 1);
      for (const R of ROCKS) m *= clamp((Math.hypot(x - R.x, z - R.z) - R.a * 0.9) / (R.a * 0.14), 0, 1);
      const v = Math.round(m * 255), k = (j * MW + i) * 4; md[k] = md[k + 1] = md[k + 2] = v; md[k + 3] = 255;
    }
    const t = keep(new THREE.DataTexture(md, MW, MH, THREE.RGBAFormat)); t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
  })();

  const U = {
    uTime: { value: 0 }, uLoop: { value: 0 }, uSun: { value: new THREE.Vector3(-0.17, 0.72, -0.68).normalize() },
    tNoise: { value: noiseTex }, tRipple: { value: simA ? simA.texture : zeroTex }, uSimRect: { value: new THREE.Vector4(SX0, SZ0, 1 / SW, 1 / SH) },
    uRocks: { value: ROCKS.map(R => new THREE.Vector4(R.x, R.z, R.a, R.top)) }, uTexel: { value: new THREE.Vector2(1 / SIMW, 1 / SIMH) },
    tScene: { value: null }, tDepth: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uNF: { value: new THREE.Vector2(0.5, 60) },
    uSieve: { value: new THREE.Vector3(SIEVE.x, SIEVE.z, 0) }, uCenter: { value: new THREE.Vector2(SIEVE.x, SIEVE.z) },
  };
  const mat = (vs, fs, opts = {}) => keep(new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms: U, ...opts }));
  function instanced(base, attrs, count) {
    const g = keep(new THREE.InstancedBufferGeometry());
    if (base.index) g.setIndex(base.index);
    for (const k in base.attributes) g.setAttribute(k, base.attributes[k]);
    for (const a in attrs) g.setAttribute(a, new THREE.InstancedBufferAttribute(new Float32Array(attrs[a][0]), attrs[a][1]));
    g.instanceCount = count; return g;
  }
  const shoreZ = (x, side) => { const c = centerZ(x); let z = c; for (let i = 0; i < 220; i++) { z = c + side * i * 0.05; if (terrainH(x, z) > 0.06) break; } return z; };
  const TX0 = -13, TX1 = 13, TZ0 = -9, TZ1 = 8;

  { // terrain
    const g = keep(new THREE.PlaneGeometry(TX1 - TX0, TZ1 - TZ0, 170, 110)); g.rotateX(-Math.PI / 2);
    const P = g.attributes.position, zc = (TZ0 + TZ1) / 2;
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i) + zc; P.setXYZ(i, x, terrainH(x, z), z); }
    g.computeVertexNormals(); scene.add(new THREE.Mesh(g, mat(VS_BASIC, FS_BED)));
  }
  { // rocks
    const rockMat = mat(VS_BASIC, FS_ROCK);
    for (const R of ROCKS) {
      const g = keep(new THREE.SphereGeometry(1, 48, 30)), P = g.attributes.position, Nn = g.attributes.normal;
      const cy = Math.cos(R.seed * 1.7), sy = Math.sin(R.seed * 1.7), pw = 3.4;
      const f = (dx, dy, dz, o) => {
        const bx = dx * cy - dz * sy, bz = dx * sy + dz * cy;
        const rr = Math.pow(Math.abs(bx) ** pw + Math.abs(dy) ** pw + Math.abs(bz) ** pw, -1 / pw);
        const n1 = (sn(nB, dx * 0.11 + R.seed, dy * 0.11 + dz * 0.07) + sn(nB, dz * 0.11 + R.seed * 2.1, dx * 0.06 - dy * 0.11)) * 0.5;
        const n2 = sn(nA, dx * 0.23 + dy * 0.17 + R.seed, dz * 0.23 - dy * 0.13);
        const r = rr * (0.80 + 0.42 * n1 + 0.14 * n2); o[0] = dx * r * R.s; o[1] = dy * r * R.sy; o[2] = dz * r * R.s;
      };
      const p0 = [0, 0, 0], p1 = [0, 0, 0], p2 = [0, 0, 0], e = 0.03;
      for (let i = 0; i < P.count; i++) {
        let dx = P.getX(i), dy = P.getY(i), dz = P.getZ(i); const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
        f(dx, dy, dz, p0);
        let ux = 0, uy = 1, uz = 0; if (Math.abs(dy) > 0.95) { ux = 1; uy = 0; }
        let t1x = uy * dz - uz * dy, t1y = uz * dx - ux * dz, t1z = ux * dy - uy * dx; const tl = Math.hypot(t1x, t1y, t1z); t1x /= tl; t1y /= tl; t1z /= tl;
        const t2x = dy * t1z - dz * t1y, t2y = dz * t1x - dx * t1z, t2z = dx * t1y - dy * t1x;
        const ax = dx + e * t1x, ay = dy + e * t1y, az = dz + e * t1z, al = Math.hypot(ax, ay, az); f(ax / al, ay / al, az / al, p1);
        const bx = dx + e * t2x, by = dy + e * t2y, bz = dz + e * t2z, bl = Math.hypot(bx, by, bz); f(bx / bl, by / bl, bz / bl, p2);
        const e1x = p1[0] - p0[0], e1y = p1[1] - p0[1], e1z = p1[2] - p0[2], e2x = p2[0] - p0[0], e2y = p2[1] - p0[1], e2z = p2[2] - p0[2];
        const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nzz = e1x * e2y - e1y * e2x; let nl = Math.hypot(nx, ny, nzz) || 1;
        if (nx * dx + ny * dy + nzz * dz < 0) nl = -nl;
        P.setXYZ(i, p0[0], p0[1], p0[2]); Nn.setXYZ(i, nx / nl, ny / nl, nzz / nl);
      }
      g.computeBoundingSphere(); const m = new THREE.Mesh(g, rockMat); m.position.set(R.x, R.y, R.z); scene.add(m);
    }
  }
  { // pebbles
    const pal = [[0.62, 0.62, 0.60], [0.82, 0.80, 0.74], [0.70, 0.60, 0.46], [0.50, 0.38, 0.28], [0.36, 0.40, 0.44], [0.62, 0.40, 0.28], [0.90, 0.90, 0.86], [0.56, 0.56, 0.52], [0.74, 0.72, 0.66]];
    const off = [], scl = [], rot = [], col = []; let n = 0;
    for (let i = 0; i < 5000 && n < 900; i++) {
      const x = -10 + rnd() * 20, z = -7 + rnd() * 12, h = terrainH(x, z);
      if (h > 0.3) continue;
      const pr = h < 0 ? (h < -0.6 ? 0.35 : 0.6) : 1.0 - (h / 0.3) * 0.8;
      if (rnd() > pr || inRock(x, z, 0.85) || Math.hypot(x - SIEVE.x, z - SIEVE.z) < SIEVE.r) continue;
      const r = rnd(), s = 0.07 + r * r * 0.17, sy = s * (0.42 + rnd() * 0.25);
      off.push(x, h + sy * 0.35, z); scl.push(s * (0.85 + rnd() * 0.4), sy, s * (0.75 + rnd() * 0.35)); rot.push(rnd() * TAU, (rnd() - 0.5) * 0.5);
      const c = pal[Math.floor(rnd() * pal.length)], k = 0.82 + rnd() * 0.3; col.push(c[0] * k, c[1] * k, c[2] * k); n++;
    }
    const m = new THREE.Mesh(instanced(keep(new THREE.SphereGeometry(1, 10, 7)), { aOff: [off, 3], aScl: [scl, 3], aRot: [rot, 2], aCol: [col, 3] }, n), mat(VS_PEBBLE, FS_PEBBLE));
    m.frustumCulled = false; scene.add(m);
  }
  const grass = (() => {
    const off = [], par = [], rn = []; let n = 0;
    const blade = (x, z, h, w, yaw, lean) => { off.push(x, terrainH(x, z) - 0.03, z); par.push(h, w, yaw, lean); rn.push(rnd(), rnd(), rnd()); n++; };
    for (let i = 0; i < 16000 && n < 4500; i++) {
      const x = -12 + rnd() * 24, z = -8.5 + rnd() * 16, h = terrainH(x, z);
      if (h < 0.13 || rnd() > sstep(0.13, 0.3, h) || inRock(x, z, 0.92)) continue;
      blade(x, z, 0.22 + rnd() * 0.4, 0.03 + rnd() * 0.025, rnd() * TAU, 0.15 + rnd() * 0.55);
    }
    const spots = [[4.8, 4.2], [2.4, 4.5], [-6.6, -4.3], [-3.5, 4.4], [0.3, 4.6]];
    for (let i = 0; i < 18; i++) { const sx = -9 + rnd() * 18, sd = rnd() < 0.5 ? -1 : 1; spots.push([sx, shoreZ(sx, sd) + sd * (0.05 + rnd() * 0.7)]); }
    for (const s of spots) {
      if (inRock(s[0], s[1], 0.95)) continue;
      const cnt = 20 + Math.floor(rnd() * 20), big = rnd(), hmin = 0.6 + big * 0.4, hmax = 1.1 + big * 0.9, spread = 0.22 + rnd() * 0.2;
      for (let j = 0; j < cnt; j++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * spread; blade(s[0] + Math.cos(a) * r, s[1] + Math.sin(a) * r, hmin + rnd() * (hmax - hmin), 0.04 + rnd() * 0.035, a + (rnd() - 0.5) * 0.9, 0.3 + rnd() * 0.95); }
    }
    const base = keep(new THREE.PlaneGeometry(1, 1, 1, 5)); base.translate(0, 0.5, 0);
    const m = new THREE.Mesh(instanced(base, { aOff: [off, 3], aPar: [par, 4], aRnd: [rn, 3] }, n), mat(VS_GRASS, FS_GRASS, { side: THREE.DoubleSide }));
    m.frustumCulled = false; scene.add(m); return m;
  })();
  const ferns = (() => {
    const fp = [], fs = [], NL = 16;
    const tri = (a, b, c, s) => { fp.push(...a, ...b, ...c); fs.push(s, s, s); };
    for (let i = 0; i < 8; i++) { const z0 = i / 8, z1 = (i + 1) / 8, w = 0.011; tri([-w, 0, z0], [w, 0, z0], [w, 0, z1], 0.25); tri([-w, 0, z0], [w, 0, z1], [-w, 0, z1], 0.25); }
    for (let i = 0; i < NL; i++) {
      const zc = 0.08 + 0.9 * i / (NL - 1), prof = Math.pow(Math.sin(Math.PI * Math.pow((zc - 0.04) / 0.98, 0.6)), 0.8);
      const len = 0.03 + 0.24 * prof, sp = 0.9 / (NL - 1) * 0.62;
      for (const sd of [-1, 1]) {
        const A = [0, 0, zc], B = [sd * len, -len * 0.22, zc + len * 0.38], M = [B[0] * 0.42, B[1] * 0.42, zc + (B[2] - zc) * 0.42], sh = 0.45 + 0.55 * rnd();
        tri(A, [M[0], M[1], M[2] + sp], B, sh); tri(A, B, [M[0], M[1], M[2] - sp], sh * 0.85);
      }
    }
    const base = keep(new THREE.BufferGeometry());
    base.setAttribute('position', new THREE.BufferAttribute(new Float32Array(fp), 3)); base.setAttribute('aShade', new THREE.BufferAttribute(new Float32Array(fs), 1));
    const spots = [[6.4, -4.5], [4.2, -5.0], [-3.2, 4.9], [-0.8, -5.2]];
    for (let i = 0; i < 7; i++) { const sx = -9 + rnd() * 18, sd = rnd() < 0.6 ? -1 : 1; spots.push([sx, shoreZ(sx, sd) + sd * (0.5 + rnd() * 1.2)]); }
    const off = [], par = []; let n = 0;
    for (const s of spots) {
      if (inRock(s[0], s[1], 1.0)) continue;
      const nf = 8 + Math.floor(rnd() * 4), y = terrainH(s[0], s[1]) + 0.02, j0 = rnd() * TAU;
      for (let j = 0; j < nf; j++) { off.push(s[0], y, s[1]); par.push(0.75 + rnd() * 0.75, j0 + j / nf * TAU + rnd() * 0.5, 0.5 + rnd() * 0.5, rnd()); n++; }
    }
    const m = new THREE.Mesh(instanced(base, { aOff: [off, 3], aPar: [par, 4] }, n), mat(VS_FERN, FS_FERN, { side: THREE.DoubleSide }));
    m.frustumCulled = false; scene.add(m); return m;
  })();
  const water = (() => {
    const NX = 110, NZ = 72, hg = new Float32Array((NX + 1) * (NZ + 1)), pos = new Float32Array((NX + 1) * (NZ + 1) * 3), idx = [];
    for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
      const x = TX0 + (TX1 - TX0) * i / NX, z = TZ0 + (TZ1 - TZ0) * j / NZ, k = j * (NX + 1) + i;
      hg[k] = terrainH(x, z); pos[k * 3] = x; pos[k * 3 + 1] = 0; pos[k * 3 + 2] = z;
    }
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; if (Math.min(hg[a], hg[b], hg[c], hg[d]) < 0.03) idx.push(a, c, b, b, c, d); }
    const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, mat(VS_WATER, FS_WATER, { side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = -1; scene.add(m); return m;
  })();

  // The sieve floats at the edge of the current.
  const sieve = new THREE.Group(); sieve.position.set(SIEVE.x, 0, SIEVE.z); scene.add(sieve);
  { const g = keep(new THREE.TorusGeometry(SIEVE.r, 0.075, 12, 56)); g.rotateX(Math.PI / 2); const ring = new THREE.Mesh(g, mat(VS_BASIC, FS_WOOD)); ring.position.y = 0.06; sieve.add(ring);
    const disk = keep(new THREE.CircleGeometry(SIEVE.r - 0.02, 48)); disk.rotateX(-Math.PI / 2); const net = new THREE.Mesh(disk, mat(VS_BASIC, FS_MESH, { side: THREE.DoubleSide })); net.position.y = 0.03; sieve.add(net); }
  const heap = new THREE.Mesh(keep(new THREE.SphereGeometry(1, 28, 16)), mat(VS_BASIC, FS_DIRT)); heap.position.y = 0.03; sieve.add(heap);
  const beads = [];
  function setSoil(frac) { const f = clamp(frac, 0, 1); heap.visible = f > 0.02; heap.scale.set(0.62 * Math.sqrt(f) + 0.05, 0.22 * f + 0.01, 0.58 * Math.sqrt(f) + 0.05); }
  setSoil(0);
  function revealBeads(count = 1) {
    for (let k = 0; k < count; k++) for (let i = 0; i < 9; i++) {
      const c = BEAD_COLORS[(beads.length + i) % BEAD_COLORS.length];
      const m = new THREE.Mesh(keep(new THREE.SphereGeometry(1, 14, 10)), mat(VS_BASIC, FS_BEAD, { uniforms: { ...U, uColor: { value: new THREE.Vector3(...c) } } }));
      const a = rnd() * TAU, r = Math.sqrt(rnd()) * (SIEVE.r * 0.7); m.position.set(Math.cos(a) * r, 0.06, Math.sin(a) * r);
      m.userData = { born: clock, size: 0.035 + rnd() * 0.025 }; m.scale.setScalar(0.001); sieve.add(m); beads.push(m);
    }
  }

  // Butterfly (skipped when the player prefers reduced motion).
  const bf = new THREE.Group(), pR = new THREE.Group(), pL = new THREE.Group();
  if (!reducedMotion) {
    const wg = keep(new THREE.PlaneGeometry(1, 1)); wg.translate(0.5, 0, 0); wg.rotateX(Math.PI / 2);
    const wm = keep(new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: FS_WING, side: THREE.DoubleSide }));
    pL.scale.x = -1; pR.add(new THREE.Mesh(wg, wm)); pL.add(new THREE.Mesh(wg, wm));
    const body = new THREE.Mesh(keep(new THREE.SphereGeometry(1, 8, 6)), keep(new THREE.MeshBasicMaterial({ color: 0x0b0d16 }))); body.scale.set(0.06, 0.05, 0.42);
    bf.add(pR, pL, body); bf.scale.setScalar(0.27); scene.add(bf);
  }
  const BP = 32, bp = { x: 0, z: 0 }, bq = { x: 0, z: 0 }; let lastBounce = -1;
  const bpos = (t, o) => { const a = TAU * t / BP; o.x = 4.4 * Math.sin(a) + 0.9 * Math.sin(3 * a + 1.0); o.z = 0.35 + 1.45 * Math.sin(2 * a + 0.7) + 0.45 * Math.cos(5 * a + 0.3); };
  function updateButterfly(t) {
    if (reducedMotion) return;
    bpos(t, bp); bpos(t + 0.05, bq); const yaw = Math.atan2(bq.x - bp.x, bq.z - bp.z); let lift = 0;
    for (const R of ROCKS) lift = Math.max(lift, (1 - sstep(R.a, R.a * 1.8, Math.hypot(bp.x - R.x, bp.z - R.z))) * (Math.max(R.top, 0) + 0.22));
    const bt = t / 0.36, bi = Math.floor(bt), ph = bt - bi, y = 0.06 + 0.27 * (0.5 - 0.5 * Math.cos(TAU * ph)) + lift;
    if (bi !== lastBounce) { lastBounce = bi; if (lift < 0.03 && terrainH(bp.x, bp.z) < -0.05) addDrop(bp.x, bp.z, 0.34, 3); }
    bf.position.set(bp.x, y, bp.z); bf.rotation.set(-0.2 + 0.1 * Math.sin(t * 3.1), yaw + 0.15 * Math.sin(t * 2.3), 0.12 * Math.sin(t * 4.7), 'YXZ');
    const fl = 0.3 + 0.95 * Math.sin(TAU * 7.0 * t); pR.rotation.z = fl; pL.rotation.z = -fl;
  }

  // Ripple simulation pass.
  const simScene = new THREE.Scene(), simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const simMat = keep(new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}', fragmentShader: FS_SIM, depthTest: false, depthWrite: false,
    uniforms: { tPrev: { value: null }, tMask: { value: maskTex }, uTexel: { value: new THREE.Vector2(1 / SIMW, 1 / SIMH) }, uDrop: { value: new THREE.Vector3(0, 0, 0) } } }));
  simScene.add(new THREE.Mesh(keep(new THREE.PlaneGeometry(2, 2)), simMat));
  const drops = [];
  function addDrop(x, z, s, n) { if (!ripplesOK) return; drops.push({ u: (x - SX0) / SW, v: (z - SZ0) / SH, s, n }); if (drops.length > 24) drops.shift(); }
  function simStep() {
    if (!ripplesOK) return;
    const dv = simMat.uniforms.uDrop.value;
    if (drops.length) { const d = drops[0]; dv.set(d.u, d.v, d.s); if (--d.n <= 0) drops.shift(); } else dv.z = 0;
    simMat.uniforms.tPrev.value = simA.texture; renderer.setRenderTarget(simB); renderer.render(simScene, simCam);
    const t = simA; simA = simB; simB = t;
  }

  // Colour + depth of the scene behind the water, for refraction.
  let sceneRT = null; const bufSize = new THREE.Vector2();
  function makeSceneRT(w, h) {
    if (sceneRT) { sceneRT.depthTexture.dispose(); sceneRT.dispose(); }
    sceneRT = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false });
    sceneRT.depthTexture = new THREE.DepthTexture(w, h, THREE.UnsignedIntType); U.tScene.value = sceneRT.texture; U.tDepth.value = sceneRT.depthTexture;
  }
  const cam = { th: 0.22, ph: 0.95, d: 5.6 }, TGT = { x: SIEVE.x + 0.5, z: SIEVE.z };
  function updateCamera(t) {
    const th = cam.th + (reducedMotion ? 0 : 0.07 * Math.sin(t * 0.09)), D = cam.d * Math.max(1, Math.pow(1.55 / camera.aspect, 0.85));
    camera.position.set(TGT.x + D * Math.sin(th) * Math.cos(cam.ph), D * Math.sin(cam.ph), TGT.z + D * Math.cos(th) * Math.cos(cam.ph)); camera.lookAt(TGT.x, 0, TGT.z);
  }
  function resize() {
    const r = container.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.getDrawingBufferSize(bufSize); makeSceneRT(bufSize.x, bufSize.y); U.uRes.value.copy(bufSize);
  }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();

  // Shaking: the frame jolts, the water rings, and silt clouds the current downstream.
  let jolt = 0, silt = 0;
  function shake(power = 1) {
    jolt = Math.min(1.4, jolt + 0.9 * power); silt = Math.min(1.3, silt + 0.6 * power);
    for (let i = 0; i < 3; i++) { const a = rnd() * TAU; addDrop(SIEVE.x + Math.cos(a) * SIEVE.r, SIEVE.z + Math.sin(a) * SIEVE.r, 0.45, 2); }
  }
  // Drag across the picture to sieve; a short tap drops a ripple on the water.
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let drag = null;
  const onDown = e => { drag = { x: e.clientX, travel: 0, moved: 0 }; try { canvas.setPointerCapture(e.pointerId); } catch {} };
  const onMove = e => { if (!drag) return; const dx = Math.abs(e.clientX - drag.x); drag.x = e.clientX; drag.travel += dx; drag.moved += dx; if (drag.travel > 60) { drag.travel = 0; onShake(0.8); } };
  const onUp = e => {
    if (drag && drag.moved < 6) {
      const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1));
      camera.updateMatrixWorld(); ray.setFromCamera(ndc, camera); const o = ray.ray.origin, d = ray.ray.direction;
      if (d.y < -0.01) { const t = -o.y / d.y; addDrop(o.x + d.x * t, o.z + d.z * t, 0.5, 3); }
    }
    drag = null;
  };
  canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', () => { drag = null; });

  let last = performance.now(), clock = 0, acc = 0, frame = 0, disposed = false; const STEP = 1 / 60;
  function tick(now) {
    if (disposed) return; frame = requestAnimationFrame(tick);
    if (document.hidden) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.1); last = now; clock += dt;
    U.uTime.value = clock; U.uLoop.value = reducedMotion ? 0.2 : (clock % LOOP) / LOOP;
    updateCamera(clock); updateButterfly(clock);
    jolt *= Math.exp(-dt * 3.2); silt *= Math.exp(-dt * 0.3); U.uSieve.value.z = silt;
    sieve.position.x = SIEVE.x + Math.sin(clock * 34) * 0.06 * jolt; sieve.position.z = SIEVE.z + Math.cos(clock * 27) * 0.035 * jolt;
    sieve.rotation.y = Math.sin(clock * 22) * 0.05 * jolt;
    for (const b of beads) { const k = clamp((clock - b.userData.born) / 0.5, 0, 1), pop = 1 + 0.35 * Math.sin(k * Math.PI); b.scale.setScalar(b.userData.size * k * pop); }
    acc += dt; let n = 0; while (acc >= STEP && n < 3) { simStep(); acc -= STEP; n++; } if (acc > STEP) acc = 0;
    U.tRipple.value = simA ? simA.texture : zeroTex;
    water.visible = false; grass.visible = false; ferns.visible = false; bf.visible = false;
    renderer.setRenderTarget(sceneRT); renderer.render(scene, camera);
    water.visible = true; grass.visible = true; ferns.visible = true; bf.visible = !reducedMotion;
    renderer.setRenderTarget(null); renderer.render(scene, camera);
  }
  frame = requestAnimationFrame(tick);

  return {
    shake, setSoil, revealBeads, ripples: ripplesOK,
    destroy() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      if (sceneRT) { sceneRT.depthTexture.dispose(); sceneRT.dispose(); }
      for (const d of disposables) d.dispose?.();
      renderer.dispose(); renderer.forceContextLoss?.(); canvas.remove();
    },
  };
}
