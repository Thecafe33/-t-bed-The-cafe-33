import {contentSourced,canCollectStamp,isAccessClosed,passProgress,visibleStop,escapeHTML as e} from './model.js';

const authority='https://vanhoaoceo.angiang.gov.vn/';
const reliefSource=authority+'bao-vat-quoc-gia-phu-dieu-phat-linh-son-bac-dau-an-phat-giao-thoi-ky-som-trong-van-hoa-oc-eo';
const ringSource=authority+'chiec-nhan-vang-nandin-giong-cat-bao-vat-quoc-gia-cua-van-hoa-oc-eo';

export const JOURNEY=Object.freeze({
 id:'theo-dau-co-vat-v1',version:1,
 stops:Object.freeze(['nha-trung-bay-van-hoa-oc-eo','linh-son-bac','go-giong-cat']),
});

const text={
 eyebrow:['LỘ TRÌNH GỢI Ý / 3 ĐIỂM DỪNG','SUGGESTED JOURNEY / 3 STOPS','建议行程 / 3站'],
 title:['Theo dấu cổ vật.','Follow the finds.','循着文物去探索。'],
 intro:['Từ hiện vật trong tủ trưng bày, tìm về nơi phát hiện và những câu chuyện Óc Eo.','Connect objects in the exhibition with their discovery sites and Óc Eo stories.','从展柜中的文物出发，连接它们的出土地与Óc Eo故事。'],
 routeProgress:['Chuyến này','This journey','本次行程'],
 passProgress:['Bộ sưu tập Óc Eo Pass','Óc Eo Pass collection','Óc Eo Pass印章集'],
 progressBrief:['Có thể gồm tem từ những chuyến trước.','May include stamps from earlier visits.','可能包含此前到访获得的印章。'],
 progressNote:['Tiến độ tính từ các tem hợp lệ bạn đã có, không xác nhận thời điểm đến hay hoàn thành trong cùng một ngày.','Progress uses your existing valid stamps. It does not establish when you visited or that you completed these stops in one day.','进度来自你已拥有的有效印章，不确认到访时间，也不表示这些站点在同一天完成。'],
 complete:['Bạn đã có đủ tem của 3 điểm trong lộ trình.','You have the stamps for all three stops.','你已拥有这三站的全部印章。'],
 draft:['Bản gợi ý đang chờ kiểm chứng thực địa','Suggested journey awaiting field checks','建议行程尚待实地核验'],
 access:['Chưa xác minh giờ đón khách, lối vào và thời gian di chuyển giữa các điểm. Liên hệ Ban Quản lý trước khi đi; thứ tự dưới đây để đọc câu chuyện, chưa phải tuyến đi bộ hoặc lịch trình tối ưu đã được xác nhận.','Visitor hours, entrances and travel times between stops are unconfirmed. Contact the heritage authority before visiting. This order tells the story; it is not a verified walking route or optimised itinerary.','接待时间、入口及站间交通时间尚未核实。出发前请联系遗产管理机构。下方顺序用于讲述故事，并非已核验的步行路线或最优行程。'],
 source:['Tư liệu Ban Quản lý ↗','Heritage authority source ↗','管理机构资料 ↗'],
 contact:['Liên hệ Ban Quản lý','Contact the heritage authority','联系遗产管理机构'],
 authorityInfo:['Thông tin Ban Quản lý ↗','Heritage authority information ↗','管理机构信息 ↗'],
 select:['Chọn chuyến này','Choose this journey','选择此行程'],
 selected:['Đang theo chuyến này','Following this journey','正在查看此行程'],
 stop:['Dừng theo chuyến','Stop following this journey','停止查看此行程'],
 startUnavailable:['Có điểm chưa sẵn sàng. Chuyến vẫn giữ đủ ba điểm; hãy kiểm tra lại trước khi chọn.','A stop is unavailable. The journey still contains all three stops; check again before choosing it.','有站点暂不可用。行程仍保留全部三站，请确认后再选择。'],
 map:['Mở bản đồ chuyến này','Open the journey map','打开行程地图'],
 place:['Xem hồ sơ và check-in','Open the record and check in','查看档案与签到'],
 pointMap:['Xem điểm trên bản đồ','View this stop on the map','在地图上查看此站'],
 pack:['Chuẩn bị đọc ngoại tuyến','Prepare for offline reading','准备离线阅读'],
 packNote:['Tư liệu lưu ngoại tuyến không thay việc xác nhận giờ mở cửa. Website nguồn và đặt chỗ cần có mạng.','Offline reading does not confirm opening hours. Source websites and bookings need a connection.','离线资料不能确认开放时间，来源网站及预约仍需联网。'],
 story:['Tạo poster từ tem đã có','Create a poster from your stamps','用已有印章制作海报'],
 storyNote:['Có một tem hợp lệ bất kỳ trong Óc Eo Pass là có thể tạo poster; không cần chờ đủ 3 điểm hay cả bộ sưu tập.','Any one valid Óc Eo Pass stamp is enough to create a poster. You do not need all three journey stops or the whole collection.','拥有任意一枚有效的Óc Eo Pass印章即可制作海报，无需集齐本行程三站或整个印章集。'],
 share:['Rủ bạn xem chuyến này','Invite a friend to view this journey','邀请朋友查看此行程'],
 earned:['Đã có tem','Stamp collected','已拥有印章'],
 ready:['Có vị trí mở check-in · cần xác nhận đón khách','GPS check-in available · confirm visitor access','可GPS签到 · 请确认能否参观'],
 closed:['Tạm dừng tiếp cận · liên hệ Ban Quản lý','Access paused · contact the heritage authority','暂不可进入 · 请联系管理机构'],
 scope:['Chưa xác nhận phạm vi xã Óc Eo','Óc Eo commune scope unconfirmed','尚未确认属于Óc Eo社范围'],
 sourcePending:['Hồ sơ hoặc nguồn cần xác minh lại','Record or source needs verification','档案或来源需重新核实'],
 gps:['Chờ xác nhận vị trí nhận tem','Stamp check-in position pending','印章签到位置待确认'],
 sourceUnavailable:['Nội dung điểm này tạm ẩn trong khi xác minh lại hồ sơ.','This stop’s content is hidden while its record is reviewed.','此站档案复核期间，暂不显示相关内容。'],
 restTitle:['Chọn một điểm nghỉ phù hợp','Choose a suitable rest stop','选择合适的休息点'],
 restNote:['Hai gợi ý nghỉ chân là lựa chọn riêng, không cộng vào tiến độ 3 điểm của lộ trình hoặc cấp thêm tem. Tự xác nhận vị trí, giờ phục vụ và giá với cơ sở.','These two rest options are separate choices; they do not count towards the three stops or award stamps. Confirm location, service hours and prices with each business.','以下两处为独立休息选项，不计入三站进度，也不发放印章。请向商家确认位置、营业时间及价格。'],
 cafe:['Cafe in bed để nghỉ giữa chuyến. Đặt trước qua website The cafe 33; nếu không đặt trước có thể phát sinh thêm phí. Hỏi rõ khung giờ, thời lượng và tổng phí.','Rest between stops with Cafe in bed. Book ahead on The cafe 33 website; arriving without a booking may incur an extra charge. Confirm the time slot, duration and total fee.','可在行程中体验Cafe in bed休息。请提前通过The cafe 33网站预约，未预约可能产生附加费用，并确认时段、时长及总费用。'],
 xofa:['Sữa Gạo Phù Nam là món nước đương đại lấy cảm hứng từ văn hóa Óc Eo. Giá tham khảo từ 25K; hỏi quán giá và lựa chọn hiện tại.','Phù Nam rice milk is a contemporary drink inspired by Óc Eo culture. Indicative prices start at 25K VND; ask the café about current prices and options.','Phù Nam米奶是以Óc Eo文化为灵感的当代饮品。参考价为25K越南盾起，请向店家确认当前价格及选择。'],
 restPlace:['Xem điểm nghỉ','View this rest stop','查看休息点'],
 book:['Đặt trước qua website ↗','Book ahead on the website ↗','通过网站提前预约 ↗'],
 restUnavailable:['Gợi ý này đang chờ xác nhận lại.','This recommendation is awaiting confirmation.','此推荐正在等待重新确认。'],
};

const steps=Object.freeze({
 'nha-trung-bay-van-hoa-oc-eo':{
  name:'Nhà trưng bày Văn hóa Óc Eo',sourceUrl:reliefSource,kind:'display',
  heading:['Nơi trưng bày được tư liệu ghi nhận','Display documented by the source','资料记载的展出地点'],
  prompt:['Nhìn phù điêu Phật Linh Sơn Bắc trong ảnh nguồn: bạn tìm thấy đôi mắt và ba ký tự bên dưới chưa? Bài nguồn có ảnh hiện vật ở nhà trưng bày; hỏi người thuyết minh xem hôm nay hiện vật có được giới thiệu không.','Look at the Linh Sơn Bắc Buddha relief in the source photo: can you find the eyes and the three characters below? The source documents it at the exhibition house; ask a guide whether it is on display during your visit.','观察来源照片中的Linh Sơn Bắc佛像浮雕：能找到双眼和下方三个字符吗？来源刊有它在展馆中的照片，请向讲解员确认到访时是否展出。'],
 },
 'linh-son-bac':{
  name:'Linh Sơn Bắc',sourceUrl:reliefSource,kind:'find',
  heading:['Nơi phát hiện phù điêu Phật','Where the Buddha relief was found','佛像浮雕的出土地'],
  prompt:['Phù điêu được tìm thấy tại Linh Sơn Bắc năm 2019. Quan sát từ lối được phép và hỏi đâu là dấu tích cổ, đâu là mái che bảo vệ hiện đại. Nơi phát hiện không đồng nghĩa với nơi đang trưng bày bản gốc.','The relief was found at Linh Sơn Bắc in 2019. Observe from permitted paths and ask which traces are ancient and which structures are modern protection. A discovery site is not necessarily where the original is displayed.','浮雕于2019年在Linh Sơn Bắc发现。请从允许路线观察，询问哪些是古代遗迹、哪些是现代保护设施。出土地不一定是原件当前展出地点。'],
 },
 'go-giong-cat':{
  name:'Gò Giồng Cát',sourceUrl:ringSource,kind:'find',
  heading:['Nơi phát hiện nhẫn Nandin','Where the Nandin ring was found','Nandin戒指的出土地'],
  prompt:['Nhẫn vàng Nandin được khai quật ở Giồng Cát năm 2018. Mở ảnh nguồn để tìm bò nằm xếp chân, bướu vai và nét trang trí trên nhẫn. Chưa xác nhận tủ trưng bày hiện tại; hỏi Ban Quản lý, không chờ gặp nhẫn ngay tại gò.','The Nandin gold ring was excavated at Giồng Cát in 2018. In the source photo, find the tucked legs, shoulder hump and ring decoration. Its current display case is unconfirmed; ask the authority rather than expecting the ring at the mound.','Nandin金戒指于2018年在Giồng Cát发掘。请在来源照片中寻找蜷卧的腿、肩峰和戒指装饰。当前展柜尚未确认，请向管理机构询问，不要预期在土丘现场看到戒指。'],
 },
});

export const journeyMessages=Object.freeze([...Object.values(text),...Object.values(steps).flatMap(step=>[step.heading,step.prompt])]);

const httpsURL=value=>{try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}};

/** Pure projection of the caller's current profile. Never records visits, dates or badges. */
export function journeyState(site,badges=[]){
 const places=Array.isArray(site?.places)?site.places.filter(p=>p&&typeof p==='object'):[];
 const occurrences=new Map();for(const place of places)occurrences.set(place.id,(occurrences.get(place.id)||0)+1);
 const uniquePlaces=places.filter(place=>occurrences.get(place.id)===1);
 const pass=passProgress(uniquePlaces,Array.isArray(badges)?badges.filter(id=>typeof id==='string'):[]);
 const earnedIds=new Set(pass.earned.map(p=>p.id));
 const stops=JOURNEY.stops.map(id=>{
  // Ambiguous duplicate records are unavailable rather than silently picking one.
  const matches=places.filter(p=>p.id===id),place=matches.length===1?matches[0]:null;
  const scopeValid=place?.scopeConfirmed===true&&place.category==='heritage'&&place.collectible!==false;
  const sourceValid=!!place&&contentSourced(place),gpsReady=scopeValid&&sourceValid&&canCollectStamp(place);
  const closed=isAccessClosed(place),available=gpsReady&&!closed,earned=!!place&&scopeValid&&sourceValid&&earnedIds.has(id);
  const status=!scopeValid?'scope':!sourceValid?'sourcePending':closed?'closed':earned?'earned':!gpsReady?'gps':'ready';
  return {id,place,scopeValid,sourceValid,gpsReady,closed,available,earned,status};
 });
 const earned=stops.filter(stop=>stop.earned),ready=stops.filter(stop=>stop.available);
 return {id:JOURNEY.id,version:JOURNEY.version,total:JOURNEY.stops.length,count:earned.length,
  complete:earned.length===JOURNEY.stops.length,stops,earned,ready,
  unavailable:stops.filter(stop=>!stop.available),pass,
  canStart:ready.length===JOURNEY.stops.length,canStory:pass.count>0};
}

function restHTML(site){
 const candidates=Array.isArray(site?.stops)?site.stops:[];
 return `<section class="journey-rest"><h3>${text.restTitle[0]}</h3><p>${text.restNote[0]}</p><div class="journey-rest-options">${['the-cafe-33','xofa'].map(id=>{
  const matches=candidates.filter(p=>p?.id===id),place=matches.length===1?matches[0]:null;
  const available=!!place&&visibleStop(place)&&!isAccessClosed(place),booking=available&&id==='the-cafe-33'?httpsURL(place.bookingUrl):'';
  return `<article class="journey-rest-card" data-journey-rest="${id}"><h4 data-no-translate>${e(place?.name||(id==='the-cafe-33'?'The cafe 33':'XOFA coffee & tea'))}</h4><p>${available?text[id==='the-cafe-33'?'cafe':'xofa'][0]:text.restUnavailable[0]}</p><div class="journey-card-actions"><button class="text-button" data-place="${id}" ${available?'':'disabled'}>${text.restPlace[0]}</button>${booking?`<a class="text-button" href="${e(booking)}" target="_blank" rel="noopener noreferrer">${text.book[0]}</a>`:''}</div></article>`;
 }).join('')}</div></section>`;
}

export function journeyHTML(site,badges,{active=false}={}){
 const state=journeyState(site,badges),museum=state.stops[0].place;
 const phone=typeof museum?.phone==='string'&&/^\+?[0-9]{9,15}$/.test(museum.phone)?museum.phone:'';
 return `<section class="campaign-journey" data-journey-id="${JOURNEY.id}" data-journey-version="${JOURNEY.version}" aria-labelledby="journey-title"><div class="eyebrow">${text.eyebrow[0]}</div><h2 id="journey-title">${text.title[0]}</h2><p class="journey-intro">${text.intro[0]}</p><div class="journey-progress" role="group" aria-label="${e(text.routeProgress[0])}"><div><span>${text.routeProgress[0]}</span><strong data-no-translate>${state.count} / ${state.total}</strong></div><div><span>${text.passProgress[0]}</span><strong data-no-translate>${state.pass.count} / ${state.pass.total}</strong></div></div><p class="journey-progress-note">${text.progressBrief[0]}</p>${state.complete?`<p class="journey-complete" role="status">${text.complete[0]}</p>`:''}<details class="journey-access"><summary>${text.draft[0]}</summary><p>${text.access[0]}</p><p>${text.progressNote[0]}</p>${phone?`<a class="text-button" href="tel:${e(phone)}">${text.contact[0]}</a>`:`<a class="text-button" href="${authority}" target="_blank" rel="noopener noreferrer">${text.authorityInfo[0]}</a>`}</details><div class="journey-primary-actions">${active?`<span class="journey-active" role="status">${text.selected[0]}</span><button class="text-button" data-journey-action="stop">${text.stop[0]}</button>`:`<button class="button dark" data-journey-action="start" ${state.canStart?'':'disabled'}>${text.select[0]}</button>`}<button class="button outline" data-journey-action="map" ${state.ready.length?'':'disabled'}>${text.map[0]}</button></div>${!state.canStart?`<p class="journey-unavailable" role="status">${text.startUnavailable[0]}</p>`:''}<ol class="journey-stops">${state.stops.map((stop,index)=>{
  const step=steps[stop.id],showEvidence=stop.scopeValid&&stop.sourceValid;
  return `<li class="journey-stop" data-journey-stop="${stop.id}" data-journey-status="${stop.status}"><article><div class="journey-step-heading"><span class="journey-step-number" data-no-translate>${String(index+1).padStart(2,'0')}</span><h3 data-no-translate>${e(stop.place?.name||step.name)}</h3></div><p class="journey-step-status">${text[stop.status][0]}</p>${showEvidence?`<h4>${step.heading[0]}</h4><p>${step.prompt[0]}</p><a class="journey-source text-button" href="${step.sourceUrl}" target="_blank" rel="noopener noreferrer">${text.source[0]}</a>`:`<p>${text.sourceUnavailable[0]}</p>`}<div class="journey-card-actions"><button class="button outline" data-place="${stop.id}" ${stop.available?'':'disabled'}>${text.place[0]}</button><button class="text-button" data-journey-action="map" data-place="${stop.id}" ${stop.available?'':'disabled'}>${text.pointMap[0]}</button></div></article></li>`;
 }).join('')}</ol>${restHTML(site)}<div class="journey-finish"><button class="button dark" data-journey-action="story" ${state.canStory?'':'disabled'}>${text.story[0]}</button><p>${text.storyNote[0]}</p><button class="button outline" data-journey-action="share" ${state.canStart?'':'disabled'}>${text.share[0]}</button><button class="text-button" data-journey-action="pack" ${state.stops.every(stop=>stop.scopeValid&&stop.sourceValid)?'':'disabled'}>${text.pack[0]}</button><p class="journey-pack-note">${text.packNote[0]}</p></div></section>`;
}
