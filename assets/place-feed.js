import {escapeHTML as e,safeURL,eligible,contentSourced} from './model.js';
import {heritageSymbolHTML,heritageSymbol} from './heritage-symbols.js';
import {icon} from './icons.js';
export const placeFeedMessages=[
 ['Xem điểm này','Explore this stop','探索此地点'],
 ['Lưu điểm','Save this stop','保存此地点'],
 ['Bỏ lưu điểm','Unsave this stop','取消保存'],
 ['Điểm trước','Previous stop','上一地点'],
 ['Điểm tiếp','Next stop','下一地点'],
 ['Lướt ngang để chọn điểm muốn ghé ↔','Swipe to find your next stop ↔','左右滑动，选择想去的地点 ↔'],
 ['Minh hoạ di sản','Heritage illustration','遗产插画'],
 ['Thẻ địa danh','Place lettering','地点文字卡'],
 ['Thẻ điểm đến','Destination card','目的地卡片'],
 ['Nghỉ chân','Take a break','休息'],
 ['Di sản','Heritage','遗产'],
 ['Ăn uống','Food','餐饮'],
 ['Lưu trú','Stay','住宿'],
 ['Chọn một bữa ở Óc Eo.','Pick a meal in Óc Eo.','在Óc Eo选一顿饭。'],
 ['Khám phá một góc sinh hoạt địa phương.','Explore a corner of local daily life.','探索当地日常生活的一角。'],
];
const lettering={
 'the-cafe-33':['CAFE','IN BED'],xofa:['SỮA GẠO','PHÙ NAM'],
 'bun-cua-oc-eo':['BÚN','CUA'], 'banh-xeo-oc-eo':['BÁNH','XÈO'], 'du-du-dam-oc-eo':['ĐU ĐỦ','ĐÂM'],
 'phuong-sang':['PHƯỢNG','SANG'],'ut-map':['ÚT','MẬP'],
};
export function placeCardHTML(p,index,{saved=false}={}){
 const image=safeURL(p.image,{image:true}),heritage=p.category==='heritage',symbol=heritage?heritageSymbol(p):null;
 const illustrated=heritage&&symbol.relation!=='typography';
 const titleId=`catalog-place-${index}`;
 const words=lettering[p.id]||[p.name.toLocaleUpperCase('vi-VN')];
 const art=image?`<img src="${e(image)}" alt="${e(p.name)}" loading="lazy" decoding="async">`:illustrated?`<span class="place-illustration" aria-hidden="true" data-no-translate>${heritageSymbolHTML(p)}</span>`:`<span class="place-lettering" aria-hidden="true" data-no-translate>${words.map(s=>`<span>${e(s)}</span>`).join('')}</span>`;
 const mediaNote=!image?`<span class="place-media-note">${illustrated?'Minh hoạ di sản':heritage?'Thẻ địa danh':'Thẻ điểm đến'}</span>`:'';
 const kind=heritage?'Di sản':p.category==='rest'?'Nghỉ chân':p.category==='stay'?'Lưu trú':'Ăn uống';
 const status=eligible(p)?'Có pin':contentSourced(p)?'Có tư liệu':p.localRecommendation?'Gợi ý địa phương':'Chờ xác minh';
 const hook=p.id==='san-vuon-lieu'?'Chọn một bữa ở Óc Eo.':p.id==='cho-oc-eo'?'Khám phá một góc sinh hoạt địa phương.':p.hook||p.description.slice(0,95);
 return `<article class="place-card feed-card feed-tone-${index%5}" aria-labelledby="${titleId}"><button type="button" class="place-art${image?' feed-photo':' feed-illustrated'}" data-place="${e(p.id)}" aria-labelledby="${titleId}">${art}<span class="place-number" data-no-translate>${String(index+1).padStart(2,'0')}</span><span class="place-badge">${icon(eligible(p)?'pin':'leaf')}<span>${status}</span></span>${mediaNote}</button><div class="place-card-body"><div class="eyebrow">${kind}</div><h3><button type="button" id="${titleId}" data-place="${e(p.id)}" data-no-translate>${e(p.name)}</button></h3><p>${e(hook)}${!p.hook&&p.description.length>95?'…':''}</p>${p.accessWarningShort?`<p class="place-access-warning">${icon('compass')}${e(p.accessWarningShort)}</p>`:''}<div class="feed-card-actions"><button type="button" class="feed-open" data-place="${e(p.id)}">Xem điểm này ${icon('arrowup')}</button><button type="button" class="feed-save${saved?' is-saved':''}" data-save-place="${e(p.id)}" aria-pressed="${saved}" aria-label="${saved?'Bỏ lưu điểm':'Lưu điểm'}">${icon(saved?'check':'heart')}</button></div></div></article>`;
}
