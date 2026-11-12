// Story tab: the flow of Óc Eo history, told as short chapters that link into the app.
// Wording is original. Eras marked REF follow the milestones on the "Dòng chảy Văn hóa Óc Eo"
// timeline at khuditichoceo.com; the others come from sources already cited in this app.
import { getLanguage } from './i18n.js';
import { escapeHTML as e } from './model.js';

const REF = { url: 'https://www.khuditichoceo.com/#timeline', label: ['khuditichoceo.com', 'khuditichoceo.com', 'khuditichoceo.com'] };
const AUTHORITY = { url: 'https://vanhoaoceo.angiang.gov.vn/', label: ['Ban Quản lý Di tích văn hóa Óc Eo', 'Óc Eo heritage authority', 'Óc Eo遗址管理处'] };

const CHAPTERS = [
  {
    era: ['Thế kỷ I – III', '1st – 3rd century', '公元1–3世纪'],
    title: ['Những cảng thị đầu tiên', 'The first port towns', '最早的港市'],
    text: [
      'Vương quốc Phù Nam hình thành ở vùng châu thổ phía nam. Những cảng thị sơ khai mọc lên ven kênh rạch và bắt đầu buôn bán với thương nhân phương xa.',
      'The Funan kingdom took shape in the southern delta. Early port towns grew along the waterways and began trading with merchants from afar.',
      '扶南王国在南部三角洲逐渐形成。早期港市沿着河道兴起，开始与远方商人往来贸易。',
    ],
    source: REF, tone: 'dawn',
  },
  {
    era: ['Thế kỷ IV – VI', '4th – 6th century', '公元4–6世纪'],
    title: ['Thời hoàng kim của thương cảng', 'The golden age of the port', '商港的黄金时代'],
    text: [
      'Óc Eo trở thành nơi trung chuyển hàng hoá giữa Ấn Độ Dương và Thái Bình Dương. Hạt chuỗi thuỷ tinh, đồ vàng và con dấu khắc chữ cổ là dấu vết của mạng lưới giao thương ấy.',
      'Óc Eo became a transshipment hub between the Indian and Pacific Oceans. Glass beads, gold work and inscribed seals are traces of that trading network.',
      'Óc Eo成为印度洋与太平洋之间的货物中转地。玻璃珠、金饰和刻字印章都是这一贸易网络留下的痕迹。',
    ],
    links: [{ artifact: 'nandin-giong-cat', label: ['Nhẫn vàng Nandin · thế kỷ V', 'Nandin gold ring · 5th century', 'Nandin金戒指 · 公元5世纪'] }, { artifact: 'hat-chuoi-go-oc-eo', label: ['Hạt chuỗi thuỷ tinh', 'Glass beads', '玻璃珠'] }],
    source: REF, tone: 'gold',
  },
  {
    era: ['Thế kỷ VII', '7th century', '公元7世纪'],
    title: ['Một vương quốc lặng dần', 'A kingdom fades', '王国渐渐沉寂'],
    text: [
      'Phù Nam suy yếu rồi dần biến mất khỏi sử sách. Các nguyên nhân thường được nhắc đến gồm biến đổi môi trường, sụt lún và sự trỗi dậy của những thế lực khác. Bộ Linga–Yoni ở Linh Sơn thuộc giai đoạn này.',
      'Funan weakened and gradually disappeared from the written record. Commonly cited causes include environmental change, land subsidence and the rise of other powers. The Linh Sơn Linga–Yoni belongs to this period.',
      '扶南逐渐衰弱，最终从史籍中消失。常被提到的原因包括环境变化、地面沉降以及其他势力的崛起。Linh Sơn的林伽–约尼属于这一时期。',
    ],
    links: [{ artifact: 'linga-yoni-linh-son', label: ['Bộ Linga–Yoni Linh Sơn', 'Linh Sơn Linga–Yoni', 'Linh Sơn林伽–约尼'] }],
    source: REF, tone: 'dusk',
  },
  {
    era: ['1944', '1944', '1944年'],
    title: ['Cánh đồng Óc Eo được đánh thức', 'The Óc Eo field reawakens', 'Óc Eo田野被唤醒'],
    text: [
      'Từ ngày 10/2 đến 19/4/1944, nhà khảo cổ Louis Malleret và cộng sự khai quật cánh đồng Óc Eo. Gò Óc Eo là điểm đầu tiên, và tên gọi nơi này trở thành tên của cả một nền văn hoá.',
      'From 10 February to 19 April 1944, archaeologist Louis Malleret and his colleagues excavated the Óc Eo field. Gò Óc Eo came first, and its name became the name of a whole culture.',
      '1944年2月10日至4月19日，考古学家Louis Malleret及其团队发掘了Óc Eo田野。Gò Óc Eo是第一个地点，它的名字后来成为整个文化的名称。',
    ],
    links: [{ place: 'go-oc-eo', label: ['Gò Óc Eo', 'Gò Óc Eo', 'Gò Óc Eo'] }],
    source: AUTHORITY, tone: 'paper',
  },
  {
    era: ['2012', '2012', '2012年'],
    title: ['Di tích quốc gia đặc biệt', 'Special National Relic', '国家特别级遗迹'],
    text: [
      'Khu di tích khảo cổ và kiến trúc nghệ thuật Óc Eo – Ba Thê được Thủ tướng Chính phủ xếp hạng di tích quốc gia đặc biệt.',
      'The Óc Eo – Ba Thê archaeological and architectural site was ranked a Special National Relic by the Prime Minister.',
      'Óc Eo – Ba Thê考古与建筑艺术遗址被越南政府总理列为国家特别级遗迹。',
    ],
    source: REF, tone: 'leaf',
  },
  {
    era: ['2018 – 2019', '2018 – 2019', '2018–2019年'],
    title: ['Những phát hiện mới', 'New discoveries', '新的发现'],
    text: [
      'Năm 2018, nhẫn vàng Nandin được khai quật ở Gò Giồng Cát. Năm 2019, phù điêu Phật bằng đá lộ ra ở Linh Sơn Bắc, dưới chân núi Ba Thê. Câu chuyện Óc Eo vẫn đang được viết tiếp.',
      'In 2018 the Nandin gold ring was excavated at Gò Giồng Cát. In 2019 a stone Buddha relief emerged at Linh Sơn Bắc, at the foot of Ba Thê. The Óc Eo story is still being written.',
      '2018年，Nandin金戒指在Gò Giồng Cát出土；2019年，石雕佛像浮雕在Ba Thê山脚的Linh Sơn Bắc重见天日。Óc Eo的故事仍在继续。',
    ],
    links: [{ artifact: 'phat-linh-son-bac', label: ['Phù điêu Phật Linh Sơn Bắc', 'Linh Sơn Bắc Buddha relief', 'Linh Sơn Bắc佛像浮雕'] }, { place: 'go-giong-cat', label: ['Gò Giồng Cát', 'Gò Giồng Cát', 'Gò Giồng Cát'] }],
    source: AUTHORITY, tone: 'gold',
  },
  {
    era: ['Hôm nay', 'Today', '今天'],
    title: ['Hướng tới di sản thế giới', 'Towards World Heritage', '迈向世界遗产'],
    text: [
      'Hồ sơ Óc Eo – Ba Thê đang được hoàn thiện để đề cử UNESCO. Đây là hồ sơ đề cử, chưa phải di sản thế giới đã được ghi danh. Mỗi chuyến đi tôn trọng di tích là một phần của hành trình này.',
      'The Óc Eo – Ba Thê dossier is being prepared for UNESCO nomination. It is a nomination, not yet an inscribed World Heritage Site. Every respectful visit is part of this journey.',
      'Óc Eo – Ba Thê的申遗材料正在完善，准备提交联合国教科文组织。这只是提名，尚未列入世界遗产名录。每一次尊重遗址的到访都是这段旅程的一部分。',
    ],
    cta: true, source: REF, tone: 'dawn',
  },
];

const UI = {
  eyebrow: ['STORY · TIẾN TRÌNH LỊCH SỬ', 'STORY · HISTORICAL TIMELINE', '故事 · 历史进程'],
  title: ['Dòng chảy', 'The flow of', ''],
  titleSerif: ['Óc Eo.', 'Óc Eo.', 'Óc Eo的流转。'],
  intro: [
    'Bảy mốc, từ những cảng thị đầu tiên đến hôm nay. Cuộn xuống để đi qua ngàn năm.',
    'Seven chapters, from the first port towns to today. Scroll down to travel through a thousand years.',
    '七个篇章，从最早的港市到今天。向下滑动，穿越千年。',
  ],
  source: ['Nguồn', 'Source', '来源'],
  cta: ['Bắt đầu chuyến đi', 'Start your trip', '开始你的旅程'],
  note: [
    'Nội dung tóm lược, viết lại theo mốc lịch sử của khuditichoceo.com và tư liệu đã dẫn trong app. Niên đại từng hiện vật xem trong thẻ tư liệu.',
    'A summary rewritten from the milestones on khuditichoceo.com and sources cited in this app. See each artifact card for its own dating.',
    '内容依据khuditichoceo.com的历史节点及本应用引用的资料改写。各文物的年代请见其资料卡。',
  ],
};

export function storyHTML() {
  const i = Math.max(0, ['vi', 'en', 'zh'].indexOf(getLanguage())), x = v => e(v[i]);
  const chapters = CHAPTERS.map((c, n) => `<li class="story-chapter" data-tone="${c.tone}" style="--n:${n}">
    <span class="story-dot" aria-hidden="true">${String(n + 1).padStart(2, '0')}</span>
    <article class="story-card">
      <span class="story-era">${x(c.era)}</span>
      <h2>${x(c.title)}</h2>
      <p>${x(c.text)}</p>
      ${c.links ? `<div class="story-links">${c.links.map(l => l.artifact
        ? `<button type="button" class="story-link" data-discovery-record="${e(l.artifact)}">◆ <span>${x(l.label)}</span></button>`
        : `<button type="button" class="story-link" data-place="${e(l.place)}">⌖ <span>${x(l.label)}</span></button>`).join('')}</div>` : ''}
      ${c.cta ? `<a class="button dark story-cta" href="#day" data-route="day">${x(UI.cta)} ↗</a>` : ''}
      <a class="story-source" href="${e(c.source.url)}" target="_blank" rel="noopener noreferrer">${x(UI.source)}: ${x(c.source.label)} ↗</a>
    </article>
  </li>`).join('');
  return `<div class="app-view-heading story-heading"><div class="eyebrow">${x(UI.eyebrow)}</div>
    <h1 id="story-heading" tabindex="-1">${x(UI.title)} <span class="serif">${x(UI.titleSerif)}</span></h1><p>${x(UI.intro)}</p></div>
    <ol class="story-flow">${chapters}</ol>
    <p class="story-note">${x(UI.note)}</p>`;
}

// Chapters rise into view as they scroll in; with reduced motion they are simply shown.
export function mountStory(root) {
  root.innerHTML = storyHTML();
  root.querySelectorAll('[data-route],[data-place],[data-discovery-record],a,h1,h2,p,span,button').forEach(el => el.setAttribute('data-no-translate', ''));
  const items = root.querySelectorAll('.story-chapter');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -12% 0px' });
  items.forEach(el => io.observe(el));
}
