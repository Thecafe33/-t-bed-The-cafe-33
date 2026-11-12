// Postage-stamp artwork shared by the in-app stamp desk, the Pass book and every PNG export.
// Fine perforations on white paper, a printed colour panel and one of four layouts chosen
// by what the stop is about (a find, a display, an architectural trace or a landscape).
import {escapeHTML as e} from './model.js';
import {heritageGraphic,heritageSymbol} from './heritage-symbols.js';

export const STAMP_INK='#1d2a24',STAMP_PAPER='#fffdf7';
// [panel, deep, backing wash, text on panel]; tones follow the envelope reference.
export const STAMP_PALETTE={
 blue:['#4a90dc','#2c6cbd','#9fcdf2','#fff'],olive:['#9ba658','#717c34','#c9d38f','#fff'],orange:['#f3a43d','#d07a12','#fcd08a',STAMP_INK],
 pink:['#f3a9b6','#d9707f','#fbd3d8',STAMP_INK],sage:['#c8d67e','#97a84a','#e4ecb5',STAMP_INK],clay:['#c9744c','#9c4f2c','#eab28f','#fff'],lilac:['#8b6cf0','#6447d6','#c9bbff','#fff'],
};
const ORDER=['olive','blue','lilac','pink','orange','sage','clay'];
export const STAMP_SIZE={header:[260,330],frame:[250,320],land:[340,250],serif:[256,336]};
const LAYOUT={find:'header',display:'frame',architecture:'serif',landscape:'land',typography:'land'};
const FAMILY={header:['Bảo vật','Treasure','珍宝'],frame:['Trưng bày','Collection','展藏'],serif:['Kiến trúc','Architecture','建筑'],land:['Cảnh quan','Landscape','景观']};
const at=locale=>({vi:0,en:1,zh:2}[locale]||0);

/** Layout, colour and number are stable per stop, so a stamp looks the same everywhere. */
export function stampSpec(place,collection=[],locale='vi'){
 const symbol=heritageSymbol(place),index=Math.max(0,collection.findIndex(p=>p.id===place.id));
 const layout=LAYOUT[symbol.relation]||'land';
 return {symbol,layout,color:ORDER[index%ORDER.length],number:String(index+1).padStart(2,'0'),
  caption:symbol.relation==='typography'?['Óc Eo · Ba Thê','Óc Eo · Ba Thê','Óc Eo · Ba Thê'][at(locale)]:symbol.label[at(locale)],
  family:FAMILY[layout][at(locale)]};
}
export const stampFamily=(place,locale='vi')=>stampSpec(place,[],locale).family;

/** Classic fine perforation: small round bites spaced evenly along every edge. */
export function perforation(w,h,r=5.2){
 const step=r*2.9,nx=Math.max(3,Math.round(w/step)),ny=Math.max(3,Math.round(h/step)),sx=w/nx,sy=h/ny,f=v=>+v.toFixed(2),A=(x,y)=>`A${r} ${r} 0 0 0 ${f(x)} ${f(y)}`,P=['M0 0'];
 for(let i=0;i<nx;i++){const c=sx*(i+.5);P.push(`L${f(c-r)} 0`,A(c+r,0));}P.push(`L${w} 0`);
 for(let i=0;i<ny;i++){const c=sy*(i+.5);P.push(`L${w} ${f(c-r)}`,A(w,c+r));}P.push(`L${w} ${h}`);
 for(let i=nx-1;i>=0;i--){const c=sx*(i+.5);P.push(`L${f(c+r)} ${h}`,A(c-r,h));}P.push(`L0 ${h}`);
 for(let i=ny-1;i>=0;i--){const c=sy*(i+.5);P.push(`L0 ${f(c+r)}`,A(0,c-r));}
 return P.join(' ')+'Z';
}
const spark=(x,y,s,c)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0-10C1-3 3-1 10 0 3 1 1 3 0 10-1 3-3 1-10 0-3-1-1-3 0-10Z" fill="${c}"/>`;
const bow=(x,y,s,c,flip=1)=>`<path transform="translate(${x} ${y}) scale(${s*flip} ${s})" d="M0 0c-8-10-20-6-14 2 4 5 12 1 14-2zm0 0c4 8 2 18-4 22M0 0c10-4 20 2 18 8" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`;
const fit=(text,width,max,ratio=.6)=>Math.max(9,Math.min(max,width/(Math.max(4,Array.from(text).length)*ratio)));
const SERIF="Lora,TownwalkSC,Georgia,serif";

function art(key,x,y,w,h,images,localImages){
 return `<circle cx="${x+w/2}" cy="${y+h/2}" r="${Math.min(w,h)*.42}" fill="#fff" opacity=".35"/><g color="${STAMP_INK}">${heritageGraphic(key,{x,y,w,h,images,localImages})}</g>`;
}
function body(place,spec,W,H,uid,{images,localImages}){
 const [bg,,,fg]=STAMP_PALETTE[spec.color],m=14,iw=W-2*m,ih=H-2*m,name=e(place.name),cap=e(spec.caption),key=spec.symbol.key,n=spec.number;
 const panel=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${uid}-grain)"/>`;
 if(spec.layout==='header'){const hh=ih*.3;return `<rect x="${m}" y="${m}" width="${iw}" height="${hh}" fill="${STAMP_PAPER}"/>
  <text data-stamp-name="" x="${m+16}" y="${m+40}" font-size="${fit(place.name,iw-112,23)}" font-weight="800" fill="${STAMP_INK}">${name}</text>
  <text data-stamp-caption="" x="${m+16}" y="${m+62}" font-size="${fit(spec.caption,iw-112,11,.62)}" font-weight="800" letter-spacing="1" fill="#6b6b60">${cap}</text>
  <rect x="${m+16}" y="${m+74}" width="${iw*.5}" height="3" rx="1.5" fill="#e3e0d4"/>
  <text x="${W-m-14}" y="${m+52}" text-anchor="end" font-size="44" font-weight="800" letter-spacing="-2" fill="${STAMP_INK}">${n}</text>
  ${panel(m,m+hh,iw,ih-hh)}${art(key,m+iw*.17,m+hh+16,iw*.66,ih-hh-30,images,localImages)}${spark(m+22,m+hh+22,.9,'#ffe27a')}${spark(W-m-22,H-m-22,.9,'#ffe27a')}${bow(m+20,H-m-34,.9,STAMP_PAPER)}${bow(W-m-20,m+hh+20,.9,STAMP_PAPER,-1)}`;}
 if(spec.layout==='frame')return `${panel(m,m,iw,ih)}<rect x="${m+10}" y="${m+10}" width="${iw-20}" height="${ih-20}" fill="none" stroke="${STAMP_PAPER}" stroke-width="1.6" opacity=".85"/>
  ${art(key,m+30,m+58,iw-60,ih-130,images,localImages)}
  <text x="${W-m-22}" y="${m+52}" text-anchor="end" font-size="38" font-family="${SERIF}" font-style="italic" fill="${fg}">${n}</text>
  <text transform="translate(${m+30} ${m+40}) rotate(90)" font-size="10" letter-spacing="3" font-weight="800" fill="${fg}">ÓC EO PASS · AN GIANG</text>
  <text data-stamp-name="" x="${m+24}" y="${H-m-40}" font-size="${fit(place.name,iw-48,20)}" font-weight="800" fill="${fg}">${name}</text>
  <text data-stamp-caption="" x="${m+24}" y="${H-m-22}" font-size="${fit(spec.caption,iw-48,10,.66)}" font-weight="800" letter-spacing="1" fill="${fg}">${cap}</text>`;
 if(spec.layout==='land'){const col=m+iw*.58,cw=W-m-14-col;return `${panel(m,m,iw,ih)}
  ${art(key,m+14,m+14,iw*.52,ih-28,images,localImages)}<rect x="${col-12}" y="${m+18}" width="1.6" height="${ih-36}" fill="${fg}" opacity=".4"/>
  <text x="${W-m-16}" y="${m+62}" text-anchor="end" font-size="54" font-weight="800" letter-spacing="-3" fill="${fg}">${n}</text>
  <text x="${W-m-16}" y="${m+80}" text-anchor="end" font-size="9" letter-spacing="2" font-weight="800" fill="${fg}">ÓC EO PASS</text>
  <text data-stamp-name="" x="${col}" y="${H-m-48}" font-size="${fit(place.name,cw,20)}" font-weight="800" fill="${fg}">${name}</text>
  <text data-stamp-caption="" x="${col}" y="${H-m-30}" font-size="${fit(spec.caption,cw,10,.66)}" font-weight="800" letter-spacing=".5" fill="${fg}">${cap}</text>${spark(W-m-24,H-m-22,.8,STAMP_PAPER)}`;}
 return `${panel(m,m,iw,ih)}<rect x="${m+10}" y="${m+10}" width="${iw-20}" height="${ih-20}" fill="none" stroke="${STAMP_PAPER}" stroke-width="1.4" opacity=".7"/>
  <text data-stamp-name="" x="${W/2}" y="${m+48}" text-anchor="middle" font-size="${fit(place.name,iw-40,25,.55)}" font-family="${SERIF}" font-style="italic" fill="${fg}">${name}</text>
  <line x1="${m+10}" x2="${W-m-10}" y1="${m+66}" y2="${m+66}" stroke="${STAMP_PAPER}" stroke-width="1.4" opacity=".7"/>
  ${art(key,m+40,m+78,iw-80,ih-166,images,localImages)}${spark(m+30,m+92,.7,'#fff3b0')}${spark(W-m-30,m+92,.7,'#fff3b0')}
  <line x1="${m+10}" x2="${W-m-10}" y1="${H-m-74}" y2="${H-m-74}" stroke="${STAMP_PAPER}" stroke-width="1.4" opacity=".7"/><line x1="${W/2+20}" x2="${W/2+20}" y1="${H-m-64}" y2="${H-m-18}" stroke="${STAMP_PAPER}" stroke-width="1.4" opacity=".7"/>
  <text data-stamp-caption="" x="${m+22}" y="${H-m-46}" font-size="${fit(spec.caption,W/2-m-14,10,.66)}" font-weight="800" letter-spacing=".5" fill="${fg}">${cap}</text><text x="${m+22}" y="${H-m-30}" font-size="9" fill="${fg}">Óc Eo · An Giang</text>
  <text x="${(W/2+20+W-m)/2}" y="${H-m-26}" text-anchor="middle" font-size="40" font-weight="800" font-family="${SERIF}" fill="${fg}">${n}</text>`;
}
let serial=0;
/**
 * One stamp as a standalone <svg>. `back` adds the soft watercolour card behind it,
 * `mark` a check-in postmark with `date`. Size follows the layout; `width` scales it.
 */
export function stampSVG(place,{collection=[],locale='vi',back=true,mark=false,date='',images={},localImages=false,x,y,width,id,attrs=''}={}){
 const spec=stampSpec(place,collection,locale),[W,H]=STAMP_SIZE[spec.layout],B=back?18:5,[,,wash]=STAMP_PALETTE[spec.color];
 const uid=id||`st${++serial}`,outline=perforation(W,H),scale=width?width/(W+2*B):1;
 const postmark=mark?`<g transform="translate(${spec.layout==='land'?66:W-42} ${spec.layout==='land'?H*.32:H*.6}) rotate(-12)" opacity=".78" fill="none" stroke="${STAMP_INK}"><circle r="40" stroke-width="2.4"/><circle r="31" stroke-width="1.2"/><text text-anchor="middle" y="-7" font-size="9" letter-spacing="1.5" font-weight="800" fill="${STAMP_INK}" stroke="none">ÓC EO</text><text text-anchor="middle" y="8" font-size="${date.length>8?10:date?12:16}" font-weight="800" fill="${STAMP_INK}" stroke="none">${e(date||"✓")}</text><text text-anchor="middle" y="21" font-size="7" letter-spacing="1.5" font-weight="800" fill="${STAMP_INK}" stroke="none">CHECK-IN</text><path d="M-40 -48q12-7 24 0t24 0t24 0t24 0M-40 -36q12-7 24 0t24 0t24 0t24 0" stroke-width="2"/></g>`:'';
 const box=`${x!=null?`x="${x}" y="${y}" `:''}width="${(W+2*B)*scale}" height="${(H+2*B)*scale}"`;
 return `<svg ${box} viewBox="${-B} ${-B} ${W+2*B} ${H+2*B}" xmlns="http://www.w3.org/2000/svg" data-layout="${spec.layout}" ${attrs}><defs>
 <pattern id="${uid}-grain" width="11" height="13" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".7" fill="${STAMP_INK}" opacity=".12"/><circle cx="8" cy="9" r=".5" fill="#fff" opacity=".25"/></pattern>
 <radialGradient id="${uid}-wash" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="${STAMP_PAPER}"/><stop offset="1" stop-color="${wash}"/></radialGradient>
 <clipPath id="${uid}-cut"><path d="${outline}"/></clipPath></defs>
 ${back?`<path d="M${-B+5} ${-B+2}Q${W/2} ${-B-2} ${W+B-4} ${-B+4}Q${W+B+1} ${H/2} ${W+B-3} ${H+B-5}Q${W/2} ${H+B+2} ${-B+3} ${H+B-3}Q${-B-2} ${H/2} ${-B+5} ${-B+2}Z" fill="url(#${uid}-wash)"/>`:''}
 <path d="${outline}" fill="${STAMP_PAPER}" ${back?'':'stroke="#1d2a2414"'}/><g clip-path="url(#${uid}-cut)">${body(place,spec,W,H,uid,{images,localImages})}</g>${postmark}</svg>`;
}
/** An unearned stop: dashed perforation and its name, never artwork it has not earned. */
export function ghostStampSVG(place,{width=120}={}){
 const [W,H]=STAMP_SIZE.frame,s=width/(W+8);
 return `<svg width="${width}" height="${(H+8)*s}" viewBox="-4 -4 ${W+8} ${H+8}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="${perforation(W,H)}" fill="#1d2a2408" stroke="#1d2a2440" stroke-width="2" stroke-dasharray="5 6"/><text x="${W/2}" y="${H/2+10}" text-anchor="middle" font-size="64" font-weight="800" fill="#1d2a241f">?</text><text x="${W/2}" y="${H-34}" text-anchor="middle" font-size="${fit(place.name,W-30,18)}" font-weight="800" fill="#1d2a2470">${e(place.name)}</text></svg>`;
}

// Desk geometry in units of the desk width, shared by the drag desk and the "letter" export.
export const DESK_STAMP_WIDTH={portrait:.46,land:.58};
const jitter=(id,salt)=>{let h=salt;for(const c of id)h=(h*33+c.charCodeAt(0))>>>0;return (h%1000)/1000;};
/** Stable overlapping scatter, overridden per stop by any arrangement the visitor saved. */
export function deskLayout(places,saved={}){
 const n=places.length,height=Math.max(.9,Math.min(1.8,.6+n*.09));
 const items=places.map((p,i)=>{
  const k=n<=3?1:n<=8?.86:.78,land=stampSpec(p).layout==='land',w=(land?DESK_STAMP_WIDTH.land:DESK_STAMP_WIDTH.portrait)*k,h=w*(land?.76:1.25);
  // A loose pile: golden-ratio spread across the width, drifting down the desk, tilted freely.
  const span=1-w+.08,x=((i*.618+jitter(p.id,7)*.5)%1)*span-.04;
  const y=n>1?((i*.7549+jitter(p.id,3)*.6)%1)*(height-h-.04)+.02:.06;
  const fallback={x,y,r:Math.round((jitter(p.id,11)-.5)*28),z:i+1};
  const s=saved[p.id],pos=s&&[s.x,s.y,s.r,s.z].every(Number.isFinite)?s:fallback;
  return {place:p,w,h,...pos,x:Math.min(1-w+.04,Math.max(-.04,pos.x))};
 });
 items.forEach(i=>{i.y=Math.min(height-i.h-.02,Math.max(.02,i.y));});
 return {items:items.sort((a,b)=>a.z-b.z),height};
}
