// GPU-lit height field. The object is a labelled 2D illustration, not a 3D scan.
const VERTEX=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const FRAGMENT=`precision highp float;
 varying vec2 uv;uniform sampler2D field;uniform sampler2D object;
 uniform vec2 resolution;uniform vec2 grid;uniform vec2 center;uniform vec2 objectSize;
 uniform vec2 pointer;uniform float angle;uniform float lens;uniform float seed;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+seed)*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 float terrain(vec2 p){float h=texture2D(field,p).r;vec2 q=(p-center)*resolution/objectSize;return h+.065*exp(-dot(q,q)*2.5)*smoothstep(.45,1.,h);}
 vec4 artifact(vec2 p){vec2 q=(p-center)*resolution;float c=cos(angle),s=sin(angle);q=mat2(c,-s,s,c)*q/objectSize+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0);return texture2D(object,q);}
 void main(){
  vec2 p=vec2(uv.x,1.-uv.y),pixel=p*resolution;
  float shortSide=min(resolution.x,resolution.y),distanceToPointer=length((p-pointer)*resolution);
  float magnify=lens*(1.-smoothstep(shortSide*.125,shortSide*.14,distanceToPointer));
  p=mix(p,pointer+(p-pointer)*.55,magnify);
  vec4 state=texture2D(field,p);float h=state.r;
  vec2 step=1./grid;
  vec3 normal=normalize(vec3((terrain(p-vec2(step.x,0))-terrain(p+vec2(step.x,0)))*5.,(terrain(p-vec2(0,step.y))-terrain(p+vec2(0,step.y)))*5.,.72));
  vec3 light=normalize(vec3(-.55+pointer.x*.35,-.8+pointer.y*.3,.85));
  float illumination=.53+.57*max(0.,dot(normal,light));
  float shadow=0.;
  for(int i=1;i<=6;i++){float k=float(i);float neighbor=terrain(p+light.xy*step*k*1.4);shadow=max(shadow,(neighbor-h-k*.055)*.65);}
  vec2 grainPoint=p*resolution;
  float grain=noise(grainPoint*.6),patch=noise(grainPoint*.017)*.6+noise(grainPoint*.047)*.4;
  vec3 soil=mix(vec3(.54,.38,.23),vec3(.30,.21,.145),smoothstep(.15,.95,h));
  soil*=.76+patch*.38+grain*.18;
  vec2 stoneGrid=grainPoint/23.,stoneCell=floor(stoneGrid),jitter=vec2(hash(stoneCell),hash(stoneCell+39.));
  vec2 stoneDelta=fract(stoneGrid)-(.23+jitter*.5);
  float radius=.08+hash(stoneCell+7.)*.12,stone=1.-smoothstep(radius*.65,radius,length(stoneDelta));
  float stoneLight=clamp(.7-dot(stoneDelta,light.xy)*3.,.25,1.2);
  soil=mix(soil,vec3(.45,.36,.26)*stoneLight,stone*smoothstep(.45,.85,h)*.7);
  float cutShade=clamp(1.-shadow,.45,1.);soil*=illumination*cutShade;
  vec4 art=artifact(p);float reveal=1.-smoothstep(.15,.33,h);
  float castShadow=artifact(p-vec2(.009,.012)).a*reveal*(1.-art.a);
  soil*=1.-castShadow*.48;
  vec3 artColor=art.rgb*(.79+.24*max(0.,light.z))*(1.-shadow*.28);
  artColor=mix(artColor,soil,state.g*.80);
  vec3 color=mix(soil,artColor,art.a*reveal);
  float edge=abs(distanceToPointer-shortSide*.138);
  color=mix(color,vec3(.91,.86,.67),lens*(1.-smoothstep(1.,2.5,edge))*.75);
  float vignette=1.-.24*pow(length((vec2(uv.x,1.-uv.y)-.5)*1.2),1.4);
  color*=vignette;
  gl_FragColor=vec4(color,1.);
 }`;
function shader(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
export function createTerrainRenderer(canvas,fallback,image,field){
 let gl,program,buffer,fieldTexture,imageTexture,vertex,fragment,locations={},lost=false,disposed=false,uploadedRevision=-1;
 try{
  gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
  if(!gl)throw new Error('WebGL unavailable');
  vertex=shader(gl,gl.VERTEX_SHADER,VERTEX);fragment=shader(gl,gl.FRAGMENT_SHADER,FRAGMENT);
  program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader link failed');gl.useProgram(program);
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  for(const name of ['field','object','resolution','grid','center','objectSize','pointer','angle','lens','seed'])locations[name]=gl.getUniformLocation(program,name);
  function texture(unit){const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return tex;}
  fieldTexture=texture(0);imageTexture=texture(1);
  const textureCanvas=document.createElement('canvas');textureCanvas.width=512;textureCanvas.height=512;
  const textureContext=textureCanvas.getContext('2d');textureContext.imageSmoothingQuality='high';textureContext.drawImage(image,0,0,512,512);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,textureCanvas);
  gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.uniform1i(locations.field,0);gl.uniform1i(locations.object,1);
 }catch(error){lost=true;canvas.dataset.rendererError=error.message;}
 const ctx=fallback.getContext('2d'),mask=document.createElement('canvas'),mctx=mask.getContext('2d');
 function fallbackDraw(state){
  canvas.hidden=true;fallback.hidden=false;fallback.width=Math.round(field.width);fallback.height=Math.round(field.height);
  const w=field.width,h=field.height,t=field.target;ctx.fillStyle='#9b7548';ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(t.x*w,t.y*h);ctx.rotate(t.angle);ctx.shadowColor='#201407aa';ctx.shadowOffsetX=7;ctx.shadowOffsetY=12;ctx.shadowBlur=12;ctx.drawImage(image,-t.width/2,-t.height/2,t.width,t.height);ctx.restore();
  mask.width=field.cols;mask.height=field.rows;const data=mctx.createImageData(field.cols,field.rows);
  for(let i=0;i<field.depth.length;i++){
   const depth=field.depth[i],dust=field.dust[i],x=i%field.cols,y=Math.floor(i/field.cols);
   const dx=field.depth[Math.max(0,i-1)]-field.depth[Math.min(field.depth.length-1,i+1)],dy=field.depth[Math.max(0,i-field.cols)]-field.depth[Math.min(field.depth.length-1,i+field.cols)];
   const shade=Math.max(.45,Math.min(1.25,.88-dx*1.8-dy*2)),grain=((Math.sin(x*127.1+y*311.7)*43758.5453)%1)*12;
   const n=i*4;data.data[n]=(153-depth*67+grain)*shade;data.data[n+1]=(111-depth*53+grain)*shade;data.data[n+2]=(69-depth*30+grain)*shade;
   data.data[n+3]=Math.round((depth>.32?1:Math.max(depth/.32,dust*.8))*255);
  }
  mctx.putImageData(data,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(mask,0,0,w,h);
  if(state.tool==='lens'){ctx.strokeStyle='#e4d9b8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(state.pointer.x*w,state.pointer.y*h,Math.min(w,h)*.14,0,Math.PI*2);ctx.stroke();}
 }
 function draw(state){
  if(disposed)return;
  if(lost){fallbackDraw(state);return;}
  const {target:t}=field,pixelRatio=Math.min(devicePixelRatio||1,1.35,Math.sqrt(900000/(field.width*field.height)));
  const w=Math.round(field.width*pixelRatio),h=Math.round(field.height*pixelRatio);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);gl.useProgram(program);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fieldTexture);
  if(uploadedRevision!==field.revision){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,field.cols,field.rows,0,gl.RGBA,gl.UNSIGNED_BYTE,field.pixels);uploadedRevision=field.revision;}
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,imageTexture);
  gl.uniform2f(locations.resolution,field.width,field.height);gl.uniform2f(locations.grid,field.cols,field.rows);
  gl.uniform2f(locations.center,t.x,t.y);gl.uniform2f(locations.objectSize,t.width,t.height);gl.uniform1f(locations.angle,t.angle);
  gl.uniform2f(locations.pointer,state.pointer.x,state.pointer.y);gl.uniform1f(locations.lens,state.tool==='lens'?1:0);gl.uniform1f(locations.seed,state.seed);
  gl.drawArrays(gl.TRIANGLES,0,6);
 }
 function contextLost(event){event.preventDefault();lost=true;draw({pointer:{x:.4,y:.3},tool:'hand',seed:1});}
 canvas.addEventListener('webglcontextlost',contextLost);
 return {kind:lost?'canvas':'webgl',draw,resize:()=>{},destroy(){disposed=true;canvas.removeEventListener('webglcontextlost',contextLost);if(gl&&!gl.isContextLost()){gl.deleteTexture(fieldTexture);gl.deleteTexture(imageTexture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);}}};
}
