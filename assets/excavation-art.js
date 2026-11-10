// Illustrations for the excavation game. Missing images use drawn placeholders that
// are clearly labelled as temporary in the field notebook.
import { appURL } from './app-paths.js';
import { FINDS } from './excavation-sites.js';

export const ATLAS_GRID = 4, ATLAS_SLOT = 256;
const cache = new Map();

export const imageURL = id => FINDS[id]?.image ? appURL(`assets/heritage-art/${FINDS[id].image}.webp`) : null;

function gradient(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
const radial = (ctx, x, y, r, stops) => { const g = ctx.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };

// Each drawer paints into a 256×256 box with a transparent background.
const DRAW = {
  ring(ctx) {
    ctx.lineWidth = 30; ctx.strokeStyle = gradient(ctx, 60, 120, 196, 220, [[0, '#f6d77a'], [.5, '#c9962f'], [1, '#8a5f1a']]);
    ctx.beginPath(); ctx.ellipse(128, 160, 62, 70, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = radial(ctx, 128, 82, 58, [[0, '#ffe9a6'], [.6, '#d6a33c'], [1, '#8f6219']]);
    ctx.beginPath(); ctx.ellipse(128, 82, 58, 46, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a5214';
    ctx.beginPath(); ctx.ellipse(124, 90, 30, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(150, 76, 11, 9, -.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(104, 96, 7, 10); ctx.fillRect(138, 96, 7, 10);
    ctx.beginPath(); ctx.moveTo(116, 79); ctx.quadraticCurveTo(122, 66, 132, 77); ctx.fill();
  },
  relief(ctx) {
    ctx.fillStyle = gradient(ctx, 40, 20, 220, 240, [[0, '#a7a49b'], [.55, '#7d7a72'], [1, '#55534d']]);
    ctx.beginPath(); ctx.moveTo(44, 236); ctx.lineTo(40, 70); ctx.quadraticCurveTo(128, -6, 216, 70); ctx.lineTo(212, 236); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5e5b54';
    ctx.beginPath(); ctx.moveTo(72, 222); ctx.lineTo(70, 92); ctx.quadraticCurveTo(128, 34, 186, 92); ctx.lineTo(184, 222); ctx.closePath(); ctx.fill();
    ctx.fillStyle = gradient(ctx, 90, 60, 170, 220, [[0, '#b9b6ac'], [1, '#86837a']]);
    ctx.beginPath(); ctx.arc(128, 96, 22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(128, 70, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(100, 128); ctx.quadraticCurveTo(128, 112, 156, 128); ctx.lineTo(164, 186); ctx.quadraticCurveTo(128, 196, 92, 186); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(128, 196, 58, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4c4a44'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(118, 96); ctx.lineTo(124, 96); ctx.moveTo(132, 96); ctx.lineTo(138, 96); ctx.stroke();
  },
  head(ctx) {
    ctx.fillStyle = gradient(ctx, 40, 20, 220, 200, [[0, '#c98a5a'], [1, '#8d5233']]);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .42; ctx.beginPath(); ctx.ellipse(128 + Math.cos(a) * 82, 116 + Math.sin(a) * 82, 22, 28, a + Math.PI / 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(128, 120, 86, 70, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = radial(ctx, 128, 140, 62, [[0, '#e0a272'], [.7, '#b6744a'], [1, '#86502f']]);
    ctx.beginPath(); ctx.ellipse(128, 146, 50, 64, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(128, 84, 24, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6e3f24';
    ctx.beginPath(); ctx.ellipse(108, 140, 11, 4, 0, 0, Math.PI * 2); ctx.ellipse(148, 140, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(124, 146, 8, 22); ctx.fillRect(114, 184, 28, 5);
  },
  jar(ctx) {
    ctx.fillStyle = radial(ctx, 128, 150, 96, [[0, '#d39563'], [.65, '#a7643c'], [1, '#6f3d22']]);
    ctx.beginPath(); ctx.moveTo(94, 52); ctx.quadraticCurveTo(32, 110, 54, 186); ctx.quadraticCurveTo(78, 244, 128, 244); ctx.quadraticCurveTo(178, 244, 202, 186); ctx.quadraticCurveTo(224, 110, 162, 52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = gradient(ctx, 70, 20, 186, 60, [[0, '#b97a4c'], [1, '#7e4628']]);
    ctx.beginPath(); ctx.ellipse(128, 46, 62, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a4e2e'; ctx.beginPath(); ctx.ellipse(128, 32, 36, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7b4426aa'; ctx.lineWidth = 3;
    for (const y of [104, 118]) { ctx.beginPath(); ctx.ellipse(128, y, 70, 12, 0, 0, Math.PI); ctx.stroke(); }
  },
  linga(ctx) {
    ctx.fillStyle = gradient(ctx, 20, 120, 240, 240, [[0, '#9a9488'], [1, '#5f5a50']]);
    ctx.beginPath(); ctx.moveTo(30, 150); ctx.lineTo(196, 150); ctx.lineTo(196, 128); ctx.lineTo(244, 136); ctx.lineTo(244, 162); ctx.lineTo(196, 172); ctx.lineTo(196, 230); ctx.lineTo(30, 230); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7b766b'; ctx.fillRect(30, 140, 166, 16);
    ctx.fillStyle = gradient(ctx, 80, 0, 176, 0, [[0, '#6f7a72'], [.45, '#9faa9f'], [1, '#56605a']]);
    ctx.beginPath(); ctx.moveTo(84, 148); ctx.lineTo(84, 60); ctx.quadraticCurveTo(113, 14, 142, 60); ctx.lineTo(142, 148); ctx.closePath(); ctx.fill();
  },
  beads(ctx) {
    const colors = ['#2f8f8a', '#c2442f', '#e2b13c', '#3b5bb5', '#7a3c8f', '#e8e0c8', '#d9792b', '#1d6b4b'];
    let s = 9; const rnd = () => ((s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296);
    for (let i = 0; i < 26; i++) {
      const a = i * .52, r = 30 + i * 3.4, x = 128 + Math.cos(a) * r * .9, y = 128 + Math.sin(a) * r * .9, size = 8 + rnd() * 9;
      ctx.fillStyle = radial(ctx, x, y, size, [[0, '#ffffffcc'], [.25, colors[i % colors.length]], [1, '#00000088']]);
      ctx.beginPath(); ctx.ellipse(x, y, size, size * (.75 + rnd() * .3), a, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#00000055'; ctx.beginPath(); ctx.arc(x, y, size * .25, 0, Math.PI * 2); ctx.fill();
    }
  },
};

export function drawPlaceholder(kind, size = ATLAS_SLOT) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d'); ctx.scale(size / 256, size / 256);
  (DRAW[kind] || DRAW.jar)(ctx);
  return canvas;
}

function loadImage(url) {
  if (cache.has(url)) return cache.get(url);
  const promise = new Promise(resolve => {
    const image = new Image(); image.decoding = 'async';
    image.onload = () => resolve(image); image.onerror = () => resolve(null);
    image.src = url;
  });
  cache.set(url, promise);
  return promise;
}

// Resolves the picture for a find: the configured WebP, or a placeholder if it is missing.
export async function findPicture(id) {
  const url = imageURL(id), image = url ? await loadImage(url) : null;
  return image ? { source: image, placeholder: false, url } : { source: drawPlaceholder(FINDS[id]?.kind), placeholder: true, url: null };
}

// One texture holds every illustration so the terrain shader can draw them all.
export async function buildAtlas(finds) {
  const atlas = document.createElement('canvas'); atlas.width = atlas.height = ATLAS_GRID * ATLAS_SLOT;
  const ctx = atlas.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  const slots = [], alphas = [];
  const pictures = await Promise.all(finds.map(f => findPicture(f.id)));
  finds.forEach((find, index) => {
    const slot = index % (ATLAS_GRID * ATLAS_GRID), sx = (slot % ATLAS_GRID) * ATLAS_SLOT, sy = Math.floor(slot / ATLAS_GRID) * ATLAS_SLOT;
    const { source } = pictures[index], w = source.width, h = source.height, scale = Math.min(ATLAS_SLOT / w, ATLAS_SLOT / h);
    const dw = w * scale, dh = h * scale;
    ctx.drawImage(source, sx + (ATLAS_SLOT - dw) / 2, sy + (ATLAS_SLOT - dh) / 2, dw, dh);
    slots.push([slot % ATLAS_GRID, Math.floor(slot / ATLAS_GRID)]);
    const sample = document.createElement('canvas'); sample.width = 64; sample.height = 64;
    sample.getContext('2d').drawImage(atlas, sx, sy, ATLAS_SLOT, ATLAS_SLOT, 0, 0, 64, 64);
    alphas.push(sample.getContext('2d').getImageData(0, 0, 64, 64));
  });
  return { atlas, slots, alphas, pictures };
}
