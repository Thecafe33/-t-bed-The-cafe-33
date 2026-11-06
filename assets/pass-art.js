import {appURL} from './app-paths.js';
import {buildHeritagePoster} from './pass-poster.js';
import {HERITAGE_IMAGES,heritageSymbol} from './heritage-symbols.js';
const COLORS=['#e6b85c','#b6d7cd','#e8c9ad','#c4c8a8','#ece2c7'];
export function stampColor(place){
 let hash=0;for(const char of place.id)hash=(hash*31+char.charCodeAt(0))>>>0;
 return COLORS[hash%COLORS.length];
}
let fontResources;
const toDataURL=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});
async function embeddedFonts(){
  if(!fontResources)fontResources=(async()=>{
    const stylesheet=appURL('assets/style.css');
    const css=await fetch(stylesheet).then(r=>{if(!r.ok)throw Error('font stylesheet');return r.text();});
    const faces=[...css.matchAll(/@font-face\s*\{[^}]+\}/g)].map(m=>m[0]).filter(f=>/font-family:\s*(Lora|TownwalkSC)/.test(f)||(/font-family:\s*Be Vietnam/.test(f)&&/font-weight:\s*(500|800);/.test(f)));
    return (await Promise.all(faces.map(async face=>{
      const path=face.match(/url\(([^)]+)\)/)?.[1];
      if(!path)return '';
      const fontURL=new URL(path,stylesheet), fonts=new URL(appURL('assets/fonts/'));
      if(fontURL.origin!==fonts.origin || !fontURL.pathname.startsWith(fonts.pathname))return '';
      const response=await fetch(fontURL);if(!response.ok)throw Error('font asset');
      return face.replace(path,await toDataURL(await response.blob()));
    }))).join('\n');
  })().catch(()=>{fontResources=null;return '';});
  return fontResources;
}

const imageResources=new Map();
async function embeddedImages(keys){
 const entries=await Promise.all([...new Set(keys)].filter(k=>HERITAGE_IMAGES[k]).map(async key=>{
  if(!imageResources.has(key))imageResources.set(key,fetch(appURL(HERITAGE_IMAGES[key])).then(r=>{if(!r.ok)throw Error('heritage art');return r.blob();}).then(toDataURL).catch(()=>{imageResources.delete(key);return '';}));
  return [key,await imageResources.get(key)];
 }));
 return Object.fromEntries(entries.filter(([,value])=>value));
}
export function buildPassSVG(options){return buildHeritagePoster(options);}
export async function passArtwork(options){
 const keys=['ring',...options.earned.map(p=>heritageSymbol(p).key)];
 const [fontCSS,images]=await Promise.all([embeddedFonts(),embeddedImages(keys)]);
 return buildPassSVG({...options,fontCSS,images});
}
