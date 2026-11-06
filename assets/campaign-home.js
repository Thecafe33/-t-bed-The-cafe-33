import {appURL} from './app-paths.js';
import {escapeHTML as e} from './model.js';
import {icon} from './icons.js';

export const homeMessages=[
 ['MỘT CHUYẾN ĐI. DẤU RIÊNG CỦA BẠN.','ONE WALK. YOUR OWN IMPRESSION.','一段旅程，留下你的印记。'],
 ['có dấu tôi.','my own mark.','留下我的印记。'],
 ['Chiếc nhẫn nhỏ. Chuyện một đô thị cổ.','A tiny ring. An ancient town’s story.','一枚小戒指，一座古城的故事。'],
 ['Minh hoạ nhẫn vàng Nandin Giồng Cát, hình bò nằm trên mặt nhẫn.','Illustration of the Giồng Cát Nandin gold ring, with a reclining bull on its bezel.','Giồng Cát金质Nandin戒指插画，戒面上有一头卧牛。'],
 ['NHẪN NANDIN','NANDIN RING','NANDIN戒指'],
 ['GIỒNG CÁT · THẾ KỶ V','GIỒNG CÁT · 5TH CENTURY','GIỒNG CÁT · 公元5世纪'],
 ['BẮT ĐẦU TỪ 3 ĐIỂM','START WITH 3 STOPS','从3个地点开始'],
 ['Chọn một vòng Óc Eo. Đến điểm, nhận tem, rồi kể theo cách của bạn.','Choose an Óc Eo walk. Visit, collect stamps, then tell it your way.','选择一条Óc Eo路线。到访、集章，再分享你的故事。'],
 ['CHUYẾN ĐI ĐANG ĐI','YOUR WALK IN PROGRESS','正在进行的旅程'],
 ['điểm đã có tem','stops with stamps','个地点已有印章'],
 ['Chuyến đi của bạn vẫn ở đây. Chạm thêm một điểm, gặp thêm một chuyện.','Your walk is still here. Another stop, another story.','你的行程还在这里。再到一站，发现另一个故事。'],
 ['Các điểm đã chọn đều có tem. Kể Óc Eo theo cách của bạn.','Every selected stop has a stamp. Tell Óc Eo your way.','所选地点均已集章，分享属于你的Óc Eo故事。'],
 ['Chọn 3 điểm đầu tiên','Choose your first 3 stops','选择最初的3站'],
 ['Tiếp tục chuyến đi','Continue your walk','继续行程'],
 ['Xem các điểm đã chọn','See your selected stops','查看所选地点'],
 ['Tạo story của tôi','Create my story','制作我的故事图片'],
 ['Xem trước story mẫu','Preview a sample story','预览故事图片示例'],
 ['Nhẫn này được tìm thấy ở đâu?','Where was this ring found?','这枚戒指在哪里出土？'],
 ['Xem tư liệu ↗','Explore the source ↗','查看资料 ↗'],
 ['Minh hoạ từ hiện vật','Illustration inspired by the object','以实物为灵感的插画'],
 ['Tiến độ chuyến đi','Walk progress','行程进度'],
];

/** A campaign entry point; the parent owns journey state and delegated actions. */
export function campaignHomeHTML({active=false,count=0,total=3,canStory=false}={}){
 const maximum=Number.isFinite(Number(total))?Math.max(1,Math.min(100,Math.floor(Number(total)))):3;
 const earned=Number.isFinite(Number(count))?Math.max(0,Math.min(maximum,Math.floor(Number(count)))):0;
 const complete=active&&earned===maximum;
 const primary=active?(complete?'Xem các điểm đã chọn':'Tiếp tục chuyến đi'):'Chọn 3 điểm đầu tiên';
 const secondary=canStory?'Tạo story của tôi':'Xem trước story mẫu';
 const progress=active?`<div class="campaign-home-progress"><p><strong data-no-translate>${earned}<span> / ${maximum}</span></strong><span>điểm đã có tem</span></p><div class="campaign-progress-track" role="progressbar" aria-label="Tiến độ chuyến đi" aria-valuemin="0" aria-valuemax="${maximum}" aria-valuenow="${earned}"><span style="width:${earned/maximum*100}%"></span></div></div>`:'';
 return `<section class="campaign-home${active?' campaign-home-active':''}" aria-labelledby="explore-heading">
  <div class="campaign-home-edition"><span data-no-translate>ÓC EO / TOWNWALK</span><span aria-hidden="true">01</span></div>
  <div class="campaign-home-main">
   <div class="campaign-home-copy"><p class="campaign-home-kicker">MỘT CHUYẾN ĐI. DẤU RIÊNG CỦA BẠN.</p><h1 id="explore-heading" tabindex="-1"><span data-no-translate>Óc Eo,</span><em>có dấu tôi.</em></h1><p class="campaign-home-hook">Chiếc nhẫn nhỏ. Chuyện một đô thị cổ.</p></div>
   <figure class="campaign-home-object"><button type="button" class="campaign-home-object-link" data-artifact="nandin-giong-cat" aria-label="Nhẫn này được tìm thấy ở đâu?"><img src="${e(appURL('assets/heritage-art/nandin-giong-cat.webp'))}" width="1086" height="1448" alt="Minh hoạ nhẫn vàng Nandin Giồng Cát, hình bò nằm trên mặt nhẫn." decoding="async" fetchpriority="high"><span class="campaign-home-object-label"><strong>NHẪN NANDIN</strong><span>Xem tư liệu ↗</span></span></button><figcaption><span>GIỒNG CÁT · THẾ KỶ V</span></figcaption></figure>
  </div>
  <div class="campaign-home-actions"><button type="button" class="campaign-button campaign-button-primary" data-journey-action="open"><span>${primary}</span>${icon('arrow')}</button><button type="button" class="campaign-button campaign-button-secondary" data-journey-action="${canStory?'story':'sample'}">${icon('camera')}<span>${secondary}</span></button></div>
  <div class="campaign-home-invitation"><span class="campaign-home-label">${active?'CHUYẾN ĐI ĐANG ĐI':'BẮT ĐẦU TỪ 3 ĐIỂM'}</span>${progress}<p>${active?(complete?'Các điểm đã chọn đều có tem. Kể Óc Eo theo cách của bạn.':'Chuyến đi của bạn vẫn ở đây. Chạm thêm một điểm, gặp thêm một chuyện.'):'Chọn một vòng Óc Eo. Đến điểm, nhận tem, rồi kể theo cách của bạn.'}</p></div>
  <p class="campaign-home-image-note">Minh hoạ từ hiện vật</p>
 </section>`;
}
