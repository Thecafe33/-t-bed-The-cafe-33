import { UI_MESSAGES } from './locales-ui.js';
import {artifactMessageRows} from './artifacts.js';
import { POLICY_MESSAGES } from './locales-policy.js';
import { contentMessageRows } from './locales-content.js';
import { CURATED } from './content.js';
import { EXTRA_MESSAGES } from './locales-extra.js';
import {homeMessages} from './campaign-home.js';
import {journeyMessages} from './journey.js';
import {storyMessages} from './story-creator.js';
import {campaignMessages} from './campaign-messages.js';
import {placeFeedMessages} from './place-feed.js';
const normal=value=>String(value).normalize('NFC').replace(/\s+/g,' ').trim();
const messages=new Map([...UI_MESSAGES,...POLICY_MESSAGES,...EXTRA_MESSAGES,...contentMessageRows(),...artifactMessageRows(),...homeMessages,...journeyMessages,...storyMessages,...campaignMessages,...placeFeedMessages].map(([vi,en,zh])=>[normal(vi),{en,zh}]));
const names=new Set([...CURATED.places,...CURATED.stops].flatMap(p=>[p.name,p.address,...(p.aliases||[])]).filter(Boolean).concat(['Óc Eo','Óc Eo.','óc eo','ÓC EO','Óc Eo Pass','ÓC EO TOWNWALK','Óc Eo, An Giang','Óc Eo, An Giang, Việt Nam']).map(v=>normal(v).toLowerCase()));
let language='vi';try{const saved=localStorage.getItem('oceo-language');if(['vi','en','zh'].includes(saved))language=saved;}catch{}
export const getLanguage=()=>language;
export const dateLocale=()=>({vi:'vi-VN',en:'en-GB',zh:'zh-CN'}[language]);
const choose=(en,zh,lang)=>lang==='en'?en:zh;
function dynamic(text,lang){
 let m;
 if((m=text.match(/^Thẻ (\d+) \/ (\d+)$/)))return choose(`Card ${m[1]} / ${m[2]}`,`第 ${m[1]} / ${m[2]} 张`,lang);
 if((m=text.match(/^(\d+) thẻ$/)))return choose(`${m[1]} cards`,`${m[1]} 张卡片`,lang);

 if((m=text.match(/^(\d+) kết quả$/)))return choose(`${m[1]} results`,`${m[1]} 个结果`,lang);
 if((m=text.match(/^(\d+) vị trí tham khảo trên bản đồ Óc Eo Townwalk\./)))return choose(`${m[1]} reference positions on the Townwalk map. Custom cartography uses open data; coordinate sources remain in each record. The OSM illustration extent is not a legal administrative map.`,`${m[1]} 个Townwalk地图参考位置。地图采用开放数据自行绘制，各档案保留坐标来源。OSM参考范围不代替法定行政地图。`,lang);

 if((m=text.match(/^(\d+) điểm gần nhau, chạm để phóng to$/)))return choose(`${m[1]} nearby stops; tap to zoom in`,`${m[1]} 个相邻地点，点击放大`,lang);

 if((m=text.match(/^(\d+) điểm$/)))return choose(`${m[1]} stops`,`${m[1]} 个地点`,lang);
 if((m=text.match(/^(\d+) m · đường chim bay$/)))return choose(`${m[1]} m · straight-line distance`,`${m[1]} 米 · 直线距离`,lang);

 if((m=text.match(/^(\d+) câu chuyện đã tải · ([\d.]+)\/5 sao trong các bài đang xem$/)))return choose(`${m[1]} stories loaded · ${m[2]}/5 across these reviews`,`${m[1]} 条故事已加载 · 当前评论均分 ${m[2]}/5`,lang);
 if((m=text.match(/^(\d+) trên 5 sao$/)))return choose(`${m[1]} out of 5 stars`,`${m[1]}星，满分5星`,lang);
 if((m=text.match(/^Báo cáo đánh giá của (.+)$/)))return choose(`Report ${m[1]}’s review`,`举报${m[1]}的评论`,lang);
 if((m=text.match(/^Óc Eo Pass mang tên (.+)$/)))return choose(`Óc Eo Pass for ${m[1]}`,`${m[1]}的Óc Eo Pass`,lang);
 if((m=text.match(/^Không tạo được ảnh kỷ niệm: (.+)$/)))return choose(`Could not create the image: ${translateText(m[1],lang)}`,`无法生成图片：${translateText(m[1],lang)}`,lang);
 if((m=text.match(/^Chưa xóa hoàn tất\. Dữ liệu đã xóa có thể không khôi phục được; bạn có thể thử lại\. (.+)$/)))return choose(`Deletion is incomplete. Already deleted data may not be recoverable. You can try again. ${translateText(m[1],lang)}`,`删除尚未完成，已删除的数据可能无法恢复，可以重试。${translateText(m[1],lang)}`,lang);

 if((m=text.match(/^(.+?)\s*([↗↻])$/))){const base=translateText(m[1],lang);if(base!==m[1])return base+' '+m[2];}
 if((m=text.match(/^([←→])\s*(.+)$/))){const base=translateText(m[2],lang);if(base!==m[2])return m[1]+' '+base;}
 if((m=text.match(/^Tâm ô Plus Code ([A-Z0-9+]+) hiển thị trên trang địa điểm Google Maps/)))return choose(`Centre of public Plus Code ${m[1]} on the Google Maps listing (about 14 m resolution). Confirm the entrance with the venue.`,`Google Maps条目中公开Plus Code ${m[1]}的单元中心，精度约14米。请向店家确认入口。`,lang);
 if((m=text.match(/^Danh mục đang có (\d+) hồ sơ,/)))return choose(`${m[1]} records cover the Ba Thê and ancient-city groups, the culture exhibition house and an optional former summit building. The summit stop has no stamp. Lung Lớn A/B and Gò Cây Thị A/B are grouped. This is not an exhaustive inventory; Nền Chùa and Giồng Xoài are excluded from the Óc Eo commune itinerary.`,`${m[1]}份档案涵盖Ba Thê、古城遗址组、文化展馆与山顶旧展馆支线；支线不发章。Lung Lớn A/B与Gò Cây Thị A/B各合为一项。目录并不完整，Nền Chùa与Giồng Xoài不纳入Óc Eo社行程。`,lang);

 if((m=text.match(/^Bạn đã đạt (\d+) \/ (\d+) tem$/)))return choose(`You’ve collected ${m[1]} / ${m[2]} stamps`,`已收集 ${m[1]} / ${m[2]} 枚印章`,lang);
 if((m=text.match(/^(\d+) điểm trong bộ sưu tập$/)))return choose(`${m[1]} destinations in the collection`,`印章集包含 ${m[1]} 个地点`,lang);
 if((m=text.match(/^Bộ sưu tập có (\d+) điểm, hiện (\d+) điểm có vị trí mở check-in\./)))return choose(`The collection has ${m[1]} destinations; ${m[2]} currently have sourced check-in positions. Stamps appear only after successful check-in. Pending locations remain in the total but cannot issue new stamps yet.`,`印章集共 ${m[1]} 个地点，目前 ${m[2]} 个已有位置依据并开放签到。只有成功签到后才显示印章；待确认位置仍计入总数，但暂不发章。`,lang);
 if((m=text.match(/^(\d+) địa điểm(?: · (\d+) có vị trí tham khảo)?$/)))return choose(`${m[1]} destinations${m[2]?` · ${m[2]} reference positions`:''}`,`${m[1]} 个地点${m[2]?` · ${m[2]} 个参考位置`:''}`,lang);
 if((m=text.match(/^(\d+) địa điểm \/ gợi ý · (\d+) có pin\./)))return choose(`${m[1]} destinations / tips · ${m[2]} pins. Each position’s source is linked in its details.`,`${m[1]} 个地点或线索 · ${m[2]} 个定位。各点详情中注明位置来源。`,lang);
 if((m=text.match(/^(\d+) pin có nguồn ·/)))return choose(`${m[1]} sourced pins · OSM and public Plus Codes. Check each source and confirm the entrance. Dashed line: community OSM boundary.`,`${m[1]} 个有来源的定位 · OSM与公开Plus Code。请查看来源并确认入口，虚线为OSM社区边界。`,lang);
 if((m=text.match(/^(\d+) hồ sơ:/)))return choose(`${m[1]} records: heritage areas A/B, the exhibition house and optional discoveries. This is not an exhaustive inventory. Read each source and access advice; mapped positions are references.`,`${m[1]} 份档案，涵盖A/B区遗址、展馆与自选探索点，并非完整名录。请阅读各点来源与进入提示，地图位置仅供参考。`,lang);
 if((m=text.match(/^(\d+) phút gợi ý$/)))return choose(`${m[1]} min suggested`,`建议 ${m[1]} 分钟`,lang);
 if((m=text.match(/^Nhận tem trong bán kính (\d+) m quanh vị trí tham khảo, sau khi GPS xác định thành công\.$/)))return choose(`GPS check-in is available within ${m[1]} m of the reference position once location succeeds.`,`GPS成功定位后，可在参考位置 ${m[1]} 米范围内领取印章。`,lang);
 if((m=text.match(/^Bạn còn cách điểm khoảng (\d+) m\. Cần ở trong bán kính (\d+) m để nhận tem\.$/)))return choose(`You are about ${m[1]} m away. Get within ${m[2]} m to check in.`,`你距离该点约 ${m[1]} 米，需要进入 ${m[2]} 米范围才能签到。`,lang);
 if((m=text.match(/^Nguồn vị trí · (.+) ↗$/)))return choose(`Location source · ${m[1]} ↗`,`位置来源 · ${m[1]} ↗`,lang);
 if((m=text.match(/^Có pin · (.+)$/)))return choose(`Mapped · ${m[1]}`,`已有定位 · ${m[1]}`,lang);
 if((m=text.match(/^Gợi ý địa phương · cập nhật (.+)$/)))return choose(`Local tip · updated ${m[1]}`,`当地线索 · 更新于 ${m[1]}`,lang);
 if((m=text.match(/^Ảnh: (.+)$/)))return choose(`Photo: ${m[1]}`,`照片：${m[1]}`,lang);
 if((m=text.match(/^Ảnh trải nghiệm do (.+) chia sẻ$/)))return choose(`Experience photo shared by ${m[1]}`,`${m[1]}分享的旅行照片`,lang);
 if((m=text.match(/^Còn tìm thấy bằng: (.+)$/)))return choose(`Also searchable as: ${m[1]}`,`也可搜索：${m[1]}`,lang);
 if((m=text.match(/^(Khám phá|Bản đồ|Lịch trình|Chuyến đi|Óc Eo Pass|Cộng đồng) — (.+)$/)))return `${translateText(m[1],lang)} — ${m[2]}`;
 if((m=text.match(/^Đã giữ trên máy, chưa đồng bộ: (.+)$/)))return choose(`Saved on this device, not synced: ${translateText(m[1],lang)}`,`已保存在本机，尚未同步：${translateText(m[1],lang)}`,lang);
 return null;
}
export function translateText(value,lang=language){
 if(lang==='vi')return value;
 const key=normal(value);if(!key)return value;
 const translated=messages.get(key)?.[lang]??dynamic(key,lang);
 if(!translated)return value;
 return (String(value).match(/^\s*/)?.[0]||'')+translated+(String(value).match(/\s*$/)?.[0]||'');
}
const textSources=new WeakMap(),attributeSources=new WeakMap();
const skip='script,style,code,pre,textarea,[data-no-translate]';
function localizeText(node){
 if(!node.parentElement || node.parentElement.closest(skip))return;
 const current=node.data,old=textSources.get(node),source=old&&current===old.output?old.source:current;
 const output=translateText(source);textSources.set(node,{source,output});if(output!==current)node.data=output;
}
function localizeAttributes(element){
 if(element.closest(skip))return;
 let originals=attributeSources.get(element);if(!originals){originals=new Map();attributeSources.set(element,originals);}
 for(const attr of ['placeholder','title','aria-label','alt'])if(element.hasAttribute(attr)){
  const current=element.getAttribute(attr),old=originals.get(attr),source=old&&current===old.output?old.source:current;
  const output=translateText(source);originals.set(attr,{source,output});if(current!==output)element.setAttribute(attr,output);
 }
}
function apply(root){
 if(root.nodeType===Node.TEXT_NODE){localizeText(root);return;}
 if(root.nodeType!==Node.ELEMENT_NODE && root.nodeType!==Node.DOCUMENT_NODE)return;
 if(root.nodeType===Node.ELEMENT_NODE)localizeAttributes(root);
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode())localizeText(node);
 root.querySelectorAll?.('[placeholder],[title],[aria-label],[alt]').forEach(localizeAttributes);
}
export function setLanguage(next){
 if(!['vi','en','zh'].includes(next))return;
 language=next;try{localStorage.setItem('oceo-language',next);}catch{}
 document.documentElement.lang=next==='zh'?'zh-Hans':next;
 const select=document.querySelector('#language-select');if(select){select.value=next;select.setAttribute('aria-label',translateText('Chọn ngôn ngữ'));}
 apply(document.documentElement);
 window.dispatchEvent(new CustomEvent('oceo-language-change',{detail:{language:next}}));
}
export function initI18n(){
 document.querySelector('#language-select')?.addEventListener('change',event=>setLanguage(event.target.value));
 const observer=new MutationObserver(records=>{
  for(const record of records){
   if(record.type==='characterData')localizeText(record.target);
   else if(record.type==='attributes')localizeAttributes(record.target);
   else for(const node of record.addedNodes)apply(node);
  }
 });
 observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','alt']});
 setLanguage(language);
}
// Used by the translation coverage check; not visitor text or a network request.
export function untranslatedUI(root=document.body){
 const values=new Set(),walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){
  if(!node.parentElement || node.parentElement.closest(skip))continue;
  const source=normal(textSources.get(node)?.source??node.data);
  if(/[À-ỹđĐ]/.test(source)&&!names.has(source.toLowerCase())&&!messages.has(source)&&translateText(source,'en')===source)values.add(source);
 }
 return [...values];
}
