import {escapeHTML as e} from './model.js';
import {stampOutline} from './stamp-shape.js';
import {heritageGraphic,heritageSymbol} from './heritage-symbols.js';

export const POSTER_INK='#351b27',POSTER_PAPER='#f3ead5';
const copy={
 vi:{owner:'CHUYẾN ĐI CỦA',count:'ĐỊA ĐIỂM ĐÃ CHECK-IN',section:'MỖI ĐIỂM ĐẾN. MỘT DẤU RIÊNG.',footer:'Chạm di sản. Chia sẻ Óc Eo.',full:'Đã gom đủ bộ. Khoe Óc Eo thôi!',empty:'Tem đầu tiên đang chờ bạn.',hint:'Đến điểm, check-in rồi kể câu chuyện của bạn.',art:'MINH HOẠ CẢM HỨNG HIỆN VẬT ÓC EO',personal:'BỘ SƯU TẬP CÁ NHÂN',date:'ÓC EO · AN GIANG',unit:'TEM',lead:'đi rồi, kể thôi.'},
 en:{owner:'THIS WALK BELONGS TO',count:'DESTINATIONS CHECKED IN',section:'EVERY STOP. A DIFFERENT IMPRESSION.',footer:'Meet heritage. Share Óc Eo.',full:'Full set. Share Óc Eo!',empty:'Your first stamp is waiting.',hint:'Check in at a destination. Share your story.',art:'ILLUSTRATIONS INSPIRED BY ÓC EO OBJECTS',personal:'PERSONAL COLLECTION',date:'ÓC EO · AN GIANG',unit:'STAMPS',lead:'walk. share. repeat.'},
 zh:{owner:'本次旅程属于',count:'已签到的地点',section:'每一站，都有自己的印记。',footer:'感受遗产，分享Óc Eo。',full:'已集齐，分享Óc Eo吧！',empty:'第一枚印章，正等着你。',hint:'到达目的地，签到，再分享你的故事。',art:'以Óc Eo文物为灵感的插画',personal:'个人印章集',date:'ÓC EO · 安江省',unit:'枚印章',lead:'去过，就分享。'}
};
const localeIndex=locale=>({vi:0,en:1,zh:2}[locale]||0);
function wrap(value,max){
 const tokens=String(value).trim().split(/\s+/).flatMap(word=>Array.from(word).reduce((a,c,i)=>{if(i%max===0)a.push('');a[a.length-1]+=c;return a;},[]));
 const rows=[];for(const word of tokens){if(rows.length&&Array.from(rows.at(-1)).length+Array.from(word).length+1<=max)rows[rows.length-1]+=' '+word;else rows.push(word);}return rows;
}
function stamp(place,i,collection,{x,y,w,h,images,locale}){
 const symbol=heritageSymbol(place),dark=i%5===2,ink=dark?'#f3ead5':POSTER_INK;
 const paper=dark?'#35473f':i%5===4?'#debd80':POSTER_PAPER;
 const outline=stampOutline(w,h),id=`cut-${i}`,angle=[-2,1.4,-.7,1.8][i%4];
 const number=String(collection.findIndex(p=>p.id===place.id)+1).padStart(2,'0');
 const rows=wrap(place.name.toLocaleUpperCase('vi-VN'),20).slice(0,3),fs=rows.length>2?17:21;
 const nameY=h-22-(rows.length-1)*(fs+3),artY=34,artH=Math.max(40,nameY-artY-fs-36);
 const caption=symbol.label[localeIndex(locale)];
 return `<defs><path id="${id}" d="${outline}"/><clipPath id="clip-${i}"><use href="#${id}"/></clipPath></defs><g data-earned-stamp="${e(place.id)}" data-symbol="${symbol.key}" data-symbol-relation="${symbol.relation}" transform="translate(${x} ${y}) rotate(${angle} ${w/2} ${h/2})" color="${ink}"><use href="#${id}" transform="translate(3 4)" fill="#351b2720"/><use href="#${id}" fill="${paper}" stroke="#351b272f"/><g clip-path="url(#clip-${i})" fill="${ink}"><rect width="${w}" height="${h}" fill="url(#stamp-grain)"/><text x="22" y="26" font-size="11" font-weight="800" letter-spacing="1.5">ÓC EO</text><text x="${w-23}" y="26" text-anchor="end" font-size="11" letter-spacing="1">${number}</text>${heritageGraphic(symbol.key,{x:34,y:artY,w:w-68,h:artH,images})}<text data-stamp-caption="" x="${w/2}" y="${nameY-fs-16}" font-size="${Math.min(9.5,(w-40)/(Array.from(caption).length*.58))}" letter-spacing=".5" text-anchor="middle">${e(caption)}</text>${rows.map((line,j)=>`<text data-stamp-name="" x="${w/2}" y="${nameY+j*(fs+3)}" font-size="${Math.min(fs,(w-44)/(Array.from(line).length*.63))}" font-weight="800" text-anchor="middle">${e(line)}</text>`).join('')}</g></g>`;
}
/** The large illustration is editorial branding; only earned stops become stamps. */
export function buildHeritagePoster({collection,earned,name,date,locale='vi',fontCSS='',images={}}){
 const S=copy[locale]||copy.vi,count=earned.length,total=collection.length;
 const cols=count>6?3:count>1?2:1,rows=Math.max(1,Math.ceil(count/cols));
 const cellW=cols===3?290:cols===2?425:540,gap=28,dense=count>12,top=dense?625:715;
 const cellH=rows>=5?202:rows===4?239:rows===3?309:rows===2?420:620;
 const height=Math.max(1920,top+rows*cellH+(rows-1)*22+175),footerY=height-125;
 const defs=`<defs><style>${fontCSS}</style><pattern id="stamp-grain" width="13" height="17" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".65" fill="#351b271b"/><circle cx="10" cy="12" r=".45" fill="#351b2720"/></pattern><pattern id="cover-grain" width="7" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".55" fill="#f3ead518"/></pattern></defs>`;
 const nameRows=wrap(name,27).slice(0,3),nameBase=nameRows.length>2?510:nameRows.length>1?525:558,nameSize=nameRows.length>1?26:Math.min(72,495/(Math.max(4,Array.from(name).length)*.65));
 const hero=`<rect width="1080" height="590" fill="${POSTER_INK}"/><rect width="1080" height="590" fill="url(#cover-grain)"/><path d="M64 102h952" stroke="#f3ead549"/><text x="65" y="75" font-size="25" font-weight="800" letter-spacing="4" fill="${POSTER_PAPER}">ÓC EO PASS</text><text x="1015" y="74" font-size="13" letter-spacing="2" text-anchor="end" fill="#d4b57b">TOWNWALK / ${e(date)}</text><g fill="${POSTER_PAPER}" font-weight="800" letter-spacing="-12"><text x="49" y="269" font-size="182">ÓC</text><text x="57" y="427" font-size="182">EO.</text></g><text x="370" y="401" transform="rotate(-90 370 401)" font-size="15" letter-spacing="3" fill="#d4b57b">${e(S.date)}</text><g transform="rotate(7 814 337)" color="#d4b57b">${heritageGraphic('ring',{x:530,y:116,w:496,h:433,images})}</g><text data-owner-label="" x="65" y="477" fill="#d4b57b" font-size="12" letter-spacing="2">${e(S.owner)}</text>${nameRows.map((line,j)=>`<text data-owner-name="" x="62" y="${nameBase+j*(nameSize+3)}" font-family="Lora,TownwalkSC,Georgia,serif" font-style="italic" font-size="${nameSize}" fill="${POSTER_PAPER}">${e(line)}</text>`).join('')}<text x="1017" y="568" fill="#d4b57b" text-anchor="end" font-size="10" letter-spacing="1">NANDIN / ÓC EO</text>`;
 const progress=`<path d="M64 671h952" stroke="${POSTER_INK}" stroke-width="1.5"/><text data-poster-progress="" x="61" y="650" font-size="68" font-weight="800" letter-spacing="-4">${count}<tspan font-size="36" font-weight="500" letter-spacing="-2"> / ${total}</tspan></text><text x="310" y="613" font-size="17" font-weight="800" letter-spacing="1.5">${e(S.count)}</text><text x="310" y="641" font-size="15">${e(count===total&&total>0?S.full:S.lead)}</text><text x="64" y="697" font-size="12" font-weight="800" letter-spacing="2">${e(S.section)}</text>`;
 const stamps=earned.map((p,i)=>{const row=Math.floor(i/cols),length=Math.min(cols,count-row*cols),rowW=length*cellW+(length-1)*gap;return stamp(p,i,collection,{x:(1080-rowW)/2+(i%cols)*(cellW+gap),y:top+row*(cellH+22),w:cellW,h:cellH,images,locale});}).join('');
 const empty=`<path d="${stampOutline(900,620)}" transform="translate(90 810)" fill="#e1c697"/><text x="540" y="1050" text-anchor="middle" font-size="40" font-weight="800">${e(S.empty)}</text><text x="540" y="1120" text-anchor="middle" font-size="24">${e(S.hint)}</text><text x="540" y="1260" text-anchor="middle" font-size="42" font-family="Lora,TownwalkSC,Georgia,serif" font-style="italic">Óc Eo is calling.</text>`;
 const footer=`<path d="M64 ${footerY-35}h952" stroke="#351b2760"/><text x="64" y="${footerY+10}" font-size="31" font-weight="800" letter-spacing="-1">${e(S.footer)}</text><text x="64" y="${footerY+46}" font-size="14" letter-spacing="1">#OcEoTownwalk  #ChamOcEo</text><text x="1016" y="${footerY+10}" text-anchor="end" font-size="16" font-weight="800">${count}/${total} ${e(S.unit)}</text><text x="64" y="${height-28}" font-size="9" letter-spacing="1">${e(S.personal)} · ${e(S.art)}</text>`;
 const aria=locale==='en'?`${name} collected ${count}/${total} Óc Eo Pass stamps`:locale==='zh'?`${name}已收集${count}/${total}枚Óc Eo Pass印章`:`${name} đã đạt ${count}/${total} tem Óc Eo Pass`;
 return {width:1080,height,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}" role="img" aria-label="${e(aria)}">${defs}<rect width="1080" height="${height}" fill="${POSTER_PAPER}"/><g fill="${POSTER_INK}" font-family="'Be Vietnam',TownwalkSC,Arial,sans-serif" font-weight="500">${dense?`<rect width="1080" height="500" fill="${POSTER_INK}"/><g transform="translate(82.37 0) scale(.8474576)">${hero}</g><g transform="translate(0 -90)">${progress}</g>`:hero+progress}${stamps||empty}${footer}</g></svg>`};
}
