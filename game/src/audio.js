// The Gilded Table — synthesized WebAudio sound, no audio files.
let ctx = null;
let muted = false;

function ensureCtx() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  } catch (e) {
    return null;
  }
}

export function setMuted(m) {
  muted = !!m;
}

export function isMuted() {
  return muted;
}

// A short tone: oscillator of the given type, frequency, duration, volume.
function tone(freq, dur, type, vol, when) {
  if (muted) return;
  const c = ensureCtx();
  if (!c) return;
  const t0 = c.currentTime + (when || 0);
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol || 0.05, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  draw() {
    tone(520, 0.12, 'triangle', 0.04);
    tone(660, 0.12, 'triangle', 0.03, 0.05);
  },
  play() {
    tone(440, 0.1, 'square', 0.04);
    tone(550, 0.1, 'square', 0.03, 0.06);
  },
  hit() {
    tone(200, 0.16, 'square', 0.07);
    tone(140, 0.2, 'square', 0.05, 0.04);
  },
  ward() {
    tone(700, 0.14, 'sine', 0.05);
    tone(880, 0.14, 'sine', 0.04, 0.07);
  },
  advantage() {
    tone(660, 0.1, 'triangle', 0.06);
    tone(880, 0.1, 'triangle', 0.06, 0.06);
    tone(1100, 0.16, 'triangle', 0.06, 0.12);
  },
  turn() {
    tone(330, 0.1, 'sine', 0.04);
    tone(440, 0.12, 'sine', 0.04, 0.08);
  },
  win() {
    tone(523, 0.14, 'triangle', 0.07);
    tone(659, 0.14, 'triangle', 0.07, 0.12);
    tone(784, 0.14, 'triangle', 0.07, 0.24);
    tone(1047, 0.3, 'triangle', 0.08, 0.36);
  },
  lose() {
    tone(392, 0.2, 'sawtooth', 0.05);
    tone(330, 0.2, 'sawtooth', 0.05, 0.16);
    tone(262, 0.3, 'sawtooth', 0.05, 0.32);
  },
};