// Óc Eo excavation field: a wide simulated trench with several hidden finds.
import { getLanguage, translateText as t } from './i18n.js';
import { escapeHTML as e } from './model.js';
import { ARTIFACTS } from './artifacts.js';
import { narrationHTML, stopNarration } from './narration.js';
import { reducedMotion, playEffect } from './effects.js';
import { SITES, FINDS } from './excavation-sites.js';
import { ExcavationField, placeFinds, squareName } from './excavation-field.js';
import { buildAtlas, findPicture, imageURL } from './excavation-art.js';
import { createExcavationRenderer } from './excavation-renderer.js';

const STORE = 'oceo-discoveries-v1', SITE_STORE = 'oceo-dig-site';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Modern line icons (24px grid, round caps) in the app's soft-pop style.
const svg = body => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
// Field kit. Order follows a real dig: move, strip topsoil, excavate, clean, observe, record, sieve.
export const TOOLS = [
  { id: 'hand', label: 'Di chuyển', tint: '#e0d8f7', svg: svg('<path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>') },
  { id: 'shovel', label: 'Xẻng', tint: '#f8d6c3', svg: svg('<path d="M2 22v-5l5-5 5 5-5 5z"/><path d="M9.5 14.5 16 8"/><path d="m17 2 5 5-.5.5a3.53 3.53 0 0 1-5 0a3.53 3.53 0 0 1 0-5z"/>') },
  { id: 'trowel', label: 'Bay', tint: '#ffe08f', svg: svg('<path d="M3 21 6 10l8 8z"/><path d="m10 14 4.5-4.5"/><path d="m14.5 9.5 5-5a1.4 1.4 0 0 1 2 2l-5 5"/>') },
  { id: 'pick', label: 'Que tre', tint: '#e2efb0', svg: svg('<path d="M4 20 19.5 4.5"/><path d="m7.5 13.5 3 3M11.5 9.5l3 3M15.5 5.5l3 3"/><path d="M4 20l-1 1"/>') },
  { id: 'brush', label: 'Cọ', tint: '#f9dce9', svg: svg('<path d="m14.6 9.4 5.3-5.3a2 2 0 0 1 2.8 2.8l-5.3 5.3"/><path d="M12 9 15 12"/><path d="M11.5 9.5 3 18c-.6.6-.6 1.6 0 2.2l.8.8c.6.6 1.6.6 2.2 0l8.5-8.5"/><path d="m6 15 3 3"/>') },
  { id: 'blower', label: 'Bóng thổi', tint: '#c9d4ff', svg: svg('<path d="M10 21a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"/><path d="m14 11 4.5-4.5"/><path d="M19 2.5c1 .4 2 1.4 2.5 2.5M20.5 8.5h1.5M15.5 3V1.8"/>') },
  { id: 'lens', label: 'Kính lúp', tint: '#d9f0e4', svg: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m21 21-5.5-5.5"/><path d="M8 9a3 3 0 0 1 2.5-1.5"/>') },
  { id: 'camera', label: 'Máy ảnh', tint: '#ffd9c7', svg: svg('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.5"/>') },
];
const SIEVE_ICON = svg('<ellipse cx="12" cy="10" rx="9" ry="3.5"/><path d="M3 10v2c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5v-2"/><path d="M7 11.5v2.5M12 12v3M17 11.5v2.5" stroke-width="1.3"/><path d="M10 19.5v.01M14 18.5v.01M12 22v.01" stroke-width="2.4"/>');
const BOOK_ICON = svg('<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>');
const RESET_ICON = svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>');
const DIG_TOOLS = new Set(['shovel', 'trowel', 'pick', 'brush', 'blower']);
const lang = () => Math.max(0, ['vi', 'en', 'zh'].indexOf(getLanguage()));
const artifact = id => ARTIFACTS.find(a => a.id === id);
const artifactName = id => artifact(id)?.name[lang()] || id;

function loadFound() { try { const saved = JSON.parse(localStorage.getItem(STORE) || '[]'); return new Set(Array.isArray(saved) ? saved.filter(id => FINDS[id]) : []); } catch { return new Set(); } }

export function discoveryEntryHTML() {
  return `<a class="discovery-entry" href="#discovery" data-route="discovery"><span class="discovery-entry-art" aria-hidden="true"><img src="${imageURL('nandin-giong-cat')}" alt="" loading="lazy"></span><span><small data-no-translate>ÓC EO / FIELD LAB</small><strong>Công trường khai quật</strong><span>Chia ô, bóc đất, rây tìm hạt chuỗi. Ghi chép từng cổ vật Óc Eo.</span><b>Vào hố đào ↗</b></span></a>`;
}

export function mountDiscovery(root) {
  root.innerHTML = `<div class="discovery-page">
  <div class="discovery-scene" tabindex="0" role="group" aria-label="Công trường khai quật mô phỏng" aria-describedby="discovery-accessibility">
   <canvas class="discovery-terrain" aria-hidden="true"></canvas><canvas class="discovery-fallback" aria-hidden="true" hidden></canvas><canvas class="discovery-overlay" aria-hidden="true"></canvas>
   <span class="discovery-cursor" aria-hidden="true"></span>
  </div>
  <header class="discovery-hud"><a href="#artifacts" data-route="artifacts" class="discovery-exit" aria-label="Về bộ thẻ cổ vật">←</a>
   <button type="button" class="discovery-site" data-open-sites aria-haspopup="dialog"><small data-no-translate>ÓC EO / FIELD LAB</small><h1 id="discovery-heading" tabindex="-1" data-no-translate></h1><span class="discovery-site-switch">Đổi bãi ↓</span></button>
   <button type="button" data-game-help aria-label="Thông tin và trợ giúp">?</button></header>
  <div class="discovery-stats" aria-live="polite"><span class="discovery-chip" data-stat-finds><b data-no-translate></b><span>hiện vật</span></span><span class="discovery-chip" data-stat-care><b data-no-translate></b><span>bảo tồn</span></span></div>
  <div class="discovery-minimap" role="group" aria-label="Bản đồ hố đào"><canvas aria-hidden="true"></canvas><div class="discovery-zoom"><button type="button" data-zoom="in" aria-label="Phóng to">+</button><button type="button" data-zoom="out" aria-label="Thu nhỏ">−</button><button type="button" data-zoom="fit" aria-label="Xem toàn bộ hố đào">⤢</button></div></div>
  <div class="discovery-scene-note" role="status"><span>Đang dựng hố đào…</span></div>
  <p class="discovery-whisper" role="status" aria-live="polite"></p>
  <div class="discovery-record" role="status" hidden></div>
  <div class="discovery-bottom">
   <div class="discovery-actions"><button type="button" class="discovery-notebook-button" data-open-notebook><i class="dig-icon">${BOOK_ICON}</i><span>Sổ hiện trường</span><b data-no-translate>0</b></button><button type="button" class="discovery-sieve-button" data-open-sieve><i class="dig-icon">${SIEVE_ICON}</i><span>Rây đất</span><b data-no-translate>0 L</b></button></div>
   <div class="discovery-tools" role="group" aria-label="Dụng cụ">${TOOLS.map(tool => `<button type="button" data-tool="${tool.id}" aria-pressed="false" style="--tint:${tool.tint}"><i class="dig-icon">${tool.svg}</i><span>${tool.label}</span></button>`).join('')}<button type="button" data-game-reset aria-label="Đào lại bãi này" title="Đào lại bãi này"><i class="dig-icon">${RESET_ICON}</i></button></div>
   <small class="discovery-caption">Hố đào mô phỏng · lớp đất và kích thước không theo thực tế</small>
  </div>
  <p id="discovery-accessibility" class="discovery-sr">Chọn dụng cụ. Kéo để dùng; hai ngón để di chuyển và phóng to. Bàn phím: mũi tên di chuyển, phím cách để thao tác, dấu cộng và trừ để phóng to.</p>
  <dialog class="discovery-panel discovery-help"><button type="button" data-close-panel aria-label="Trở lại hiện trường">←</button>
   <h2>Làm việc như một đội khảo cổ.</h2>
   <ol class="discovery-steps"><li><b>Xẻng</b> bóc nhanh lớp đất mặt, nhưng sẽ làm xước hiện vật nếu đào sát.</li><li><b>Bay</b> cạo mỏng từng lớp trong tầng văn hoá màu sẫm.</li><li><b>Que tre</b> gỡ đất sát quanh vật nhỏ, dễ xước như đồ kim loại.</li><li><b>Cọ</b> và <b>bóng thổi</b> làm sạch bụi khi bề mặt đã lộ.</li><li><b>Rây đất</b>: đất đã đào được đổ vào xô. Lắc rây để tìm hạt chuỗi rất nhỏ.</li><li><b>Máy ảnh và thước tỷ lệ</b>: chụp ghi chép hiện vật đã lộ rõ, rồi mới đưa vào sổ.</li></ol>
   <button type="button" class="button outline" data-request-hint>Cho mình một gợi ý</button><p class="discovery-hint" role="status" data-no-translate></p>
   <details><summary>Bàn phím và hỗ trợ thao tác</summary><p>Chọn dụng cụ. Kéo để dùng; hai ngón để di chuyển và phóng to. Bàn phím: mũi tên di chuyển, phím cách để thao tác, dấu cộng và trừ để phóng to.</p><button type="button" class="button outline" data-game-assist>Thao tác tại vị trí đang chọn</button></details>
   <hr><p>Trò chơi mô phỏng. Các lớp đất không tái hiện địa tầng thật. Chơi không cấp tem check-in Óc Eo Pass.</p><p>Ngoài di tích: chỉ quan sát theo hướng dẫn, không đào hoặc tự làm sạch hiện vật.</p></dialog>
  <dialog class="discovery-panel discovery-sites"><button type="button" data-close-panel aria-label="Trở lại hiện trường">←</button><h2>Chọn bãi khai quật.</h2><div class="discovery-site-list"></div></dialog>
  <dialog class="discovery-panel discovery-notebook"><button type="button" data-close-panel aria-label="Trở lại hiện trường">←</button><div class="notebook-head"></div><div class="notebook-track" tabindex="0" aria-label="Các trang trong sổ hiện trường"></div><div class="notebook-nav"><button type="button" data-notebook-step="-1" aria-label="Trang trước">←</button><span class="notebook-count" data-no-translate></span><button type="button" data-notebook-step="1" aria-label="Trang sau">→</button></div></dialog>
  <dialog class="discovery-panel discovery-sieve"><button type="button" data-close-panel aria-label="Trở lại hiện trường">←</button><h2>Rây đất.</h2><p class="sieve-intro">Đất từ hố được đổ vào rây. Kéo qua lại trên rây hoặc bấm nút để lắc.</p>
   <div class="sieve-stage" aria-hidden="true"><div class="sieve-ring"><div class="sieve-mesh"></div><div class="sieve-heap"></div><div class="sieve-finds"></div></div><div class="sieve-fall"></div></div>
   <p class="sieve-status" role="status"></p><button type="button" class="button dark" data-sieve-shake>Lắc rây</button><div class="sieve-results"></div></dialog>
 </div>`;
  const $ = s => root.querySelector(s), scene = $('.discovery-scene'), terrain = $('.discovery-terrain'), fallback = $('.discovery-fallback'), overlay = $('.discovery-overlay'), octx = overlay.getContext('2d');
  const minimap = $('.discovery-minimap canvas'), mctx = minimap.getContext('2d'), note = $('.discovery-scene-note'), cursor = $('.discovery-cursor');
  const ac = new AbortController(), on = (el, ev, fn, opt = {}) => el.addEventListener(ev, fn, { ...opt, signal: ac.signal });
  let site = SITES.find(s => { try { return s.id === localStorage.getItem(SITE_STORE); } catch { return false; } }) || SITES[0];
  let field = null, art = null, renderer = null, tool = 'hand', ready = false, disposed = false, active = true, version = 0, seed = 1;
  let view = { width: 1, height: 1, camera: { x: 0, y: 0 }, scale: 120, pointer: { x: 0, y: 0 }, lens: false, seed: 1 };
  let frame = 0, particles = [], flashes = [], messageTimer = 0, recordTimer = 0, lastFeedback = 0, lastSound = 0, hints = 0, said = new Set();
  const pointers = new Map(); let gesture = null, last = null, keyboardCursor = false, notebookIndex = 0;
  let found = loadFound();

  // ── Camera ─────────────────────────────────────────────
  const fitScale = () => Math.min(view.width / (field.widthM + 0.6), (view.height - 150) / (field.heightM + 0.6));
  const minScale = () => Math.min(fitScale(), 60);
  function clampCamera() {
    const vw = view.width / view.scale, vh = view.height / view.scale, W = field.widthM, H = field.heightM;
    view.camera.x = vw >= W + 1.2 ? (W - vw) / 2 : clamp(view.camera.x, -0.6, W + 0.6 - vw);
    view.camera.y = vh >= H + 2.4 ? (H - vh) / 2 : clamp(view.camera.y, -1.2, H + 1.6 - vh);
  }
  function zoomAt(scale, sx, sy) {
    const wx = view.camera.x + sx / view.scale, wy = view.camera.y + sy / view.scale;
    view.scale = clamp(scale, minScale(), 320);
    view.camera.x = wx - sx / view.scale; view.camera.y = wy - sy / view.scale; clampCamera(); schedule();
  }
  function centreOn(wx, wy) { view.camera.x = wx - view.width / view.scale / 2; view.camera.y = wy - view.height / view.scale / 2; clampCamera(); schedule(); }
  const toWorld = p => ({ x: view.camera.x + p.x / view.scale, y: view.camera.y + p.y / view.scale });
  const toScreen = w => ({ x: (w.x - view.camera.x) * view.scale, y: (w.y - view.camera.y) * view.scale });
  const inField = w => w.x >= 0 && w.y >= 0 && w.x < field.widthM && w.y < field.heightM;

  // ── Drawing ────────────────────────────────────────────
  function drawOverlay() {
    const dpr = Math.min(devicePixelRatio || 1, 2), W = view.width, H = view.height;
    if (overlay.width !== Math.round(W * dpr) || overlay.height !== Math.round(H * dpr)) { overlay.width = Math.round(W * dpr); overlay.height = Math.round(H * dpr); }
    octx.setTransform(dpr, 0, 0, dpr, 0, 0); octx.clearRect(0, 0, W, H);
    // Exposed finds pulse until they are photographed.
    const now = performance.now();
    field.finds.forEach(find => {
      if (find.small || find.status !== 'exposed') return;
      const p = toScreen(find), r = find.size * view.scale * 0.62, k = reducedMotion() ? 0.5 : (now / 1400) % 1;
      octx.strokeStyle = `rgba(217,242,122,${0.95 - k * 0.7})`; octx.lineWidth = 4;
      octx.beginPath(); octx.arc(p.x, p.y, r * (1 + k * 0.14), 0, Math.PI * 2); octx.stroke();
      octx.strokeStyle = 'rgba(255,255,255,.9)'; octx.lineWidth = 2; octx.setLineDash([3, 9]);
      octx.beginPath(); octx.arc(p.x, p.y, r * 0.94, 0, Math.PI * 2); octx.stroke(); octx.setLineDash([]);
    });
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= 0.045; octx.fillStyle = `rgba(${p.c},${Math.max(0, p.life) * 0.75})`; octx.beginPath(); octx.ellipse(p.x, p.y, p.r, p.r * 0.7, 0, 0, Math.PI * 2); octx.fill(); }
    flashes = flashes.filter(f => now - f.at < 600);
    for (const f of flashes) {
      const k = (now - f.at) / 600;
      octx.fillStyle = `rgba(255,252,236,${(1 - k) * 0.75})`; octx.fillRect(0, 0, W, H);
      octx.strokeStyle = `rgba(255,255,255,${1 - k})`; octx.lineWidth = 3; const s = 70 + k * 30;
      octx.strokeRect(f.x - s, f.y - s, s * 2, s * 2);
    }
  }
  let miniRevision = -1, miniImage = null;
  function drawMinimap() {
    const W = 92, H = Math.round(W * field.heightM / field.widthM), dpr = Math.min(devicePixelRatio || 1, 2);
    if (minimap.width !== W * dpr) { minimap.width = W * dpr; minimap.height = H * dpr; minimap.style.width = `${W}px`; minimap.style.height = `${H}px`; }
    if (miniRevision !== field.revision) {
      const step = 4, cols = field.cols / step | 0, rows = field.rows / step | 0, data = new ImageData(cols, rows);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const h = field.depth[(y * step) * field.cols + x * step], n = (y * cols + x) * 4;
        const c = h > 0.62 ? [218, 188, 150] : h > 0.3 ? [166, 125, 105] : [250, 222, 160];
        data.data[n] = c[0]; data.data[n + 1] = c[1]; data.data[n + 2] = c[2]; data.data[n + 3] = 255;
      }
      miniImage = document.createElement('canvas'); miniImage.width = cols; miniImage.height = rows; miniImage.getContext('2d').putImageData(data, 0, 0); miniRevision = field.revision;
    }
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0); mctx.imageSmoothingEnabled = true; mctx.drawImage(miniImage, 0, 0, W, H);
    const k = W / field.widthM;
    field.finds.forEach(f => { if (f.status === 'recorded' || f.status === 'exposed') { mctx.fillStyle = f.status === 'recorded' ? '#173f36' : '#e2559a'; mctx.beginPath(); mctx.arc(f.x * k, f.y * k, 3.2, 0, Math.PI * 2); mctx.fill(); } });
    mctx.strokeStyle = '#173f36'; mctx.lineWidth = 2;
    mctx.strokeRect(view.camera.x * k, view.camera.y * k, view.width / view.scale * k, view.height / view.scale * k);
  }
  function paint() {
    frame = 0; if (!active || disposed || !ready) return;
    view.seed = seed; renderer.draw(view); drawOverlay(); drawMinimap();
    if (particles.length || flashes.length || field.finds.some(f => f.status === 'exposed')) frame = requestAnimationFrame(paint);
  }
  function schedule() { if (!frame && active && ready) frame = requestAnimationFrame(paint); }

  // ── Feedback ───────────────────────────────────────────
  function message(text, force = false) {
    if (!force && performance.now() - lastFeedback < 2200) return;
    lastFeedback = performance.now(); clearTimeout(messageTimer);
    const el = $('.discovery-whisper'); el.textContent = t(text); el.classList.add('is-visible');
    messageTimer = setTimeout(() => el.classList.remove('is-visible'), 3000);
  }
  const once = (key, text) => { if (said.has(key)) return; said.add(key); message(text, true); };
  function burst(screen, colour, count = 6, spread = 4) {
    if (reducedMotion()) return;
    for (let i = 0; i < count; i++) particles.push({ x: screen.x, y: screen.y, r: 0.8 + Math.random() * 3, vx: (Math.random() - 0.5) * spread, vy: -Math.random() * 3, g: 0.12, life: 0.7, c: colour });
    if (particles.length > 90) particles.splice(0, particles.length - 90);
  }
  function updateStats() {
    if (!field) return;
    $('[data-stat-finds] b').textContent = `${field.recorded}/${field.finds.length}`;
    $('[data-stat-care] b').textContent = `${field.conservation}%`;
    $('[data-stat-care]').dataset.level = field.conservation >= 85 ? 'good' : field.conservation >= 60 ? 'warn' : 'low';
    $('[data-open-notebook] b').textContent = String(field.recorded);
    const litres = Math.round(field.bucket.soil);
    $('[data-open-sieve] b').textContent = `${litres} L`;
    $('[data-open-sieve]').dataset.ready = String(field.bucket.finds.length > 0 || litres > 0);
    $('[data-tool=camera]').classList.toggle('is-calling', field.finds.some(f => f.status === 'exposed'));
  }
  function selectTool(next) {
    if (!TOOLS.some(x => x.id === next)) return;
    tool = next; cursor.innerHTML = TOOLS.find(x => x.id === next).svg; view.lens = tool === 'lens';
    scene.dataset.activeTool = tool;
    root.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === tool)));
    const tips = { shovel: 'Xẻng: bóc lớp đất mặt thật nhanh.', trowel: 'Bay: cạo mỏng từng lớp.', pick: 'Que tre: gỡ đất sát hiện vật.', brush: 'Cọ: phủi bụi trên bề mặt đã lộ.', blower: 'Bóng thổi: thổi bụi khỏi khe chạm.', lens: 'Kính lúp: soi kỹ màu đất và vật lấp lánh.', camera: 'Máy ảnh: chạm vào hiện vật đã lộ để ghi chép.', hand: 'Kéo để di chuyển quanh hố đào.' };
    message(tips[tool], true); schedule();
  }

  // ── Digging ────────────────────────────────────────────
  function stroke(fromScreen, toScreenPoint) {
    if (!ready) return;
    const from = toWorld(fromScreen), to = toWorld(toScreenPoint);
    if (!inField(to)) { if (DIG_TOOLS.has(tool)) message('Ngoài mép hố là vùng không đào.'); return; }
    const result = field.apply(tool, from, to);
    if (result.changed) {
      const dirt = tool === 'blower' || tool === 'brush' ? '250,236,205' : '214,176,134';
      burst(toScreenPoint, dirt, tool === 'shovel' ? 9 : 5, tool === 'blower' ? 9 : 4);
      if (performance.now() - lastSound > 170) { playEffect('brush'); lastSound = performance.now(); }
    }
    if (result.damaged) message(tool === 'shovel' ? 'Xẻng chạm vào vật cứng! Đổi sang bay để đào nhẹ hơn.' : 'Bề mặt kim loại rất dễ xước. Thử que tre.', true);
    else if (result.bucketed.length) message('Trong đất vừa đào có gì đó lấp lánh. Mang xô đất ra rây.', true);
    else if (result.exposed.length) { message('Một hiện vật đã lộ ra. Chụp ảnh ghi chép trước khi đưa vào sổ.', true); playEffect('paper'); if (!reducedMotion() && navigator.vibrate) navigator.vibrate(18); }
    else if (result.contact) { if (tool === 'pick') once('pick', 'Que tre gỡ đất sát hiện vật mà không làm xước.'); else message('Có một bề mặt khác ở đây.'); }
    else if (!result.changed) {
      if (tool === 'brush') message('Đất vẫn còn khá chắc. Cọ chỉ làm sạch lớp mỏng.');
      else if (tool === 'blower') message('Bóng thổi chỉ thổi bụi trên bề mặt đã lộ.');
      else if (tool === 'shovel') once('shovel-floor', 'Xẻng chỉ bóc lớp đất mặt. Lớp sẫm màu bên dưới cần bay.');
      else if (tool === 'trowel') message('Lớp đáy sét vàng: không còn tầng văn hoá ở đây.');
    } else if (tool === 'shovel') once('shovel', 'Xẻng bóc nhanh lớp đất mặt. Gần tầng văn hoá hãy đổi sang bay.');
    updateStats();
    schedule();
  }
  function photograph(screen) {
    const w = toWorld(screen), index = field.findAt(w.x, w.y);
    if (index < 0) {
      const buried = field.findAt(w.x, w.y, ['buried']);
      message(buried >= 0 && field.progressOf(buried) > 0.25 ? 'Làm sạch thêm rồi hẵng chụp ghi chép.' : 'Chưa có hiện vật lộ rõ ở đây để ghi chép.', true);
      return;
    }
    const centre = toScreen(field.finds[index]);
    flashes.push({ x: centre.x, y: centre.y, at: performance.now() });
    record(index);
  }
  function record(index) {
    const entry = field.record(index); if (!entry) return;
    found.add(entry.id); try { localStorage.setItem(STORE, JSON.stringify([...found])); } catch {}
    playEffect('stamp'); updateStats();
    notebookIndex = recordedList().findIndex(f => f.id === entry.id);
    const box = $('.discovery-record'); clearTimeout(recordTimer);
    box.innerHTML = `<span class="record-thumb" data-thumb="${e(entry.id)}"></span><span><small><span>${e(t('Đã ghi vào sổ hiện trường'))}</span></small><strong data-no-translate>${e(artifactName(entry.id))}</strong></span><button type="button" data-open-notebook>${e(t('Xem'))}</button>`;
    fillThumbs(box); box.hidden = false; box.classList.remove('is-leaving');
    recordTimer = setTimeout(() => { box.classList.add('is-leaving'); recordTimer = setTimeout(() => { box.hidden = true; }, 260); }, 4200);
    if (field.complete) setTimeout(() => { if (!disposed) celebrate(); }, 900);
    schedule();
  }
  function celebrate() {
    scene.dataset.complete = 'true'; message('Bãi đào đã hoàn tất. Mọi hiện vật đều được ghi chép.', true);
    if (!reducedMotion()) for (let i = 0; i < 70; i++) particles.push({ x: view.width / 2, y: view.height * 0.4, r: 2 + Math.random() * 3, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 9, g: 0.2, life: 1.3, c: ['217,242,122', '246,184,211', '255,224,143'][i % 3] });
    notebookIndex = 0; openNotebook(); schedule();
  }

  // ── Field notebook ─────────────────────────────────────
  const recordedList = () => field ? field.finds.filter(f => f.status === 'recorded') : [];
  async function fillThumbs(scope) {
    for (const el of scope.querySelectorAll('[data-thumb]')) {
      const picture = await findPicture(el.dataset.thumb); if (!el.isConnected) continue;
      el.innerHTML = ''; const img = document.createElement('img'); img.alt = '';
      img.src = picture.url || picture.source.toDataURL('image/png'); el.append(img);
      if (picture.placeholder) el.dataset.placeholder = 'true';
    }
  }
  function cardHTML(find) {
    const a = artifact(find.id), i = lang(), temp = !FINDS[find.id]?.image;
    return `<article class="notebook-card" data-card="${e(find.id)}"><div class="notebook-art" data-thumb="${e(find.id)}"></div>
     <p class="notebook-art-note">${e(t(temp ? 'Hình tạm · ảnh sẽ được cập nhật' : 'Minh hoạ hiện vật · không phải ảnh tư liệu'))}</p>
     <div class="notebook-tags"><span><span>${e(t('Ô'))}</span> <b data-no-translate>${e(find.origin || squareName(find.x, find.y))}</b></span><span>${e(t(find.small ? 'Tìm qua rây' : 'Lộ ra ở tầng văn hoá'))}</span></div>
     <h3 data-no-translate>${e(a.name[i])}</h3><dl data-no-translate><dt>${e(t('Niên đại'))}</dt><dd>${e(a.period[i])}</dd><dt>${e(t('Chất liệu'))}</dt><dd>${e(a.material[i])}</dd></dl>
     <p data-no-translate>${e(a.story[i])}</p><p class="notebook-source" data-no-translate>${e(a.discovered[i])}</p>
     ${narrationHTML('artifact', find.id)}
     <button type="button" class="button dark" data-discovery-record="${e(find.id)}">${e(t('Xem thẻ tư liệu'))} ↗</button></article>`;
  }
  function renderNotebook() {
    const list = recordedList(), left = field.finds.length - list.length;
    $('.notebook-head').innerHTML = `<small data-no-translate>ÓC EO / FIELD NOTEBOOK</small><h2>${e(t('Sổ hiện trường'))}</h2><p><span data-no-translate>${e(t(site.name))}</span> · <b data-no-translate>${list.length}/${field.finds.length}</b> <span>${e(t('hiện vật'))}</span> · <b data-no-translate>${field.conservation}%</b> <span>${e(t('bảo tồn'))}</span></p>${field.complete ? `<p class="notebook-done"><span>${e(t('Hoàn tất bãi đào!'))}</span> <button type="button" class="text-button" data-open-sites><span>${e(t('Chọn bãi khác'))}</span> →</button></p>` : ''}`;
    $('.notebook-track').innerHTML = list.map(cardHTML).join('') + (left ? `<article class="notebook-card notebook-locked"><span aria-hidden="true">?</span><h3>${e(t('Còn hiện vật dưới lòng đất'))}</h3><p><b data-no-translate>${left}</b> <span>${e(t('hiện vật chưa được ghi chép. Tiếp tục đào và rây đất.'))}</span></p></article>` : '');
    fillThumbs($('.notebook-track')); updateNotebookCount();
  }
  function updateNotebookCount() {
    const cards = [...root.querySelectorAll('.notebook-card')];
    $('.notebook-count').textContent = cards.length ? `${notebookIndex + 1} / ${cards.length}` : '';
    root.querySelector('[data-notebook-step="-1"]').disabled = notebookIndex <= 0;
    root.querySelector('[data-notebook-step="1"]').disabled = notebookIndex >= cards.length - 1;
  }
  function showCard(index, smooth = true) {
    const cards = root.querySelectorAll('.notebook-card'); if (!cards.length) return;
    notebookIndex = clamp(index, 0, cards.length - 1); stopNarration();
    const track = $('.notebook-track'); track.scrollTo({ left: cards[notebookIndex].offsetLeft - track.offsetLeft, behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' });
    updateNotebookCount();
  }
  function openNotebook() {
    release(); renderNotebook(); const dialog = $('.discovery-notebook'); if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => showCard(notebookIndex < 0 ? 0 : notebookIndex, false));
  }

  // ── Sieve ──────────────────────────────────────────────
  let sieveTravel = 0, sieveLast = null;
  function renderSieve(revealed = []) {
    const soil = field.bucket.soil, start = Math.max(soil, field.bucket.start || 0);
    $('.sieve-heap').style.setProperty('--heap', String(start ? clamp(soil / Math.max(start, 1), 0, 1) : 0));
    const waiting = field.finds.map((f, i) => ({ f, i })).filter(({ f }) => f.small && f.status === 'sieved');
    $('.sieve-finds').innerHTML = waiting.map(({ f }) => `<span class="sieve-find" data-thumb="${e(f.id)}"></span>`).join('');
    $('.sieve-results').innerHTML = waiting.map(({ f, i }) => `<div class="sieve-result"><span data-thumb="${e(f.id)}"></span><span><strong data-no-translate>${e(artifactName(f.id))}</strong><small><span>${e(t('Ô'))}</span> <span data-no-translate>${e(f.origin)}</span></small></span><button type="button" class="button dark" data-sieve-record="${i}">${e(t('Chụp ghi chép'))}</button></div>`).join('');
    fillThumbs($('.discovery-sieve'));
    $('.sieve-status').innerHTML = soil > 0 ? `<span>${e(t('Trong rây còn khoảng'))}</span> <b data-no-translate>${Math.ceil(soil)} L</b>` : `<span>${e(t(waiting.length ? 'Rây đã sạch. Có hạt chuỗi nằm lại trên mắt lưới!' : 'Xô đang trống. Đào đất bằng xẻng, bay hoặc que tre rồi quay lại.'))}</span>`;
    $('[data-sieve-shake]').disabled = soil <= 0;
    if (revealed.length) { playEffect('stamp'); message('Hạt chuỗi thuỷ tinh nằm lại trên rây!', true); }
  }
  function openSieve() {
    release(); field.bucket.start = field.bucket.soil; renderSieve(); $('.discovery-sieve').showModal();
  }
  function shake(power = 1) {
    if (field.bucket.soil <= 0) return;
    const amount = (5 + field.bucket.soil * 0.25) * power;
    const { revealed } = field.sieve(amount);
    const ring = $('.sieve-ring'); if (!reducedMotion()) { ring.classList.remove('is-shaking'); void ring.offsetWidth; ring.classList.add('is-shaking'); }
    if (performance.now() - lastSound > 150) { playEffect('brush'); lastSound = performance.now(); }
    renderSieve(revealed); updateStats();
  }

  // ── Sites ──────────────────────────────────────────────
  function renderSites() {
    $('.discovery-site-list').innerHTML = SITES.map(s => {
      const got = s.finds.filter(id => found.has(id)).length;
      return `<button type="button" class="discovery-site-card" data-site="${e(s.id)}" aria-pressed="${s.id === site.id}"><strong data-no-translate>${e(t(s.name))}</strong><small data-no-translate>${e(t(s.note))}</small><span><b data-no-translate>${s.cols} × ${s.rows} m</b> · <b data-no-translate>${s.finds.length}</b> <span>${e(t('hiện vật'))}</span> · <span>${e(t('đã từng ghi'))}</span> <b data-no-translate>${got}/${s.finds.length}</b></span></button>`;
    }).join('');
  }

  // ── Lifecycle ──────────────────────────────────────────
  function closePanels() { root.querySelectorAll('dialog[open]').forEach(d => d.close()); stopNarration(); }
  function release() { gesture = null; last = null; for (const id of pointers.keys()) if (scene.hasPointerCapture(id)) scene.releasePointerCapture(id); pointers.clear(); cursor.classList.remove('is-visible'); }
  function reset(nextSite = site) {
    closePanels(); release(); cancelAnimationFrame(frame); frame = 0; particles = []; flashes = []; ready = false; hints = 0; said = new Set(); notebookIndex = 0;
    site = nextSite; try { localStorage.setItem(SITE_STORE, site.id); } catch {}
    $('#discovery-heading').textContent = t(site.name);
    renderer?.destroy(); renderer = null; terrain.hidden = false; fallback.hidden = true; delete scene.dataset.complete;
    $('.discovery-record').hidden = true; $('.discovery-hint').textContent = ''; $('[data-tool=camera]').classList.remove('is-calling');
    tool = 'hand'; selectToolQuiet('hand');
    seed = Math.random() * 1000; note.hidden = false;
    const epoch = ++version, finds = placeFinds(site, FINDS);
    buildAtlas(finds).then(result => {
      if (disposed || epoch !== version) return;
      art = result;
      const alphaById = new Map(finds.map((f, i) => [f.id, result.alphas[i]]));
      field = new ExcavationField(site, finds, f => alphaById.get(f.id));
      const rect = scene.getBoundingClientRect(); view.width = rect.width || innerWidth; view.height = rect.height || innerHeight;
      view.scale = clamp(Math.min(view.width / 3, view.height / 4.6), minScale(), 320);
      centreOn(field.widthM / 2, field.heightM / 2);
      renderer = createExcavationRenderer(terrain, fallback, art, field);
      scene.dataset.renderer = renderer.kind; scene.dataset.site = site.id; ready = true; note.hidden = true;
      view.pointer = { x: view.width / 2, y: view.height / 2 };
      updateStats(); schedule();
    });
  }
  function selectToolQuiet(id) { tool = id; view.lens = false; scene.dataset.activeTool = id; cursor.innerHTML = TOOLS.find(x => x.id === id).svg; root.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === id))); }

  // ── Input ──────────────────────────────────────────────
  const local = event => { const r = scene.getBoundingClientRect(); return { x: event.clientX - r.left, y: event.clientY - r.top }; };
  function pinchState() { const [a, b] = [...pointers.values()]; return { mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, dist: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)) }; }
  on(scene, 'pointerdown', event => {
    if (!ready || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault(); scene.focus({ preventScroll: true }); keyboardCursor = false;
    scene.setPointerCapture(event.pointerId); pointers.set(event.pointerId, local(event));
    if (pointers.size === 2) { const s = pinchState(); gesture = { type: 'pinch', ...s, scale: view.scale, camera: { ...view.camera } }; cursor.classList.remove('is-visible'); return; }
    if (pointers.size > 2) return;
    const p = local(event); view.pointer = p; last = p;
    gesture = { type: tool === 'hand' ? 'pan' : tool === 'camera' ? 'tap' : 'tool', start: p, moved: 0 };
    if (gesture.type === 'tool') { moveCursor(p); stroke(p, p); }
    schedule();
  });
  function moveCursor(p) { cursor.style.left = `${p.x}px`; cursor.style.top = `${p.y}px`; cursor.classList.toggle('is-visible', DIG_TOOLS.has(tool)); }
  on(scene, 'pointermove', event => {
    if (!pointers.has(event.pointerId)) { if (event.pointerType === 'mouse' && tool === 'lens') { view.pointer = local(event); schedule(); } return; }
    const p = local(event), prev = pointers.get(event.pointerId); pointers.set(event.pointerId, p);
    if (!gesture) return;
    if (gesture.type === 'pinch' && pointers.size >= 2) {
      const s = pinchState(), scale = clamp(gesture.scale * s.dist / gesture.dist, minScale(), 320);
      const wx = gesture.camera.x + gesture.mid.x / gesture.scale, wy = gesture.camera.y + gesture.mid.y / gesture.scale;
      view.scale = scale; view.camera.x = wx - s.mid.x / scale; view.camera.y = wy - s.mid.y / scale; clampCamera(); schedule(); return;
    }
    gesture.moved += Math.hypot(p.x - prev.x, p.y - prev.y);
    if (gesture.type === 'pan') { view.camera.x -= (p.x - prev.x) / view.scale; view.camera.y -= (p.y - prev.y) / view.scale; clampCamera(); }
    else if (gesture.type === 'tool') { moveCursor(p); stroke(last || p, p); last = p; }
    view.pointer = p; schedule();
  });
  function end(event) {
    if (!pointers.has(event.pointerId)) return;
    if (gesture?.type === 'tap' && gesture.moved < 12 && pointers.size === 1) photograph(local(event));
    pointers.delete(event.pointerId); if (scene.hasPointerCapture(event.pointerId)) scene.releasePointerCapture(event.pointerId);
    if (pointers.size === 0) { gesture = null; last = null; cursor.classList.remove('is-visible'); }
    else if (gesture?.type === 'pinch') gesture = null;
  }
  on(scene, 'pointerup', end); on(scene, 'pointercancel', end); on(scene, 'lostpointercapture', end);
  on(scene, 'wheel', event => { if (!ready) return; event.preventDefault(); const p = local(event); zoomAt(view.scale * Math.exp(-event.deltaY * 0.0015), p.x, p.y); }, { passive: false });
  on(minimap, 'pointerdown', event => { if (!ready) return; event.preventDefault(); const go = ev => { const r = minimap.getBoundingClientRect(); centreOn((ev.clientX - r.left) / r.width * field.widthM, (ev.clientY - r.top) / r.height * field.heightM); }; go(event); minimap.setPointerCapture(event.pointerId); minimap.onpointermove = ev => { if (minimap.hasPointerCapture(ev.pointerId)) go(ev); }; });
  on(scene, 'keydown', event => {
    if (!ready) return;
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (arrows[event.key]) {
      event.preventDefault(); keyboardCursor = true; const [dx, dy] = arrows[event.key];
      if (tool === 'hand') { view.camera.x += dx * 0.4; view.camera.y += dy * 0.4; clampCamera(); }
      else {
        view.pointer = { x: clamp(view.pointer.x + dx * 18, 20, view.width - 20), y: clamp(view.pointer.y + dy * 18, 120, view.height - 190) };
        if (view.pointer.x <= 24 || view.pointer.x >= view.width - 24) { view.camera.x += dx * 0.3; clampCamera(); }
        if (view.pointer.y <= 124 || view.pointer.y >= view.height - 194) { view.camera.y += dy * 0.3; clampCamera(); }
        moveCursor(view.pointer); cursor.classList.add('is-visible');
      }
      schedule();
    }
    if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); if (tool === 'camera') photograph(view.pointer); else stroke(view.pointer, { x: view.pointer.x + 6, y: view.pointer.y }); }
    if (['+', '='].includes(event.key)) zoomAt(view.scale * 1.25, view.width / 2, view.height / 2);
    if (event.key === '-') zoomAt(view.scale / 1.25, view.width / 2, view.height / 2);
  });
  on(root, 'click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.matches('[data-tool]')) selectTool(button.dataset.tool);
    if (button.matches('[data-game-reset]')) reset(site);
    if (button.matches('[data-zoom]') && ready) { const z = button.dataset.zoom; if (z === 'fit') { view.scale = clamp(fitScale(), minScale(), 320); centreOn(field.widthM / 2, field.heightM / 2); } else zoomAt(view.scale * (z === 'in' ? 1.3 : 1 / 1.3), view.width / 2, view.height / 2); }
    if (button.matches('[data-game-help]')) { release(); $('.discovery-help').showModal(); }
    if (button.matches('[data-open-sites]')) { closePanels(); release(); renderSites(); $('.discovery-sites').showModal(); }
    if (button.matches('[data-site]')) { const next = SITES.find(s => s.id === button.dataset.site); if (next) reset(next); }
    if (button.matches('[data-open-notebook]') && ready) openNotebook();
    if (button.matches('[data-open-sieve]') && ready) openSieve();
    if (button.matches('[data-sieve-shake]')) shake(1);
    if (button.matches('[data-sieve-record]')) { const i = Number(button.dataset.sieveRecord); flashes.push({ x: view.width / 2, y: view.height / 2, at: performance.now() }); record(i); renderSieve(); }
    if (button.matches('[data-notebook-step]')) showCard(notebookIndex + Number(button.dataset.notebookStep));
    if (button.matches('[data-close-panel]')) { closePanels(); scene.focus({ preventScroll: true }); }
    if (button.matches('[data-request-hint]')) $('.discovery-hint').textContent = t(['Bóc lớp đất mặt bằng xẻng trên một vùng rộng, rồi đổi sang bay khi đất chuyển sẫm màu.', 'Soi kính lúp ở tầng văn hoá: điểm lấp lánh có thể là hạt chuỗi. Đào chỗ đó rồi mang xô ra rây.', 'Hiện vật lộ ra sẽ có vòng sáng nhấp nháy. Chọn máy ảnh rồi chạm vào để ghi chép.'][hints++ % 3]);
    if (button.matches('[data-game-assist]')) { closePanels(); scene.focus({ preventScroll: true }); if (tool === 'camera') photograph(view.pointer); else stroke(view.pointer, { x: view.pointer.x + 6, y: view.pointer.y }); }
  });
  // Swiping the notebook track keeps the page counter in sync.
  on($('.notebook-track'), 'scroll', () => {
    const track = $('.notebook-track'), cards = [...track.children]; if (!cards.length) return;
    const index = Math.round(track.scrollLeft / Math.max(1, cards[0].offsetWidth + 14));
    if (index !== notebookIndex) { notebookIndex = clamp(index, 0, cards.length - 1); stopNarration(); updateNotebookCount(); }
  }, { passive: true });
  on($('.notebook-track'), 'keydown', event => { if (event.key === 'ArrowRight') { event.preventDefault(); showCard(notebookIndex + 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); showCard(notebookIndex - 1); } });
  // Drag across the sieve to shake it.
  const stage = $('.sieve-stage');
  on(stage, 'pointerdown', event => { sieveLast = event.clientX; sieveTravel = 0; stage.setPointerCapture(event.pointerId); });
  on(stage, 'pointermove', event => { if (sieveLast === null || !stage.hasPointerCapture(event.pointerId)) return; sieveTravel += Math.abs(event.clientX - sieveLast); sieveLast = event.clientX; if (sieveTravel > 70) { sieveTravel = 0; shake(0.8); } });
  on(stage, 'pointerup', () => { sieveLast = null; });
  for (const panel of root.querySelectorAll('dialog')) { on(panel, 'cancel', ev => { ev.preventDefault(); closePanels(); scene.focus({ preventScroll: true }); }); on(panel, 'close', stopNarration); }
  const observer = new ResizeObserver(() => { const r = scene.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && (r.width !== view.width || r.height !== view.height)) { const cx = view.camera.x + view.width / view.scale / 2, cy = view.camera.y + view.height / view.scale / 2; view.width = r.width; view.height = r.height; if (field) { view.scale = clamp(view.scale, minScale(), 320); centreOn(cx, cy); } } });
  observer.observe(scene);
  on(window, 'oceo-before-route-change', () => { release(); closePanels(); active = false; cancelAnimationFrame(frame); frame = 0; particles = []; });
  on(window, 'oceo-route-change', event => { active = event.detail.tab === 'discovery'; if (active) schedule(); });
  on(document, 'visibilitychange', () => { if (document.hidden) { release(); cancelAnimationFrame(frame); frame = 0; particles = []; } else if (active) schedule(); });
  on(window, 'oceo-language-change', () => { $('#discovery-heading').textContent = t(site.name); $('.discovery-hint').textContent = ''; $('.discovery-whisper').textContent = ''; $('.discovery-record').hidden = true; if ($('.discovery-notebook').open) renderNotebook(); if ($('.discovery-sites').open) renderSites(); if ($('.discovery-sieve').open) renderSieve(); });
  reset(site);
  return { destroy() { disposed = true; version++; release(); closePanels(); cancelAnimationFrame(frame); clearTimeout(messageTimer); clearTimeout(recordTimer); observer.disconnect(); renderer?.destroy(); ac.abort(); } };
}
