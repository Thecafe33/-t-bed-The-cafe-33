import {escapeHTML as e} from './model.js';
import {stampOutline} from './stamp-shape.js';
import {heritageGraphic,heritageSymbol} from './heritage-symbols.js';

export const POSTER_INK='#171714',POSTER_PAPER='#f4eedc';
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
function ticketEdge(w,h){
 const points=[];for(let x=0;x<=w;x+=12)points.push([x,(Math.round(x/12)%2)*6]);
 for(let y=0;y<=h;y+=12)points.push([w-(Math.round(y/12)%2)*6,y]);
 for(let x=w;x>=0;x-=12)points.push([x,h-(Math.round((w-x)/12)%2)*6]);
 for(let y=h;y>=0;y-=12)points.push([(Math.round((h-y)/12)%2)*6,y]);
 return 'M'+points.map(p=>p.join(' ')).join('L')+'Z';
}
function stamp(place,i,collection,{x,y,w,h,images,locale}){
 const symbol=heritageSymbol(place),ink=POSTER_INK;
 const paper=['#ff49a5','#e9f429','#b9ed30','#83d9e2','#bea8f1'][i%5];
 const outline=stampOutline(w,h),id=`cut-${i}`,angle=[-3,2,-1.5,3][i%4];
 const number=String(collection.findIndex(p=>p.id===place.id)+1).padStart(2,'0');
 const rows=wrap(place.name.toLocaleUpperCase('vi-VN'),20).slice(0,3),fs=rows.length>2?17:21;
 const nameY=h-22-(rows.length-1)*(fs+3),artY=34,artH=Math.max(40,nameY-artY-fs-36);
 const caption=symbol.label[localeIndex(locale)];
 return `<defs><path id="${id}" d="${outline}"/><clipPath id="clip-${i}"><use href="#${id}"/></clipPath></defs><g data-earned-stamp="${e(place.id)}" data-symbol="${symbol.key}" data-symbol-relation="${symbol.relation}" transform="translate(${x} ${y}) rotate(${angle} ${w/2} ${h/2})" color="${ink}"><use href="#${id}" transform="translate(3 4)" fill="#203d3420"/><use href="#${id}" fill="${paper}" stroke="#203d342f"/><g clip-path="url(#clip-${i})" fill="${ink}"><rect width="${w}" height="${h}" fill="url(#stamp-grain)"/><text x="22" y="26" font-size="11" font-weight="800" letter-spacing="1.5">ÓC EO</text><text x="${w-23}" y="26" text-anchor="end" font-size="11" letter-spacing="1">${number}</text>${heritageGraphic(symbol.key,{x:34,y:artY,w:w-68,h:artH,images})}<text data-stamp-caption="" x="${w/2}" y="${nameY-fs-16}" font-size="${Math.min(9.5,(w-40)/(Array.from(caption).length*.58))}" letter-spacing=".5" text-anchor="middle">${e(caption)}</text>${rows.map((line,j)=>`<text data-stamp-name="" x="${w/2}" y="${nameY+j*(fs+3)}" font-size="${Math.min(fs,(w-44)/(Array.from(line).length*.63))}" font-weight="800" text-anchor="middle">${e(line)}</text>`).join('')}</g></g>`;
}
/** The large illustration is editorial branding; only earned stops become stamps. */
export function buildHeritagePoster({collection,earned,name,date,locale='vi',fontCSS='',images={}}){
 const S=copy[locale]||copy.vi,count=earned.length,total=collection.length;
 const cols=count>6?3:count>1?2:1,rows=Math.max(1,Math.ceil(count/cols));
 const cellW=cols===3?290:cols===2?425:540,gap=28,dense=count>12,top=dense?625:715;
 const cellH=rows>=5?202:rows===4?239:rows===3?309:rows===2?420:620;
 const height=Math.max(1920,top+rows*cellH+(rows-1)*22+175),footerY=height-125;
 const defs=`<defs><style>${fontCSS}</style><pattern id="stamp-grain" width="13" height="17" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".65" fill="#203d341b"/><circle cx="10" cy="12" r=".45" fill="#203d3420"/></pattern><pattern id="cover-grain" width="7" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".55" fill="#fbf8ef18"/></pattern></defs>`;
 const nameRows=wrap(name,27).slice(0,3),nameBase=nameRows.length>2?510:nameRows.length>1?525:558,nameSize=nameRows.length>1?26:Math.min(72,495/(Math.max(4,Array.from(name).length)*.65));
 const hero=`<rect width="1080" height="590" fill="#83d9e2"/><rect width="1080" height="590" fill="url(#stamp-grain)"/><g transform="translate(40 35) rotate(-3 500 130)"><path d="${ticketEdge(995,265)}" fill="#ff49a5" stroke="${POSTER_INK}" stroke-width="5"/><text x="35" y="55" font-size="22" font-weight="800" letter-spacing="5">TOWNWALK / ${e(date)}</text><text x="24" y="224" font-size="156" font-weight="800" letter-spacing="-10">ÓC EO PASS</text></g><g transform="translate(570 286) rotate(6 210 135)"><path d="${ticketEdge(450,275)}" fill="#e9f429" stroke="${POSTER_INK}" stroke-width="3"/>${heritageGraphic('ring',{x:116,y:13,w:230,h:223,images})}<text x="225" y="251" text-anchor="middle" font-size="13" font-weight="800" letter-spacing="2">NANDIN / ÓC EO</text></g><g transform="translate(55 337) rotate(-2 245 105)"><path d="M0 0H485V73a22 22 0 0 0 0 44v93H0v-93a22 22 0 0 0 0-44Z" fill="#b9ed30" stroke="${POSTER_INK}" stroke-width="3"/><path d="M385 12v186" stroke="${POSTER_INK}" stroke-dasharray="5 6"/><text data-owner-label="" x="27" y="39" font-size="12" letter-spacing="2">${e(S.owner)}</text>${nameRows.map((line,j)=>`<text data-owner-name="" x="25" y="${nameRows.length>1?85+j*34:119}" font-size="${nameRows.length>1?Math.min(27,335/(Math.max(...nameRows.map(r=>Array.from(r).length))*.65)):Math.min(65,335/(Math.max(4,Array.from(name).length)*.65))}" font-weight="800">${e(line)}</text>`).join('')}<text x="27" y="184" font-size="13" font-weight="800">${e(S.date)}</text><text transform="translate(438 185) rotate(-90)" font-size="21" font-weight="800">${count} / ${total}</text></g>`;
 const progress=`<path d="M64 671h952" stroke="${POSTER_INK}" stroke-width="1.5"/><text data-poster-progress="" x="61" y="650" font-size="68" font-weight="800" letter-spacing="-4">${count}<tspan font-size="36" font-weight="500" letter-spacing="-2"> / ${total}</tspan></text><text x="310" y="613" font-size="17" font-weight="800" letter-spacing="1.5">${e(S.count)}</text><text x="310" y="641" font-size="15">${e(count===total&&total>0?S.full:S.lead)}</text><text x="64" y="697" font-size="12" font-weight="800" letter-spacing="2">${e(S.section)}</text>`;
 const stamps=earned.map((p,i)=>{const row=Math.floor(i/cols),length=Math.min(cols,count-row*cols),rowW=length*cellW+(length-1)*gap;return stamp(p,i,collection,{x:(1080-rowW)/2+(i%cols)*(cellW+gap),y:top+row*(cellH+22),w:cellW,h:cellH,images,locale});}).join('');
 const empty=`<path d="${stampOutline(900,620)}" transform="translate(90 810)" fill="#e1c697"/><text x="540" y="1050" text-anchor="middle" font-size="40" font-weight="800">${e(S.empty)}</text><text x="540" y="1120" text-anchor="middle" font-size="24">${e(S.hint)}</text><text x="540" y="1260" text-anchor="middle" font-size="42" font-family="Lora,TownwalkSC,Georgia,serif" font-style="italic">Óc Eo is calling.</text>`;
 const footer=`<path d="M64 ${footerY-35}h952" stroke="#203d3460"/><text x="64" y="${footerY+10}" font-size="31" font-weight="800" letter-spacing="-1">${e(S.footer)}</text><text x="64" y="${footerY+46}" font-size="14" letter-spacing="1">#OcEoTownwalk  #ChamOcEo</text><text x="1016" y="${footerY+10}" text-anchor="end" font-size="16" font-weight="800">${count}/${total} ${e(S.unit)}</text><text x="64" y="${height-28}" font-size="9" letter-spacing="1">${e(S.personal)} · ${e(S.art)}</text>`;
 const aria=locale==='en'?`${name} collected ${count}/${total} Óc Eo Pass stamps`:locale==='zh'?`${name}已收集${count}/${total}枚Óc Eo Pass印章`:`${name} đã đạt ${count}/${total} tem Óc Eo Pass`;
 return {width:1080,height,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}" role="img" aria-label="${e(aria)}">${defs}<rect width="1080" height="${height}" fill="${POSTER_PAPER}"/><g fill="${POSTER_INK}" font-family="'Be Vietnam',TownwalkSC,Arial,sans-serif" font-weight="500">${dense?`<rect width="1080" height="500" fill="${POSTER_INK}"/><g transform="translate(82.37 0) scale(.8474576)">${hero}</g><g transform="translate(0 -90)">${progress}</g>`:hero+progress}${stamps||empty}${footer}</g></svg>`};
}
