import { escapeHTML as e } from './model.js';
import { icon } from './icons.js';
import { stampOutline } from './stamp-shape.js';
import { appURL } from './app-paths.js';

const INK='#173f36', PAPER='#faf6e9';
const STORY_LABELS={
 vi:{tag:'A LITTLE CULTURE. A LOT TO SHARE.',lead:'đi rồi, kể thôi.',count:'TEM ĐÃ CHECK-IN',status:'Mỗi điểm đến, một dấu riêng.',full:'Đã gom đủ bộ. Khoe Óc Eo thôi!',owner:'CHUYẾN ĐI CỦA',place:'XÃ ÓC EO, AN GIANG',section:'NHỮNG NƠI MÌNH ĐÃ CHẠM',emptySection:'MỘT CHUYẾN ĐI ĐANG CHỜ',empty1:'Tem đầu tiên',empty2:'chờ bạn ở Óc Eo.',empty3:'Check-in tại điểm đến để nhận tem.',empty4:'Rồi kể câu chuyện của bạn cho cả nhóm.',meet:'HẸN NHAU Ở ÓC EO ↗',single:'Lưu một dấu. Kể một chuyến đi.',footer:'Chạm di sản. Chia sẻ Óc Eo.',micro:'BỘ SƯU TẬP CÁ NHÂN · GOM TEM, KHOE ÓC EO.',checked:'ĐÃ CHECK-IN',unit:'TEM'},
 en:{tag:'A LITTLE CULTURE. A LOT TO SHARE.',lead:'walk. share. repeat.',count:'STAMPS COLLECTED',status:'Every stop, your own story.',full:'Full set. Share Óc Eo!',owner:'THIS WALK BELONGS TO',place:'ÓC EO, AN GIANG',section:'PLACES I CHECKED IN',emptySection:'YOUR WALK STARTS HERE',empty1:'Your first stamp',empty2:'is waiting in Óc Eo.',empty3:'Check in at a destination to earn it.',empty4:'Then share your story with your friends.',meet:'MEET YOU IN ÓC EO ↗',single:'One stamp. A story to share.',footer:'Meet heritage. Share Óc Eo.',micro:'PERSONAL COLLECTION · COLLECT AND SHARE ÓC EO.',checked:'CHECKED IN',unit:'STAMPS'},
 zh:{tag:'一点文化，很多值得分享的故事。',lead:'去过，就分享。',count:'已收集印章',status:'每一站，都有你的故事。',full:'已集齐，分享Óc Eo吧！',owner:'本次旅程属于',place:'安江省Óc Eo社',section:'我已签到的地方',emptySection:'一段旅程，正等着你',empty1:'第一枚印章',empty2:'在Óc Eo等你。',empty3:'到达目的地，签到后领取印章。',empty4:'再把你的故事分享给朋友们。',meet:'Óc Eo见 ↗',single:'留一枚印章，讲一段旅程。',footer:'感受遗产，分享Óc Eo。',micro:'个人印章集 · 收藏与分享Óc Eo。',checked:'已签到',unit:'枚印章'}
};

const COLORS=['#d6ed86','#c8bdf2','#ffae91','#93c8eb','#f3d474'];
const SITE_COLORS={'chua-linh-son':COLORS[0],'go-sau-thuan':COLORS[1],
  'linh-son-bac':COLORS[2],'linh-son-nam':COLORS[3]};
export function stampColor(p){
  let hash=0;for(const char of p.id)hash=(hash*31+char.charCodeAt(0))>>>0;
  return SITE_COLORS[p.id] || COLORS[hash%COLORS.length];
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
function lines(value,max){
  const words=String(value).trim().split(/\s+/).flatMap(word=>{const chars=Array.from(word);const parts=[];while(chars.length)parts.push(chars.splice(0,max).join(''));return parts;});
  const rows=[];for(const word of words){if(rows.length&&rows.at(-1).length+word.length+1<=max)rows[rows.length-1]+=' '+word;else rows.push(word);}return rows;
}
function flower(x,y,size,color=INK,rotation=0){return `<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${size/40})" fill="${color}"><path d="M20 20C-6 19 8-4 20 20Zm0 0C21-6 44 8 20 20Zm0 0C46 21 32 44 20 20Zm0 0C19 46-4 32 20 20Z"/><circle cx="20" cy="20" r="4"/></g>`;}
function stampMarkup(p,i,collection,{x,y,w,h},labels){
  const outline=stampOutline(w,h);
  const id=`cut-${i}`,angle=[-3.5,3,2,-2.5][i%4],color=stampColor(p);
  const compact=h<270;
  let glyphSize=compact?(h<230?47:64):88;
  const fullRows=lines(p.name.toLocaleUpperCase('vi-VN'),w>350?23:17);
  const rows=fullRows.slice(0,3);
  if(fullRows.length>3)rows[2]=rows[2].slice(0,-1)+'…';
  if(compact && rows.length>2)glyphSize=32;
  const nameSize=rows.length>2?(compact?20:24):(w>350?30:25);
  const number=String(collection.findIndex(s=>s.id===p.id)+1).padStart(2,'0');
  const top=compact?32:42;
  const nameY=(compact?h-29:h-58)-(rows.length-1)*(nameSize+5);
  const text=rows.map((line,j)=>`<text x="${w/2}" y="${nameY+j*(nameSize+5)}" font-size="${Math.min(nameSize,(w-45)/(line.length*.61))}" font-weight="800" text-anchor="middle">${e(line)}</text>`).join('');
  const glyph=icon(p.symbol).replace('width="24" height="24"',`width="${glyphSize}" height="${glyphSize}"`).replace('stroke="currentColor"',`stroke="${INK}"`);
  return `<defs><path id="${id}" d="${outline}"/><clipPath id="ink-${i}"><use href="#${id}"/></clipPath></defs><g data-earned-stamp="${e(p.id)}" transform="translate(${x} ${y}) rotate(${angle} ${w/2} ${h/2})"><use href="#${id}" transform="translate(4 6)" fill="#173f3614"/><use href="#${id}" fill="${color}"/><g clip-path="url(#ink-${i})"><text x="32" y="${top}" font-size="${compact?12:14}" letter-spacing="2">ÓC EO / ${number}</text><g transform="translate(${w-58} 28)"><circle cx="14" cy="14" r="14" fill="${INK}"/><path d="m7 14 5 5 10-11" fill="none" stroke="${PAPER}" stroke-width="2.5"/></g><g transform="translate(${(w-glyphSize)/2} ${compact?40:63})">${glyph}</g>${text}${compact?"":`<text x="${w/2}" y="${h-27}" font-size="14" letter-spacing="2" text-anchor="middle">${labels.checked}</text>`}</g></g>`;
}

/** Dynamic 9:16 story art. Only earned destinations are passed to stampMarkup. */
export function buildPassSVG({collection,earned,name,date,fontCSS='',locale='vi'}){
  const S=STORY_LABELS[locale]||STORY_LABELS.vi;
  const count=earned.length,total=collection.length,compact=count>6;
  const cols=count>6?3:2,rows=Math.max(1,Math.ceil(count/cols));
  const gridTop=compact?658:914,cellW=compact?290:420,gap=compact?28:46;
  const cellH=compact?Math.max(174,Math.min(265,Math.floor(1000/rows)-22)):count>4?230:294;
  const height=Math.max(1920,gridTop+rows*cellH+(rows-1)*25+16+255);
  const progressY=compact?326:485,nameY=compact?484:670;
  const defs=`<defs><style>${fontCSS}</style><pattern id="paper-lines" width="38" height="38" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#173f3611"/></pattern></defs>`;
  const landscape=`<g transform="translate(${compact?755:682} ${compact?120:260}) rotate(7)"><rect x="6" y="9" width="${compact?240:310}" height="${compact?160:188}" rx="3" fill="#173f3615"/><rect width="${compact?240:310}" height="${compact?160:188}" fill="#fffdf5"/><svg x="10" y="10" width="${compact?220:290}" height="${compact?116:144}" viewBox="0 0 300 145"><rect width="300" height="145" fill="#b9dcec"/><circle cx="238" cy="35" r="19" fill="#f5d96b"/><path d="M-10 110 42 88 94 28 116 45 140 37 187 87 227 100 312 110V160H-10Z" fill="#839d65"/><path d="M-5 126Q80 108 157 131T310 121V160H-5Z" fill="#d6ed86"/><path d="M-10 141Q70 118 136 143M62 145l66-28m45 28 60-23m-43-4 40 29" stroke="#55764d" fill="none" stroke-width="2"/></svg><text x="17" y="${compact?145:177}" font-size="13" letter-spacing="1">BA THÊ / ÓC EO</text><path d="m${compact?89:120} -9h64l-3 25h-62Z" fill="#c8bdf2" opacity=".9"/></g>`;
  const header=`<g font-family="'Be Vietnam',TownwalkSC,Arial,sans-serif" font-weight="500" fill="${INK}"><text x="73" y="${compact?64:88}" font-size="20" font-weight="800" letter-spacing="4">ÓC EO PASS</text><text x="73" y="${compact?92:120}" font-size="13" letter-spacing="3">${e(S.tag)}</text>${flower(928,57,64,INK,12)}<text x="61" y="${compact?250:330}" font-size="${compact?150:196}" font-weight="800" letter-spacing="-12">ÓC EO</text><text x="75" y="${compact?300:445}" font-family="Lora,TownwalkSC,Georgia,serif" font-style="italic" font-size="${compact?(locale==='en'?38:50):(locale==='en'?64:locale==='zh'?70:85)}">${e(S.lead)}</text>${landscape}<path d="M78 ${compact?312:466}q180 13 401-6" fill="none" stroke="#5670d9" stroke-width="6" stroke-linecap="round"/>`;
  const progress=`<rect x="65" y="${progressY}" width="950" height="${compact?130:155}" rx="27" fill="${INK}"/><text x="96" y="${progressY+(compact?96:114)}" fill="#d6ed86" font-size="${total>99?82:101}" font-weight="800" letter-spacing="-5">${count}<tspan font-size="59" fill="${PAPER}"> / ${total}</tspan></text><text x="455" y="${progressY+53}" fill="${PAPER}" font-size="21" font-weight="800" letter-spacing="2">${e(S.count)}</text><text x="455" y="${progressY+91}" fill="#d6ed86" font-size="19">${e(count===total&&total>0?S.full:S.status)}</text>${flower(915,progressY+92,49,'#d6ed86',-10)}`;
  const nameLines=lines(name,34),nameSize=name.length>34?(compact?24:29):(compact?32:38);
  const ticket=`<g transform="translate(75 ${nameY})"><rect width="930" height="${compact?127:164}" rx="9" fill="#fffdf5"/><path d="M0 0h930" stroke="#a1afa0" stroke-dasharray="8 7"/><circle cx="0" cy="${compact?64:82}" r="16" fill="${PAPER}"/><circle cx="930" cy="${compact?64:82}" r="16" fill="${PAPER}"/><text x="27" y="30" font-size="12" letter-spacing="3">${e(S.owner)}</text>${nameLines.map((line,j)=>`<text x="27" y="${(compact?60:68)+j*(nameSize+7)}" font-size="${nameSize}" font-weight="800">${e(line)}</text>`).join('')}<text x="27" y="${compact?115:148}" font-size="13" letter-spacing="1">${e(date)} · ${e(S.place)}</text><g transform="translate(798 31) rotate(9)"><rect width="105" height="64" rx="9" fill="#ffae91"/><text x="52" y="27" text-anchor="middle" font-size="15" font-weight="800">MY</text><text x="52" y="49" text-anchor="middle" font-size="15" font-weight="800">TOWNWALK</text></g></g>`;
  const earnedArt=earned.map((p,i)=>{
    const row=Math.floor(i/cols),rowLength=Math.min(cols,count-row*cols);
    const rowW=rowLength*cellW+(rowLength-1)*gap;
    return stampMarkup(p,i,collection,{x:(1080-rowW)/2+(i%cols)*(cellW+gap),y:gridTop+row*(cellH+25),w:cellW,h:cellH},S);
  }).join('');
  const empty=`<g transform="translate(76 932)"><rect width="928" height="570" rx="38" fill="#c8bdf2"/><text x="45" y="113" font-size="57" font-weight="800">${e(S.empty1)}</text><text x="45" y="187" font-size="57" font-weight="800">${e(S.empty2)}</text><text x="45" y="268" font-size="25">${e(S.empty3)}</text><text x="45" y="311" font-size="25">${e(S.empty4)}</text>${flower(660,349,162,'#173f36',-12)}<g transform="translate(45 405) rotate(-4)"><rect width="510" height="84" rx="42" fill="#d6ed86"/><text x="255" y="54" font-size="27" font-weight="800" text-anchor="middle">${e(S.meet)}</text></g></g>`;
  const afterSingle=count>0&&rows===1?`<text x="85" y="${gridTop+cellH+126}" font-family="Lora,TownwalkSC,Georgia,serif" font-style="italic" font-size="45">${e(S.single)}</text>${flower(879,gridTop+cellH+65,84,'#ff957a',12)}`:'';
  const footer=`<path d="M75 ${height-235}h930" stroke="#173f36" stroke-width="2"/><text x="75" y="${height-168}" font-size="38" font-weight="800" letter-spacing="-1">${e(S.footer)}</text><rect x="75" y="${height-126}" width="650" height="52" rx="26" fill="#d6ed86"/><text x="101" y="${height-91}" font-size="20" font-weight="800">#OcEoTownwalk  #ChamOcEo</text><text x="75" y="${height-38}" font-size="13" letter-spacing="1">${e(S.micro)}</text><text x="1007" y="${height-39}" text-anchor="end" font-size="13">${count}/${total} ${S.unit}</text></g>`;
  return {width:1080,height,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}" role="img" aria-label="${e(locale==='en'?`${name} collected ${count}/${total} Óc Eo Pass stamps`:locale==='zh'?`${name}已收集${count}/${total}枚Óc Eo Pass印章`:`${name} đã đạt ${count}/${total} tem Óc Eo Pass`)}">${defs}<rect width="1080" height="${height}" fill="${PAPER}"/><rect width="1080" height="${height}" fill="url(#paper-lines)"/>${header}${progress}${ticket}<g font-family="'Be Vietnam',TownwalkSC,Arial,sans-serif" fill="${INK}"><text x="76" y="${gridTop-36}" font-size="20" font-weight="800" letter-spacing="3">${e(count?S.section:S.emptySection)}</text></g>${earnedArt||empty}${afterSingle}${footer}</svg>`};
}
export async function passArtwork(options){return buildPassSVG({...options,fontCSS:await embeddedFonts()});}
