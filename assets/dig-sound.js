// Game sounds for the excavation field, synthesised locally with Web Audio (no files, no network).
// On by default inside the game, with its own mute toggle. The AudioContext is created only after
// the player touches the field, so nothing plays or allocates audio before a deliberate gesture.
const KEY = 'oceo-dig-sound';
let enabled = true, context = null, master = null, noise = null;
try { enabled = localStorage.getItem(KEY) !== '0'; } catch {}

export const digSoundEnabled = () => enabled;
export function setDigSound(on) { enabled = on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch {} if (on) armDigSound(); }
export function armDigSound() {
  if (!enabled) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext; if (!Audio) return;
    if (!context) { context = new Audio(); master = context.createGain(); master.gain.value = 0.6; master.connect(context.destination); }
    if (context.state === 'suspended') context.resume().catch(() => {});
  } catch {}
}
const ready = () => enabled && context && context.state === 'running';

function tone(freq, at, { dur = 0.32, type = 'sine', gain = 0.12, slide = 1, attack = 0.008 } = {}) {
  const osc = context.createOscillator(), g = context.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, at); if (slide !== 1) osc.frequency.exponentialRampToValueAtTime(freq * slide, at + dur);
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(gain, at + attack); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g); g.connect(master); osc.start(at); osc.stop(at + dur + 0.02);
}
// Marimba-like note: a sine with a short bright overtone.
function mallet(freq, at, gain = 0.14) { tone(freq, at, { dur: 0.42, gain }); tone(freq * 4, at, { dur: 0.08, gain: gain * 0.35 }); }
function hiss(at, { dur = 0.08, from = 900, to = 900, gain = 0.03, type = 'lowpass', q = 0.8 } = {}) {
  if (!noise) { noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.6), context.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const src = context.createBufferSource(), filter = context.createBiquadFilter(), g = context.createGain();
  src.buffer = noise; filter.type = type; filter.Q.value = q; filter.frequency.setValueAtTime(from, at); filter.frequency.exponentialRampToValueAtTime(to, at + dur);
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(gain, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(filter); filter.connect(g); g.connect(master); src.start(at, Math.random() * 0.4); src.stop(at + dur + 0.02);
}

export function digSound(kind, variant = '') {
  if (!ready()) return;
  const now = context.currentTime;
  try {
    if (kind === 'scrape') {
      const map = { shovel: [520, 260, 0.05, 0.11], trowel: [1300, 700, 0.035, 0.07], pick: [2400, 1600, 0.02, 0.05], brush: [3200, 2200, 0.022, 0.09], blower: [1800, 600, 0.03, 0.16] };
      const [from, to, gain, dur] = map[variant] || map.trowel;
      hiss(now, { from, to, gain, dur, type: variant === 'brush' || variant === 'blower' ? 'highpass' : 'bandpass', q: 1.2 });
    } else if (kind === 'blocked') {
      tone(180, now, { dur: 0.12, type: 'triangle', gain: 0.06, slide: 0.8 });
    } else if (kind === 'scratch') {
      tone(1900, now, { dur: 0.16, type: 'sawtooth', gain: 0.025, slide: 0.7 }); hiss(now, { from: 4000, to: 2500, gain: 0.03, dur: 0.12, type: 'bandpass', q: 3 });
    } else if (kind === 'found') {
      // Rising C–E–G–C arpeggio with a sparkle on top.
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => mallet(f, now + i * 0.085, 0.13));
      [2093, 2637, 3136].forEach((f, i) => tone(f, now + 0.36 + i * 0.05, { dur: 0.18, gain: 0.035 }));
    } else if (kind === 'record') {
      hiss(now, { from: 5000, to: 3000, gain: 0.07, dur: 0.035, type: 'highpass' }); hiss(now + 0.06, { from: 3000, to: 1800, gain: 0.05, dur: 0.04, type: 'highpass' });
      mallet(880, now + 0.12, 0.1); mallet(1318.5, now + 0.2, 0.1);
    } else if (kind === 'beads') {
      [2637, 3136, 2349, 3520, 2793].forEach((f, i) => tone(f, now + i * 0.06 + Math.random() * 0.02, { dur: 0.22, gain: 0.04 }));
    } else if (kind === 'complete') {
      [523.25, 659.25, 783.99, 659.25, 783.99, 1046.5].forEach((f, i) => mallet(f, now + i * 0.11, 0.12));
      tone(261.63, now + 0.55, { dur: 0.7, gain: 0.08, type: 'triangle' });
    } else if (kind === 'tap') {
      tone(660, now, { dur: 0.07, gain: 0.05 });
    }
  } catch {}
}
