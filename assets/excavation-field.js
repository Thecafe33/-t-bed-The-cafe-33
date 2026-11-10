// Simulated excavation trench. Soil layers, depths and scale are a teaching model,
// not the stratigraphy of any real Óc Eo site. Units are simulated metres.
export const CELLS_PER_METER = 56;
// depth 1 = untouched surface, 0 = bottom of the trench.
export const LAYER = { topsoil: 0.62, find: 0.3 };
export const TOOLS = {
  shovel: { radius: 0.3, rate: 0.3, floor: 0.45 },
  trowel: { radius: 0.17, rate: 0.2, floorOnFind: 0.17 },
  pick: { radius: 0.075, rate: 0.17, floorOnFind: 0.03 },
  brush: { radius: 0.18 },
  blower: { radius: 0.26 },
};
export const DIGGING_TOOLS = Object.keys(TOOLS);
const BEAD_LEVEL = 0.5, BEAD_RADIUS = 0.32, EXPOSED = 0.85;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Value noise: ragged, lumpy edges so every stroke leaves its own irregular mark.
const hash2 = (x, y, s = 0) => { const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); };
function valueNoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function segmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, length = dx * dx + dy * dy;
  const k = length ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / length, 0, 1) : 0;
  return Math.hypot(p.x - (a.x + dx * k), p.y - (a.y + dy * k));
}

export function squareName(x, y) {
  return `${String.fromCharCode(65 + clamp(Math.floor(x), 0, 25))}${Math.floor(y) + 1}`;
}

// Random, non-overlapping positions. Nothing in the placement is shown to the player.
export function placeFinds(site, catalog, random = Math.random) {
  const placed = [], margin = 0.55;
  const fits = (x, y, r) => placed.every(p => Math.hypot(p.x - x, p.y - y) > r + p.r + 0.35);
  for (const id of site.finds) {
    const spec = catalog[id];
    if (!spec) continue;
    const r = spec.small ? BEAD_RADIUS : spec.size * 0.62;
    let x = site.cols / 2, y = site.rows / 2;
    for (let attempt = 0; attempt < 400; attempt++) {
      const cx = margin + r + random() * (site.cols - 2 * (margin + r));
      const cy = margin + r + random() * (site.rows - 2 * (margin + r));
      x = cx; y = cy;
      if (fits(cx, cy, r)) break;
    }
    placed.push({ id, kind: spec.kind, small: !!spec.small, fragile: !!spec.fragile, size: spec.size || 0, x, y, r, angle: spec.small ? 0 : (random() - 0.5) * 0.9 });
  }
  return placed.map(({ r, ...find }) => find);
}

export class ExcavationField {
  // alphaFor(find) → {data,width,height} RGBA sample of the illustration, or null for an ellipse.
  constructor(site, finds, alphaFor = () => null) {
    this.site = site;
    this.cols = site.cols * CELLS_PER_METER;
    this.rows = site.rows * CELLS_PER_METER;
    const count = this.cols * this.rows;
    this.depth = new Float32Array(count).fill(1);
    this.dust = new Float32Array(count).fill(1);
    this.damage = new Float32Array(count);
    this.owner = new Uint8Array(count);
    this.stamp = new Uint32Array(count); this.stroke = 0;
    this.pixels = new Uint8Array(count * 4);
    this.finds = finds.map(f => ({ ...f, status: 'buried', cells: 0, origin: null, hits: 0 }));
    this.bucket = { soil: 0, finds: [] };
    this.damageEvents = 0;
    this.revision = 0;
    this.finds.forEach((find, index) => {
      if (find.small) return;
      const alpha = alphaFor(find), cos = Math.cos(-find.angle), sin = Math.sin(-find.angle), half = find.size * 0.75;
      const x0 = clamp(Math.floor((find.x - half) * CELLS_PER_METER), 0, this.cols - 1), x1 = clamp(Math.ceil((find.x + half) * CELLS_PER_METER), 0, this.cols - 1);
      const y0 = clamp(Math.floor((find.y - half) * CELLS_PER_METER), 0, this.rows - 1), y1 = clamp(Math.ceil((find.y + half) * CELLS_PER_METER), 0, this.rows - 1);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5) / CELLS_PER_METER - find.x, dy = (y + 0.5) / CELLS_PER_METER - find.y;
        const u = (dx * cos - dy * sin) / find.size + 0.5, v = (dx * sin + dy * cos) / find.size + 0.5;
        if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
        const hit = alpha
          ? alpha.data[(Math.floor(v * alpha.height) * alpha.width + Math.floor(u * alpha.width)) * 4 + 3] > 90
          : (u - 0.5) ** 2 + (v - 0.5) ** 2 < 0.16;
        if (hit && !this.owner[y * this.cols + x]) { this.owner[y * this.cols + x] = index + 1; find.cells++; }
      }
    });
    this.dirty = { x0: 0, y0: 0, x1: this.cols - 1, y1: this.rows - 1 };
    this.updatePixels();
  }
  get widthM() { return this.site.cols; }
  get heightM() { return this.site.rows; }
  // Each find can cost at most 12 points, so one slip never ends the run.
  get conservation() { return Math.max(0, 100 - this.finds.reduce((sum, f) => sum + Math.min(f.hits, 4) * 3, 0)); }
  index(x, y) { return clamp(Math.floor(y * CELLS_PER_METER), 0, this.rows - 1) * this.cols + clamp(Math.floor(x * CELLS_PER_METER), 0, this.cols - 1); }
  depthAt(x, y) { return this.depth[this.index(x, y)]; }
  updatePixels(region = this.dirty) {
    if (!region) return;
    for (let y = region.y0; y <= region.y1; y++) for (let x = region.x0; x <= region.x1; x++) {
      const i = y * this.cols + x, p = i * 4;
      this.pixels[p] = Math.round(this.depth[i] * 255);
      this.pixels[p + 1] = Math.round(this.dust[i] * 255);
      this.pixels[p + 2] = this.owner[i] ? 255 : 0;
      this.pixels[p + 3] = Math.round(Math.min(1, this.damage[i]) * 255);
    }
    this.revision++;
  }
  progressOf(index) {
    const find = this.finds[index];
    if (!find || find.small || !find.cells) return 0;
    let clear = 0;
    for (let i = 0; i < this.owner.length; i++) if (this.owner[i] === index + 1 && this.depth[i] < 0.06 && this.dust[i] < 0.14) clear++;
    return clear / find.cells;
  }
  // Applies one stroke between two points (metres). Returns what happened for feedback.
  apply(tool, from, to) {
    const spec = TOOLS[tool], result = { changed: false, contact: false, damaged: false, removed: 0, exposed: [], bucketed: [] };
    if (!spec) return result;
    const radius = spec.radius, step = radius * 0.45;
    const distance = Math.hypot(to.x - from.x, to.y - from.y), steps = Math.max(1, Math.ceil(distance / step));
    const strength = distance === 0 ? 0.3 : Math.min(1, distance / step / steps);
    const region = { x0: this.cols, y0: this.rows, x1: -1, y1: -1 };
    const touched = new Set(), scratched = new Set(), stroke = ++this.stroke;
    for (let s = 1; s <= steps; s++) {
      const px = from.x + (to.x - from.x) * s / steps, py = from.y + (to.y - from.y) * s / steps;
      const reach = radius * 1.32;
      const x0 = clamp(Math.floor((px - reach) * CELLS_PER_METER), 0, this.cols - 1), x1 = clamp(Math.ceil((px + reach) * CELLS_PER_METER), 0, this.cols - 1);
      const y0 = clamp(Math.floor((py - reach) * CELLS_PER_METER), 0, this.rows - 1), y1 = clamp(Math.ceil((py + reach) * CELLS_PER_METER), 0, this.rows - 1);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        // Edge radius wobbles with ground noise and per-stroke jitter, so marks follow the hand, not a stamp.
        const wobble = 0.72 + 0.5 * valueNoise(x * 0.16, y * 0.16, 1) + 0.18 * (valueNoise(x * 0.45, y * 0.45, stroke % 97) - 0.5);
        const d = Math.hypot((x + 0.5) / CELLS_PER_METER - px, (y + 0.5) / CELLS_PER_METER - py) / (radius * wobble);
        if (d >= 1) continue;
        const clump = 0.6 + 0.8 * valueNoise(x * 0.22, y * 0.22, stroke % 13);
        const i = y * this.cols + x, weight = (1 - d * d) * strength * clump, owner = this.owner[i];
        const find = owner ? this.finds[owner - 1] : null, oldDepth = this.depth[i], oldDust = this.dust[i];
        // Damage depends on the ground before this stroke, not on overlapping steps within it.
        const first = this.stamp[i] !== stroke; if (first) this.stamp[i] = stroke;
        if (tool === 'shovel') {
          if (find && first && oldDepth <= spec.floor + 0.002) { this.damage[i] = Math.min(1, this.damage[i] + 0.5 * weight); result.damaged = true; result.contact = true; scratched.add(owner - 1); }
          if (oldDepth > spec.floor) this.depth[i] = Math.max(spec.floor, oldDepth - spec.rate * weight);
        } else if (tool === 'trowel' || tool === 'pick') {
          const floor = find ? spec.floorOnFind : 0;
          if (oldDepth > floor) this.depth[i] = Math.max(floor, oldDepth - spec.rate * weight);
          if (find && this.depth[i] < LAYER.find) {
            result.contact = true;
            if (tool === 'trowel' && find.fragile && first && oldDepth <= 0.2) { this.damage[i] = Math.min(1, this.damage[i] + 0.35 * weight); result.damaged = true; scratched.add(owner - 1); }
            if (tool === 'pick') this.dust[i] = Math.max(0, this.dust[i] - 0.05 * weight);
          }
        } else if (tool === 'brush') {
          if (oldDepth < 0.32) {
            this.depth[i] = Math.max(0, oldDepth - 0.1 * weight);
            this.dust[i] = Math.max(0, oldDust - 0.24 * weight);
          }
        } else if (tool === 'blower') {
          if (oldDepth < 0.24) this.dust[i] = Math.max(0, oldDust - 0.2 * weight);
        }
        const removed = oldDepth - this.depth[i];
        if (removed > 0.0001 || oldDust - this.dust[i] > 0.0001) {
          result.changed = true; result.removed += removed;
          if (x < region.x0) region.x0 = x; if (x > region.x1) region.x1 = x;
          if (y < region.y0) region.y0 = y; if (y > region.y1) region.y1 = y;
          if (owner) touched.add(owner - 1);
        }
      }
    }
    if (result.damaged) this.damageEvents++;
    for (const index of scratched) this.finds[index].hits++;
    if (result.removed > 0) this.bucket.soil += result.removed / (CELLS_PER_METER * CELLS_PER_METER) * 30; // game litres, scaled down for play
    // Glass beads leave the trench inside the excavated soil and wait for the sieve.
    this.finds.forEach(find => {
      if (!find.small || find.status !== 'buried') return;
      if (segmentDistance(find, from, to) > BEAD_RADIUS + radius) return;
      let low = 0, total = 0;
      for (let a = 0; a < 12; a++) {
        const r = BEAD_RADIUS * (0.35 + (a % 3) * 0.3), angle = a * 2.39;
        total++; if (this.depthAt(clamp(find.x + Math.cos(angle) * r, 0, this.widthM - 0.001), clamp(find.y + Math.sin(angle) * r, 0, this.heightM - 0.001)) < BEAD_LEVEL) low++;
      }
      if (low / total >= 0.5) {
        find.status = 'bucket'; find.origin = squareName(find.x, find.y);
        this.bucket.finds.push(this.finds.indexOf(find)); result.bucketed.push(this.finds.indexOf(find));
      }
    });
    for (const index of touched) {
      const find = this.finds[index];
      if (find.status === 'buried' && this.progressOf(index) >= EXPOSED) { find.status = 'exposed'; find.origin = squareName(find.x, find.y); result.exposed.push(index); }
    }
    if (result.changed) this.updatePixels(region);
    return result;
  }
  // One shake of the sieve. Returns finds that appear once the soil has passed through.
  sieve(amount = 1) {
    if (this.bucket.soil <= 0 && !this.bucket.finds.length) return { soil: 0, revealed: [] };
    this.bucket.soil = Math.max(0, this.bucket.soil - amount);
    if (this.bucket.soil > 0) return { soil: this.bucket.soil, revealed: [] };
    const revealed = this.bucket.finds.splice(0);
    for (const index of revealed) this.finds[index].status = 'sieved';
    return { soil: 0, revealed };
  }
  findAt(x, y, statuses = ['exposed']) {
    let best = -1, distance = Infinity;
    this.finds.forEach((find, index) => {
      if (find.small || !statuses.includes(find.status)) return;
      const d = Math.hypot(find.x - x, find.y - y);
      if (d < find.size * 0.7 && d < distance) { best = index; distance = d; }
    });
    return best;
  }
  record(index) {
    const find = this.finds[index];
    if (!find || !['exposed', 'sieved'].includes(find.status)) return null;
    find.status = 'recorded';
    return { id: find.id, square: find.origin || squareName(find.x, find.y), small: find.small };
  }
  get recorded() { return this.finds.filter(f => f.status === 'recorded').length; }
  get complete() { return this.finds.length > 0 && this.recorded === this.finds.length; }
}
