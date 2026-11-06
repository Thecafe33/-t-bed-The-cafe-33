import {escapeHTML as e} from './model.js';
import {appURL} from './app-paths.js';

const ROOT='https://vanhoaoceo.angiang.gov.vn/';
const ringSource=ROOT+'chiec-nhan-vang-nandin-giong-cat-bao-vat-quoc-gia-cua-van-hoa-oc-eo';
const reliefSource=ROOT+'bao-vat-quoc-gia-phu-dieu-phat-linh-son-bac-dau-an-phat-giao-thoi-ky-som-trong-van-hoa-oc-eo';
const jarSource=ROOT+'bao-vat-quoc-gia-mo-vo-go-cay-tram-dau-an-tang-tuc-doc-dao-trong-van-hoa-oc-eo';
const beadsSource=ROOT+'bi-an-nhung-hat-chuoi-co-oc-eo';
const inventorySource=ROOT+'10-bao-vat-quoc-gia-thuoc-van-hoa-oc-eo-o-an-giang';
export const HERITAGE_IMAGES={
 ring:'assets/heritage-art/nandin-giong-cat.webp',
 relief:'assets/heritage-art/linh-son-bac-relief.webp',
 linga:'assets/heritage-art/linga-yoni-linh-son.webp',
 'jar-tram':'assets/heritage-art/jar-go-cay-tram.webp',
};
// An illustration is a travel-stamp motif, never evidence of an unrecorded find.
const SITES={
 'go-giong-cat':{key:'ring',label:['NHẪN NANDIN','NANDIN RING','NANDIN戒指'],relation:'find',sourceUrl:ringSource},
 'linh-son-bac':{key:'relief',label:['PHÙ ĐIÊU PHẬT','BUDDHA RELIEF','佛像浮雕'],relation:'find',sourceUrl:reliefSource},
 'nha-trung-bay-van-hoa-oc-eo':{key:'relief',label:['TỪ TỦ TRƯNG BÀY','FROM THE COLLECTION','展馆藏品'],relation:'display',sourceUrl:reliefSource},
 'chua-linh-son':{key:'linga',label:['LINGA–YONI LINH SƠN','LINH SƠN LINGA–YONI','LINH SƠN林伽–约尼'],relation:'find',sourceUrl:inventorySource},
 'linh-son-nam':{key:'jar-nam',label:['DẤU TÍCH MỘ VÒ','JAR BURIAL','瓮棺遗存'],relation:'find',sourceUrl:jarSource},
 'go-cay-tram':{key:'jar-tram',label:['MỘ VÒ GÒ CÂY TRÂM','GÒ CÂY TRÂM JAR','GÒ CÂY TRÂM瓮棺'],relation:'find',sourceUrl:jarSource},
 'go-giong-trom':{key:'beads',label:['HẠT CHUỖI CỔ','ANCIENT BEADS','古代珠饰'],relation:'find',sourceUrl:beadsSource},
 'go-oc-eo':{key:'beads',label:['HẠT CHUỖI CỔ','ANCIENT BEADS','古代珠饰'],relation:'find',sourceUrl:beadsSource},
 'lung-lon':{key:'beads',label:['HẠT CHUỖI CỔ','ANCIENT BEADS','古代珠饰'],relation:'find',sourceUrl:beadsSource},
 'go-cay-thi':{key:'brick',label:['DẤU GẠCH–ĐÁ','BRICK & STONE','砖石遗迹'],relation:'architecture'},
 'nha-trung-bay-cu-ba-the':{key:'dome',label:['KIẾN TRÚC BA THÊ','BA THÊ ARCHITECTURE','BA THÊ建筑'],relation:'architecture'},
 'hao-thanh-co':{key:'canal',label:['DẤU ĐÔ THỊ CỔ','ANCIENT TOWN','古城遗迹'],relation:'landscape'},
};
export function heritageSymbol(place){
 return SITES[place.id]||{key:'site-mark',label:['DẤU ĐIỂM DI TÍCH','HERITAGE STOP','遗址站点'],relation:'typography'};
}
function linework(key){
 const stroke='stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
 if(key==='linga')return `<g ${stroke}><path d="m23 107 64-23 60 18-61 34Z" fill="#cfc5b4"/><path d="M23 107v20l63 33 61-35v-23l-61 34Z" fill="#b3a28b"/><path d="m109 114 42 13 6-9-38-15" fill="#cfc5b4"/><path d="M66 106V64q0-26 20-27t20 27v42q-20 13-40 0Z" fill="#91664a"/><ellipse cx="86" cy="65" rx="20" ry="10" fill="none"/><path d="m69 77 16 5 18-5M69 95l16 5 18-5M34 115l50 27 49-25m-98 9 49 28 48-27" fill="none"/></g>`;
 if(key==='jar-nam'||key==='jar-tram'){
  const lid=key==='jar-nam'?'<path d="M44 55q40-32 82 0l-4 8H48Z" fill="#c89763"/><path d="M53 52q31-11 62 0" fill="none"/>':'<path d="M41 49q4-7 43-7t43 7v7H41Z" fill="#d3ad7e"/><path d="M76 41q9-12 18 0" fill="#d3ad7e"/>';
  return `<g ${stroke}>${lid}<path d="M54 60v15c-26 9-36 24-29 48 8 28 33 37 59 37s53-11 61-37c7-24-4-39-30-48V60Z" fill="#bb8050"/><path d="M55 75q30 9 60 0M30 114q54 16 108 0M40 136q44 16 88 0" fill="none"/><path d="M81 91h7m-5-6h2" stroke-width="4"/><path d="M43 91q-15 15-6 33m87-30q14 12 7 29" stroke="#ead3ad" fill="none" stroke-width="4"/></g>`;
 }
 if(key==='beads')return `<g ${stroke}><path d="M36 51c-35 91 111 146 116 33" fill="none" stroke-width="1"/>${[[36,51,10],[26,78,12],[30,105,10],[48,127,14],[77,141,11],[106,137,13],[132,116,11],[148,88,12]].map(([x,y,r],i)=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r+2}" fill="${['#a75630','#677d73','#c49b52','#6b526f'][i%4]}"/><ellipse cx="${x}" cy="${y}" rx="2" ry="3" fill="#e7d7ba"/>`).join('')}<path d="M42 47 36 40m117 43 5-6"/></g>`;
 if(key==='brick')return `<g ${stroke} fill="#b97650"><path d="m20 90 65-36 65 36-65 36Z"/><path d="m20 91 65 35 65-35v17l-65 36-65-36Z" fill="#975339"/><path d="m20 109 65 35 65-35v17l-65 36-65-36Z"/><path d="m42 78 63 36m-42-48 64 36M42 103v17m21-6v17m44-17v17m22-28v17m-76 17v17m63-17v17" fill="none"/><path d="M85 56v19m-13-11 39 21-26 15-39-21" fill="#dfb184"/><path d="m46 78 39 23v24" fill="none"/></g>`;
 if(key==='dome')return `<g ${stroke}><path d="M28 139h116M34 132V94h104v38M25 94h121M40 84q3-47 46-54 43 7 46 54" fill="#c4976d"/><path d="M50 82q3-35 36-42 33 7 36 42M86 40v43M38 110h96M44 95v34m21-34v34m42-34v34m21-34v34M75 133v-17q11-17 22 0v17" fill="none"/><path d="M79 29h14m-7-12v12"/></g>`;
 if(key==='canal')return `<g ${stroke} fill="none"><path d="m35 49 92-8 15 89-99 12Z" stroke-width="7"/><path d="m36 87 111-10M77 44l12 92M13 157q45-20 81-9t65-14" stroke-width="5"/><path d="m46 60 24-2 2 18-24 2Zm49-4 23-2 3 18-23 2Zm-44 44 24-2 2 20-24 2Zm51-5 23-2 3 20-23 2Z" fill="#c8a980" stroke-width="1"/></g>`;
 if(key==='ring')return `<g ${stroke} fill="#bb8b37"><ellipse cx="85" cy="116" rx="48" ry="46" fill="none" stroke-width="10"/><path d="M43 73q0-17 24-19l3-28 12 9 12-4 13 10-6 12q25 0 26 20ZM54 72q34 6 67 0M67 54l11 6m16-18 4 2"/></g>`;
 if(key==='relief')return `<g ${stroke} fill="#be8b62"><path d="M30 166 26 42 49 17 131 27l15 138Z"/><circle cx="85" cy="65" r="14"/><path d="M81 80q-20 3-27 26l-19 16 36-9 11-15 7 22 35 21-44 5-29-11 17-15m22-33 16 20 25 11-31 5-16-10" fill="none" stroke-width="7"/></g>`;
 // This is new lettering, not an invented ancient seal or archaeological object.
 return `<g fill="currentColor" font-family="'Be Vietnam',Arial,sans-serif" font-weight="800" text-anchor="middle"><text x="85" y="86" font-size="66" letter-spacing="-5">ÓC</text><text x="85" y="145" font-size="66" letter-spacing="-5">EO</text><path d="M35 24h100M35 159h100" fill="none" stroke="currentColor" stroke-width="2"/></g>`;
}
export function heritageGraphic(key,{x=0,y=0,w=170,h=180,images={},localImages=false}={}){
 const path=HERITAGE_IMAGES[key],src=images[key]||(localImages&&path?appURL(path):'');
 return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 170 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${src?`<image href="${e(src)}" x="4" y="0" width="162" height="180" preserveAspectRatio="xMidYMid meet"/>`:linework(key)}</svg>`;
}
export function heritageSymbolHTML(place){
 const symbol=heritageSymbol(place);
 return `<span class="heritage-stamp-art" aria-hidden="true">${heritageGraphic(symbol.key,{localImages:true})}</span>`;
}
