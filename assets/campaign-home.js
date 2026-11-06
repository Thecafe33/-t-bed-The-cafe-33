import {icon} from './icons.js';
export const homeMessages=[
 ['Bạn muốn làm gì trước?','Where do you want to start?','你想先做什么？'],
 ['Bản đồ trong túi','Your pocket map','口袋地图'],
 ['Tìm di tích, quán và chỗ nghỉ.','Find heritage sites, cafés and places to rest.','寻找遗址、咖啡馆和休息点。'],
 ['Mở bản đồ','Open the map','打开地图'],
 ['Chuyến ba điểm','A three-stop walk','三站行程'],
 ['Theo dấu hiện vật, chọn một chỗ nghỉ.','Follow the finds and choose a rest stop.','循着文物探索，选个地方歇一歇。'],
 ['Xem chuyến đi','See the walk','查看行程'],
 ['Tiếp tục chuyến','Continue your walk','继续行程'],
 ['điểm đã có tem','stops with stamps','个地点已有印章'],
 ['Ảnh chuyến đi của tôi','My Óc Eo story','我的Óc Eo故事图片'],
 ['Ảnh của bạn. Tem Óc Eo. Sẵn để kể.','Your photo. Óc Eo stamps. A story to share.','你的照片、Óc Eo印章，分享你的故事。'],
 ['Tạo story','Create a story','制作故事图片'],
 ['Xem mẫu story','Preview a story','预览故事图片'],
 ['Góc kể Óc Eo','Óc Eo, through your eyes','大家眼中的Óc Eo'],
 ['Xem ảnh và cảm nhận của người đã ghé.','See photos and stories from visitors.','看看游客分享的照片与感受。'],
 ['Mở Góc kể','Read visitor stories','查看游客故事'],
];
/** Landscape first; each whole widget is one action with an explicit CTA. */
export function campaignHomeHTML({active=false,count=0,total=3,canStory=false}={}){
 const max=Math.max(1,Number(total)||3),progress=Math.max(0,Math.min(max,Number(count)||0));
 return `<section class="campaign-home home-action-hub" aria-labelledby="home-tools-heading"><h2 id="home-tools-heading">Bạn muốn làm gì trước?</h2><div class="hub-grid">
 <button type="button" class="hub-widget hub-map" data-route="map"><span class="hub-art" aria-hidden="true"><svg viewBox="0 0 100 72"><path d="m6 18 27-10 35 10 27-10v46L68 64 33 54 6 64Z" fill="#fffdf5" stroke="currentColor" stroke-width="2"/><path d="M33 8v46m35-36v46M17 40q25-29 64-5" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 4"/><circle cx="24" cy="33" r="7" fill="#efb6a0"/><circle cx="75" cy="35" r="8" fill="#b8a9de"/></svg></span><strong class="hub-title">Bản đồ trong túi</strong><span class="hub-copy">Tìm di tích, quán và chỗ nghỉ.</span><span class="hub-cta">Mở bản đồ ${icon('arrowup')}</span></button>
 <button type="button" class="hub-widget hub-walk" data-journey-action="open"><span class="hub-art hub-route-number" aria-hidden="true">${active?`${progress}<small> / ${max}</small>`:'03'}${icon('arrow')}</span><strong class="hub-title">Chuyến ba điểm</strong><span class="hub-copy">${active?'<span data-no-translate>'+progress+' / '+max+'</span> <span>điểm đã có tem</span>':'Theo dấu hiện vật, chọn một chỗ nghỉ.'}</span><span class="hub-cta">${active?'Tiếp tục chuyến':'Xem chuyến đi'} ${icon('arrowup')}</span></button>
 <button type="button" class="hub-widget hub-story" data-journey-action="${canStory?'story':'sample'}"><span class="hub-art hub-picture" aria-hidden="true">${icon('camera')}<span>ÓC EO</span></span><strong class="hub-title">Ảnh chuyến đi của tôi</strong><span class="hub-copy">Ảnh của bạn. Tem Óc Eo. Sẵn để kể.</span><span class="hub-cta">${canStory?'Tạo story':'Xem mẫu story'} ${icon('arrowup')}</span></button>
 <button type="button" class="hub-widget hub-community" data-route="community"><span class="hub-art hub-quotes" aria-hidden="true"><svg viewBox="0 0 110 72" fill="currentColor"><path d="M9 44V29C9 16 17 9 29 7v8c-7 2-10 6-10 12h12v17Zm34 0V29C43 16 51 9 63 7v8c-7 2-10 6-10 12h12v17Z"/><path d="M88 31c0 12 5 17 17 17-12 0-17 5-17 17 0-12-5-17-17-17 12 0 17-5 17-17Z"/></svg></span><strong class="hub-title">Góc kể Óc Eo</strong><span class="hub-copy">Xem ảnh và cảm nhận của người đã ghé.</span><span class="hub-cta">Mở Góc kể ${icon('arrowup')}</span></button>
 </div></section>`;
}
