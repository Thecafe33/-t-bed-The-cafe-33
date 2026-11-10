// GPU-lit excavation trench with a movable camera. Objects are 2D illustrations.
import { ATLAS_GRID } from './excavation-art.js';
import { CELLS_PER_METER } from './excavation-field.js';

export const MAX_FINDS = 12, MAX_BEADS = 6;
const VERTEX = `attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const FRAGMENT = `precision highp float;
varying vec2 uv;
uniform sampler2D field;uniform sampler2D atlas;
uniform vec2 resolution;uniform vec2 grid;uniform vec2 worldSize;
uniform vec2 camera;uniform float scale;uniform vec2 pointer;uniform float lens;uniform float seed;
uniform vec4 findBox[${MAX_FINDS}];uniform vec4 findSlot[${MAX_FINDS}];uniform vec4 beads[${MAX_BEADS}];
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+seed)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
vec4 state(vec2 w){return texture2D(field,clamp(w/worldSize,vec2(0.),vec2(1.)));}
float height(vec2 w){return state(w).r;}
vec4 artifact(vec2 w){
 vec4 best=vec4(0.);
 for(int i=0;i<${MAX_FINDS};i++){
  vec4 box=findBox[i];vec4 slot=findSlot[i];
  if(slot.w<.5)continue;
  vec2 d=w-box.xy;if(dot(d,d)>box.z*box.z)continue;
  float c=cos(box.w),s=sin(box.w);vec2 q=mat2(c,-s,s,c)*d/box.z+.5;
  if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)continue;
  vec4 col=texture2D(atlas,(slot.xy+q)/${ATLAS_GRID}.);
  if(col.a>best.a)best=col;
 }
 return best;
}
void main(){
 vec2 screen=vec2(uv.x,1.-uv.y)*resolution;
 float shortSide=min(resolution.x,resolution.y),toPointer=length(screen-pointer);
 float magnify=lens*(1.-smoothstep(shortSide*.16,shortSide*.175,toPointer));
 screen=mix(screen,pointer+(screen-pointer)*.5,magnify);
 vec2 w=camera+screen/scale;
 vec2 px=w*90.;
 vec3 color;
 bool inside=w.x>=0.&&w.y>=0.&&w.x<=worldSize.x&&w.y<=worldSize.y;
 if(!inside){
  // Grass and a packed-earth lip around the trench.
  float edge=max(max(-w.x,w.x-worldSize.x),max(-w.y,w.y-worldSize.y));
  // Soft sage lawn with tiny clover dots and a pale sand path around the trench.
  float n=noise(px*.05);
  vec3 grass=mix(vec3(.80,.87,.69),vec3(.75,.83,.63),n);
  vec2 dotCell=fract(w*3.)-.5;float clover=1.-smoothstep(.05,.07,length(dotCell+vec2(hash(floor(w*3.))-.5)*.5));
  grass=mix(grass,vec3(.66,.77,.55),clover*.6);
  vec3 lip=vec3(.95,.89,.76);
  color=mix(lip,grass,smoothstep(.18,.22,edge));
  color*=1.-.12*(1.-smoothstep(0.,.06,edge));
 }else{
  vec4 st=state(w);float h=st.r;
  vec2 cellStep=1./grid,m=cellStep*worldSize*1.6;
  float hl=height(w-vec2(m.x,0.)),hr=height(w+vec2(m.x,0.)),hu=height(w-vec2(0.,m.y)),hd=height(w+vec2(0.,m.y));
  // Pebbles and clods give the surface relief that reacts to light.
  vec2 stoneGrid=w*7.,stoneCell=floor(stoneGrid),jitter=vec2(hash(stoneCell),hash(stoneCell+39.));
  vec2 stoneDelta=fract(stoneGrid)-(.25+jitter*.5);
  float stoneR=.07+hash(stoneCell+7.)*.13,stone=(1.-smoothstep(stoneR*.55,stoneR,length(stoneDelta)))*step(.45,hash(stoneCell+3.));
  vec3 normal=normalize(vec3((hl-hr)*6.-stoneDelta.x*stone*1.6,(hu-hd)*6.-stoneDelta.y*stone*1.6,.62));
  // The light leans toward the finger, so freshly cut walls catch and lose the sun as you work.
  vec2 lp=pointer/resolution;
  vec3 light=normalize(vec3(-.55+lp.x*.35,-.8+lp.y*.3,.85));
  float diffuse=max(0.,dot(normal,light));
  float shade=.6+.5*diffuse;
  float shadow=0.;
  for(int i=1;i<=6;i++){float k=float(i);shadow=max(shadow,(height(w+light.xy*m*k*1.6)-h-k*.035)*.9);}
  // Cavity darkening at the foot of a cut, a bright crumbly lip at its rim.
  float around=(hl+hr+hu+hd)*.25,cavity=clamp((around-h)*6.,0.,.35),rim=clamp((h-around)*8.,0.,.4);
  float n=noise(px*.45),patch=noise(px*.03)*.6+noise(px*.09)*.4;
  vec3 topsoil=mix(vec3(.80,.66,.50),vec3(.88,.75,.59),patch);
  vec3 culture=mix(vec3(.55,.40,.33),vec3(.66,.49,.40),patch);
  vec3 clay=mix(vec3(.95,.80,.53),vec3(1.,.88,.64),patch);
  vec3 soil=mix(clay,culture,smoothstep(.14,.36,h));soil=mix(soil,topsoil,smoothstep(.56,.7,h));
  soil*=.9+n*.16;
  soil=mix(soil,soil*vec3(.86,.82,.8),stone*.55);
  // Grass flecks on the untouched surface; sherds and charcoal in the culture layer.
  float fleck=step(.985,hash(floor(px*1.1)));
  soil=mix(soil,vec3(.96,.9,.78),fleck*smoothstep(.85,1.,h)*.6);
  float sherd=step(.992,hash(floor(px*.55)+3.));float charcoal=step(.99,hash(floor(px*.8)+9.));
  float cultureBand=smoothstep(.3,.42,h)*(1.-smoothstep(.56,.66,h));
  soil=mix(soil,vec3(.93,.58,.44),sherd*cultureBand*.85);soil=mix(soil,vec3(.36,.28,.26),charcoal*cultureBand*.55);
  soil*=shade*clamp(1.-shadow,.48,1.)*(1.-cavity);
  soil=mix(soil,vec3(1.,.95,.84),rim*.5);
  color=soil;
  // Objects only matter once the ground above them is nearly gone.
  if(h<.34){
   vec4 art=artifact(w);float reveal=1.-smoothstep(.15,.33,h);
   float castShade=artifact(w-vec2(.035,.045)).a*reveal*(1.-art.a);
   soil*=1.-castShade*.45;
   vec3 artColor=art.rgb*(.82+.28*diffuse)*(1.-shadow*.25);
   float scratch=st.a*step(.55,fract((w.x+w.y*1.7)*60.+hash(floor(w*20.))));
   artColor=mix(artColor,vec3(.86,.82,.72),scratch*.8);
   artColor=mix(artColor,soil*1.05,st.g*.8);
   color=mix(soil,artColor,art.a*reveal);
  }
  // Glass beads glint in the culture layer, much clearer under the magnifier.
  if(h<.62&&h>.3)for(int i=0;i<${MAX_BEADS};i++){
   vec4 b=beads[i];if(b.w<.5)continue;
   float d=length(w-b.xy)/b.z;if(d>1.)continue;
   float g=step(.965-magnify*.05,hash(floor(w*70.)+float(i)*7.))*(1.-d)*(1.-smoothstep(.5,.62,h))*step(.34,h);
   vec3 tint=mix(vec3(.3,.8,.75),vec3(.95,.45,.3),hash(floor(w*70.)+1.));
   color=mix(color,tint,g*(.55+magnify*.45));
  }
 }
 float ring=abs(toPointer-shortSide*.168);
 color=mix(color,vec3(.85,.95,.48),lens*(1.-smoothstep(2.,4.,ring)));
 gl_FragColor=vec4(color,1.);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

export function createExcavationRenderer(canvas, fallback, art, field) {
  let gl, program, buffer, fieldTexture, atlasTexture, shaders = [], locations = {}, lost = false, disposed = false, uploaded = -1;
  const big = field.finds.map((f, i) => ({ f, i })).filter(({ f }) => !f.small).slice(0, MAX_FINDS);
  const small = field.finds.filter(f => f.small).slice(0, MAX_BEADS);
  try {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    if (!gl) throw new Error('WebGL unavailable');
    shaders = [compile(gl, gl.VERTEX_SHADER, VERTEX), compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)];
    program = gl.createProgram(); shaders.forEach(s => gl.attachShader(program, s)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader link failed');
    gl.useProgram(program);
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    for (const name of ['field', 'atlas', 'resolution', 'grid', 'worldSize', 'camera', 'scale', 'pointer', 'lens', 'seed', 'findBox', 'findSlot', 'beads']) locations[name] = gl.getUniformLocation(program, name);
    const texture = unit => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); return t; };
    fieldTexture = texture(0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, field.cols, field.rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, field.pixels); uploaded = field.revision;
    atlasTexture = texture(1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, art.atlas);
    gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.uniform1i(locations.field, 0); gl.uniform1i(locations.atlas, 1);
    const box = new Float32Array(MAX_FINDS * 4), slot = new Float32Array(MAX_FINDS * 4), beads = new Float32Array(MAX_BEADS * 4);
    big.forEach(({ f, i }, k) => { box.set([f.x, f.y, f.size, f.angle], k * 4); slot.set([art.slots[i][0], art.slots[i][1], 0, 1], k * 4); });
    small.forEach((f, k) => beads.set([f.x, f.y, 0.34, 1], k * 4));
    gl.uniform4fv(locations.findBox, box); gl.uniform4fv(locations.findSlot, slot); gl.uniform4fv(locations.beads, beads);
    gl.uniform2f(locations.grid, field.cols, field.rows); gl.uniform2f(locations.worldSize, field.widthM, field.heightM);
  } catch (error) { lost = true; canvas.dataset.rendererError = error.message; }

  // CPU fallback: same camera, flatter lighting.
  const ctx = fallback.getContext('2d'), soil = document.createElement('canvas'), sctx = soil.getContext('2d');
  soil.width = field.cols; soil.height = field.rows;
  let soilRevision = -1;
  function fallbackDraw(view) {
    canvas.hidden = true; fallback.hidden = false;
    const dpr = Math.min(devicePixelRatio || 1, 2), W = view.width, H = view.height;
    if (fallback.width !== Math.round(W * dpr) || fallback.height !== Math.round(H * dpr)) { fallback.width = Math.round(W * dpr); fallback.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#cfdcb2'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.scale(view.scale, view.scale); ctx.translate(-view.camera.x, -view.camera.y);
    ctx.fillStyle = '#fbe2a6'; ctx.fillRect(0, 0, field.widthM, field.heightM);
    big.forEach(({ f, i }) => {
      const [sx, sy] = art.slots[i], size = art.atlas.width / ATLAS_GRID;
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.angle);
      ctx.drawImage(art.atlas, sx * size, sy * size, size, size, -f.size / 2, -f.size / 2, f.size, f.size); ctx.restore();
    });
    if (soilRevision !== field.revision) {
      const data = sctx.createImageData(field.cols, field.rows);
      for (let i = 0; i < field.depth.length; i++) {
        const h = field.depth[i], x = i % field.cols, y = (i / field.cols) | 0, n = i * 4;
        const grain = ((Math.sin(x * 12.9 + y * 78.2) * 43758.5) % 1) * 14;
        const top = h > 0.6, mid = h > 0.3;
        data.data[n] = (top ? 216 : mid ? 165 : 250) + grain * 0.4; data.data[n + 1] = (top ? 186 : mid ? 124 : 222) + grain * 0.4; data.data[n + 2] = (top ? 146 : mid ? 104 : 160) + grain * 0.4;
        data.data[n + 3] = Math.round((h > 0.32 ? 1 : field.owner[i] ? Math.max(h / 0.32, field.dust[i] * 0.75) : 1) * 255);
      }
      sctx.putImageData(data, 0, 0); soilRevision = field.revision;
    }
    ctx.imageSmoothingEnabled = true; ctx.drawImage(soil, 0, 0, field.widthM, field.heightM);
    ctx.restore();
    if (view.lens) { ctx.strokeStyle = '#efe4c2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(view.pointer.x, view.pointer.y, Math.min(W, H) * 0.168, 0, Math.PI * 2); ctx.stroke(); }
  }
  function draw(view) {
    if (disposed) return;
    if (lost) { fallbackDraw(view); return; }
    const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(900000 / (view.width * view.height)));
    const w = Math.round(view.width * ratio), h = Math.round(view.height * ratio);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h); gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
    if (uploaded !== field.revision) { gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, field.cols, field.rows, gl.RGBA, gl.UNSIGNED_BYTE, field.pixels); uploaded = field.revision; }
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.uniform2f(locations.resolution, view.width, view.height);
    gl.uniform2f(locations.camera, view.camera.x, view.camera.y); gl.uniform1f(locations.scale, view.scale);
    gl.uniform2f(locations.pointer, view.pointer.x, view.pointer.y); gl.uniform1f(locations.lens, view.lens ? 1 : 0); gl.uniform1f(locations.seed, view.seed);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function contextLost(event) { event.preventDefault(); lost = true; }
  canvas.addEventListener('webglcontextlost', contextLost);
  return {
    kind: lost ? 'canvas' : 'webgl', draw,
    destroy() {
      disposed = true; canvas.removeEventListener('webglcontextlost', contextLost);
      if (gl && !gl.isContextLost()) { gl.deleteTexture(fieldTexture); gl.deleteTexture(atlasTexture); gl.deleteBuffer(buffer); gl.deleteProgram(program); shaders.forEach(s => gl.deleteShader(s)); }
    },
  };
}
export { CELLS_PER_METER };
