// Three ways to package an Óc Eo Pass as a 1080 × 1920 story image:
// "pass" (a collector's stamp album page; no seals or official-looking marks), "letter" (stamps spilling from an envelope) and "flight"
// (a boarding pass to the 1st–7th century). Only earned stops ever appear as stamps.
import {escapeHTML as e} from './model.js';
import {stampSVG,stampSpec,deskLayout,STAMP_INK,STAMP_PAPER} from './stamp-art.js';

export const POSTER_INK=STAMP_INK,POSTER_PAPER=STAMP_PAPER;
export const PACKAGES=['pass','letter','flight'];
const SERIF="Lora,TownwalkSC,Georgia,serif";
const copy={
 vi:{album:'ALBUM TEM SƯU TẦM',owner:'CHỦ PASS',footer:'Chạm di sản. Chia sẻ Óc Eo.',full:'Đã gom đủ bộ. Khoe Óc Eo thôi!',empty:'Tem đầu tiên đang chờ bạn.',hint:'Đến điểm, check-in rồi tem sẽ hiện ở đây.',unit:'TEM',
  letter:['Thư từ','Óc Eo.'],to:'Gửi Óc Eo,',from:'TỪ',stampHere:'DÁN TEM',flight:['Chuyến bay','về Óc Eo.'],boarding:'THẺ LÊN MÁY BAY',air:'ÓC EO AIR',now:'HÔM NAY',era:'THẾ KỶ I–VII',
  passenger:'HÀNH KHÁCH',gate:'CỔNG',day:'NGÀY',seat:'GHẾ',cls:'HẠNG',status:'TRẠNG THÁI',arrived:'Đã đến ✓',boardingSoon:'Sắp khởi hành',more:n=>`+${n} tem`,art:'MINH HOẠ CẢM HỨNG HIỆN VẬT ÓC EO · BỘ SƯU TẬP CÁ NHÂN'},
 en:{album:'STAMP ALBUM',owner:'PASS HOLDER',footer:'Meet heritage. Share Óc Eo.',full:'Full set. Share Óc Eo!',empty:'Your first stamp is waiting.',hint:'Check in at a stop and its stamp appears here.',unit:'STAMPS',
  letter:['Letters','from Óc Eo.'],to:'Dear Óc Eo,',from:'FROM',stampHere:'STAMP',flight:['A flight','to Óc Eo.'],boarding:'BOARDING PASS',air:'ÓC EO AIR',now:'TODAY',era:'1ST–7TH CENTURY',
  passenger:'PASSENGER',gate:'GATE',day:'DATE',seat:'SEAT',cls:'CLASS',status:'STATUS',arrived:'Arrived ✓',boardingSoon:'Boarding soon',more:n=>`+${n} stamps`,art:'ILLUSTRATIONS INSPIRED BY ÓC EO OBJECTS · PERSONAL COLLECTION'},
 zh:{album:'集邮册',owner:'持有人',footer:'感受遗产，分享Óc Eo。',full:'已集齐，分享Óc Eo吧！',empty:'第一枚印章，正等着你。',hint:'到达地点签到，印章就会出现在这里。',unit:'枚印章',
  letter:['来自','Óc Eo的信。'],to:'致Óc Eo：',from:'寄自',stampHere:'贴邮票',flight:['飞往','Óc Eo的航班。'],boarding:'登机牌',air:'ÓC EO AIR',now:'今天',era:'公元1–7世纪',
  passenger:'旅客',gate:'登机口',day:'日期',seat:'座位',cls:'舱位',status:'状态',arrived:'已到达 ✓',boardingSoon:'即将出发',more:n=>`+${n}枚`,art:'以Óc Eo文物为灵感的插画 · 个人收藏'},
};
const fitSize=(text,width,max,ratio=.6)=>Math.max(12,Math.min(max,width/(Math.max(3,Array.from(String(text)).length)*ratio)));
const upper=s=>String(s).toLocaleUpperCase('vi-VN');
function wrap(value,max){
 const rows=[];for(const word of String(value).trim().split(/\s+/)){if(rows.length&&Array.from(rows.at(-1)).length+Array.from(word).length+1<=max)rows[rows.length-1]+=' '+word;else rows.push(word);}return rows;
}
/** A painted backdrop when one is supplied, otherwise soft watercolour washes. */
function backdrop(images,id){
 if(images.backdrop)return `<image href="${e(images.backdrop)}" width="1080" height="1920" preserveAspectRatio="xMidYMid slice"/>`;
 const blob=(cx,cy,r,c)=>`<radialGradient id="${id}${c.slice(1)}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${c}" stop-opacity=".85"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
 const spots=[[.22,.18,.45,'#bfe0f7'],[.88,.38,.4,'#f9cfd6'],[.28,.74,.5,'#d4df9c'],[.86,.96,.45,'#f6c27a']];
 return `<defs>${spots.map(s=>blob(...s)).join('')}</defs><rect width="1080" height="1920" fill="#f3eedf"/>${spots.map(s=>`<rect width="1080" height="1920" fill="url(#${id}${s[3].slice(1)})"/>`).join('')}`;
}
function earnedStamp(place,ctx,{x,y,width,rotate=0,mark=false,back=true,hero=false}){
 const spec=stampSpec(place,ctx.collection,ctx.locale);
 return `<g ${hero?"data-hero-stamp":"data-earned-stamp"}="${e(place.id)}" data-symbol="${spec.symbol.key}" data-symbol-relation="${spec.symbol.relation}" transform="rotate(${rotate} ${x+width/2} ${y+width*.6})">${stampSVG(place,{collection:ctx.collection,locale:ctx.locale,images:ctx.images,mark,back,x,y,width,id:`p${ctx.n++}`})}</g>`;
}
/** A collector's album page: one numbered slot per stop, earned paper stamps in their own slot. */
function passPage(ctx,S){
 const {collection,earned,count,total,name}=ctx,cols=3,rows=Math.max(1,Math.ceil(total/cols)),top=330,area=1190,cw=328,ch=area/rows,left=(1080-cw*cols)/2;
 const owned=new Set(earned.map(p=>p.id));
 const slots=collection.map((p,i)=>{
  const cx=left+cw*(i%cols)+cw/2,cy=top+ch*Math.floor(i/cols)+ch/2,n=String(i+1).padStart(2,'0');
  const slot=`<rect x="${cx-cw/2+12}" y="${cy-ch/2+8}" width="${cw-24}" height="${ch-16}" rx="16" fill="#fffdf7" fill-opacity=".55" stroke="#1d2a2433" stroke-width="2.5" stroke-dasharray="9 9"/><text x="${cx}" y="${cy+16}" text-anchor="middle" font-size="44" font-weight="800" fill="#1d2a241f">${n}</text>`;
  if(!owned.has(p.id))return slot;
  const land=stampSpec(p,collection,ctx.locale).layout==='land',maxH=ch-14,width=Math.min(land?cw-24:cw-40,land?maxH/.8:maxH/1.27),height=land?width*.8:width*1.27;
  return slot+earnedStamp(p,ctx,{x:cx-width/2,y:cy-height/2,width,rotate:[-4,3,-2,5,-3,2][i%6],back:false});
 }).join('');
 const nameRows=wrap(name,22).slice(0,2),nameSize=nameRows.length>1?52:fitSize(name,640,74,.5);
 return `<rect width="1080" height="1920" fill="#f1ead8"/>${Array.from({length:40},(_,i)=>`<path d="M0 ${i*48+20}h1080" stroke="#1d2a24" stroke-opacity=".04" stroke-width="2"/>`).join('')}
 <rect x="40" y="40" width="1000" height="1840" rx="34" fill="none" stroke="#1d2a2430" stroke-width="3"/>
 <text x="84" y="112" font-size="22" font-weight="800" letter-spacing="6">${e(S.album)}</text>
 <text x="80" y="216" font-family="${SERIF}" font-style="italic" font-size="104">Óc Eo Pass</text>
 <text x="84" y="270" font-size="24" font-weight="800" letter-spacing="5">ÓC EO</text><text x="200" y="270" font-size="24" letter-spacing="5">TOWNWALK</text><text x="380" y="270" font-size="24" letter-spacing="3">· ${e(ctx.date)}</text>
 <text data-poster-progress="" x="996" y="212" text-anchor="end" font-size="96" font-weight="800" letter-spacing="-4">${String(count).padStart(2,'0')}<tspan font-size="36" font-weight="500" letter-spacing="0">/${total}</tspan></text>
 <text x="996" y="262" text-anchor="end" font-size="20" font-weight="800" letter-spacing="3">${e(count===total&&total>0?S.full:S.unit)}</text>
 ${slots}
 ${count?'':`<rect x="190" y="840" width="700" height="170" rx="30" fill="${POSTER_PAPER}"/><text x="540" y="915" text-anchor="middle" font-size="38" font-weight="800">${e(S.empty)}</text><text x="540" y="965" text-anchor="middle" font-size="22">${e(S.hint)}</text>`}
 <text data-owner-label="" x="84" y="1600" font-size="20" font-weight="800" letter-spacing="3" fill="#6b6b60">${e(S.owner)}</text>
 ${nameRows.map((r,j)=>`<text data-owner-name="" x="80" y="${(nameRows.length>1?1672:1698)+j*(nameSize+6)}" font-family="${SERIF}" font-style="italic" font-size="${nameSize}">${e(r)}</text>`).join('')}
 <text x="84" y="1800" font-size="30" font-weight="800">${e(S.footer)}</text><text x="84" y="1842" font-size="20" letter-spacing="1">#OcEoTownwalk  #ChamOcEo</text>`;
}
/** The visitor's desk arrangement, spread over a poster region at a size that suits the count. */
function pile(ctx,{x,y,w,h},max=320){
 const layout=deskLayout(ctx.earned,ctx.arrangement||{}),n=layout.items.length;if(!n)return '';
 const cols=Math.ceil(Math.sqrt(n*w/h)),rows=Math.ceil(n/cols),sw=Math.min(max,w/cols*1.3,h/rows*1.05/1.25);
 return layout.items.map(i=>{const land=i.place&&i.h<i.w,width=land?sw*1.26:sw,height=land?width*.76:width*1.25;
  const fx=Math.min(1,Math.max(0,(i.x+.04)/(1-i.w+.08))),fy=Math.min(1,Math.max(0,i.y/Math.max(.01,layout.height-i.h)));
  return earnedStamp(i.place,ctx,{x:x+fx*(w-width),y:y+fy*(h-height),width,rotate:i.r,mark:i.z===n});}).join('');
}
function letter(ctx,S){
 const {count,total,name}=ctx,stamps=pile(ctx,{x:40,y:860,w:1000,h:900});
 return `${backdrop(ctx.images,'lw')}
 <rect x="64" y="70" width="250" height="64" rx="32" fill="${POSTER_INK}"/><text x="189" y="112" text-anchor="middle" font-size="24" font-weight="800" letter-spacing="3" fill="#fff">ÓC EO PASS</text>
 <rect x="756" y="70" width="260" height="64" rx="32" fill="${POSTER_PAPER}"/><text data-poster-progress="" x="886" y="112" text-anchor="middle" font-size="26" font-weight="800" letter-spacing="2">${count} / ${total} ${e(S.unit)}</text>
 <text x="64" y="300" font-family="${SERIF}" font-style="italic" font-size="124">${e(S.letter[0])}</text><text x="64" y="430" font-family="${SERIF}" font-style="italic" font-size="124">${e(S.letter[1])}</text>
 <g transform="rotate(-3 540 760)"><rect x="100" y="500" width="880" height="540" rx="8" fill="#fbf7ec"/><path d="M100 500L540 790L980 500" fill="none" stroke="#1d2a2433" stroke-width="2.5"/>
  <rect x="820" y="540" width="118" height="146" rx="6" fill="none" stroke="#1d2a2440" stroke-width="3" stroke-dasharray="8 7"/><text x="879" y="620" text-anchor="middle" font-size="17" font-weight="800" fill="#1d2a2470">${e(S.stampHere)}</text>
  <text x="170" y="780" font-family="${SERIF}" font-style="italic" font-size="52">${e(S.to)}</text>
  <text data-owner-label="" x="172" y="836" font-size="22" font-weight="800" letter-spacing="2" fill="#6b6b60">${e(S.from)} · ${e(upper(name).slice(0,22))} · ${e(ctx.date)}</text></g>
 ${count?stamps:`<text x="540" y="1300" text-anchor="middle" font-size="40" font-weight="800">${e(S.empty)}</text><text x="540" y="1360" text-anchor="middle" font-size="24">${e(S.hint)}</text>`}
 <text data-owner-name="" x="64" y="1812" font-family="${SERIF}" font-style="italic" font-size="${fitSize(name,620,64,.5)}">${e(name)}</text>
 <text x="64" y="1862" font-size="24" font-weight="800">#OcEoTownwalk #ChamOcEo</text>
 <text x="1016" y="1862" text-anchor="end" font-size="20" font-weight="800">${e(S.footer)}</text>`;
}
function flight(ctx,S){
 const {earned,count,total,name}=ctx;
 const fam=new Map();for(const p of earned){const f=stampSpec(p,ctx.collection,ctx.locale).family;fam.set(f,(fam.get(f)||0)+1);}
 const cls=[...fam].sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
 const field=(x,y,label,value,attr='')=>`<text x="${x}" y="${y}" font-size="18" font-weight="800" letter-spacing="3" fill="#6b6b60">${e(label)}</text><text ${attr} x="${x}" y="${y+48}" font-size="${fitSize(value,270,42,.58)}" font-weight="800">${e(value)}</text>`;
 const bars=Array.from({length:58},(_,i)=>`<rect x="${120+i*9}" y="1060" width="${[3,2,5,2,4][i%5]}" height="120" fill="${POSTER_INK}"/>`).join('');
  return `${backdrop(ctx.images,'fw')}
 <text x="64" y="170" font-family="${SERIF}" font-style="italic" font-size="104">${e(S.flight[0])}</text><text x="64" y="280" font-family="${SERIF}" font-style="italic" font-size="104">${e(S.flight[1])}</text>
 <g transform="translate(0 -60) scale(1 1)"><rect x="70" y="420" width="940" height="790" rx="40" fill="${POSTER_PAPER}"/><path d="M70 460a40 40 0 0 1 40-40h860a40 40 0 0 1 40 40v66H70z" fill="#4a90dc"/>
  <text x="120" y="486" font-size="30" font-weight="800" letter-spacing="6" fill="#fff">${e(S.boarding)}</text><text x="960" y="486" text-anchor="end" font-size="26" font-weight="800" fill="#fff">${e(S.air)} ✈</text>
  <text x="120" y="700" font-size="150" font-weight="800" letter-spacing="-6">NAY</text><text x="122" y="740" font-size="24" font-weight="800" fill="#6b6b60">${e(S.now)} · ${e(ctx.year)}</text>
  <path d="M450 650h150" stroke="${POSTER_INK}" stroke-width="4" stroke-dasharray="4 12" stroke-linecap="round"/><path d="M600 634l20 16-20 16z" fill="${POSTER_INK}"/>
  <text x="960" y="700" text-anchor="end" font-size="150" font-weight="800" letter-spacing="-6" fill="#8b6cf0">OCE</text><text x="960" y="740" text-anchor="end" font-size="24" font-weight="800" fill="#6b6b60">${e(S.era)}</text>
  ${field(120,800,S.passenger,name,'data-owner-name=""')}${field(410,800,S.gate,'Ba Thê')}${field(700,800,S.day,ctx.short)}
  ${field(120,900,S.seat,`${String(count).padStart(2,'0')}/${total}`,'data-poster-progress=""')}${field(410,900,S.cls,cls)}${field(700,900,S.status,count?S.arrived:S.boardingSoon)}
  <path d="M100 1010h880" stroke="#1d2a2433" stroke-width="5" stroke-dasharray="10 10"/>${bars}
  <text data-owner-label="" x="960" y="1100" text-anchor="end" font-size="24" font-weight="800">#ChamOcEo</text><text x="960" y="1140" text-anchor="end" font-size="22">ÓC EO · TOWNWALK</text></g>
 ${pile(ctx,{x:40,y:1180,w:1000,h:700},300)}
 ${count?'':`<text x="540" y="1520" text-anchor="middle" font-size="40" font-weight="800">${e(S.empty)}</text>`}
`;
}
/** The full story image; `kind` picks the packaging, `images` holds embedded data URLs. */
export function buildPoster({kind='pass',collection,earned,name,date,locale='vi',fontCSS='',images={},arrangement={}}){
 const S=copy[locale]||copy.vi,count=earned.length,total=collection.length;
 const digits=String(date).match(/\d+/g)||[],year=digits.find(d=>d.length===4)||String(new Date().getFullYear());
 const short=digits.length>=3?`${digits[0].padStart(2,'0')}.${digits[1].padStart(2,'0')}.${year.slice(-2)}`:String(date);
 const ctx={collection,earned,count,total,name,date,short,year,locale,images,arrangement,n:0};
 const body=(kind==='letter'?letter:kind==='flight'?flight:passPage)(ctx,S);
 const aria=locale==='en'?`${name} collected ${count}/${total} Óc Eo Pass stamps`:locale==='zh'?`${name}已收集${count}/${total}枚Óc Eo Pass印章`:`${name} đã đạt ${count}/${total} tem Óc Eo Pass`;
 return {width:1080,height:1920,kind,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" role="img" aria-label="${e(aria)}" data-package="${kind}"><defs><style>${fontCSS}</style></defs><g fill="${POSTER_INK}" font-family="'Be Vietnam',TownwalkSC,Arial,sans-serif" font-weight="500">${body}<text x="540" y="1900" text-anchor="middle" font-size="11" letter-spacing="1" opacity=".6">${e(S.art)}</text></g></svg>`};
}
export const buildHeritagePoster=buildPoster;
