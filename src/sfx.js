// Lightweight SFX player backed by the Web Audio API. Decodes each file once
// and starts an AudioBufferSourceNode per call — much cheaper than allocating
// a new HTMLAudioElement on every play.
//
// Robustness rules:
// - Every known sfx file is eagerly preloaded on module init.
// - If playSfx fires before a buffer has finished decoding, the play is
//   queued (one slot per src, latest wins) and flushed when decode resolves.
// - If the AudioContext is suspended (browser autoplay policy), the play is
//   queued and flushed once the context resumes. We resume on any user
//   gesture and on every playSfx call.
// - Pending plays expire after PLAY_TTL_MS so stale events don't fire late.

const SFX_FILES = [
  "./block.mp3",
  "./buy.mp3",
  "./click.wav",
  "./common.wav",
  "./epic.wav",
  "./event.mp3",
  "./get.wav",
  "./hit.wav",
  "./legendary.wav",
  "./lock.mp3",
  "./open.mp3",
  "./rare.wav",
  "./tick.wav",
  "./trash.wav",
  "./win.wav",
];

const PLAY_TTL_MS = 1500;

let ctx = null;
const bufferCache = {};
const inflight = {};
const pendingPlays = {}; // src -> { volume, expiresAt }

const VOLUME_KEY = "sfxVolume";
let globalVolume = 1;
try {
  const stored = localStorage.getItem(VOLUME_KEY);
  if (stored !== null) {
    const v = parseFloat(stored);
    if (!isNaN(v)) globalVolume = Math.max(0, Math.min(1, v));
  }
} catch (e) {}

export function getSfxVolume() {
  return globalVolume;
}

export function setSfxVolume(v) {
  globalVolume = Math.max(0, Math.min(1, v));
  try {
    localStorage.setItem(VOLUME_KEY, String(globalVolume));
  } catch (e) {}
}

function getCtx() {
  if (ctx) return ctx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

function actuallyPlay(src, volume) {
  const c = getCtx();
  if (!c) return;
  const buf = bufferCache[src];
  if (!buf) return;
  try {
    const source = c.createBufferSource();
    source.buffer = buf;
    const gain = c.createGain();
    gain.gain.value = volume * globalVolume;
    source.connect(gain).connect(c.destination);
    source.start(0);
  } catch (e) {}
}

function queuePending(src, volume) {
  pendingPlays[src] = { volume, expiresAt: Date.now() + PLAY_TTL_MS };
}

function flushPendingFor(src) {
  const p = pendingPlays[src];
  if (!p) return;
  delete pendingPlays[src];
  if (p.expiresAt < Date.now()) return;
  const c = getCtx();
  if (!c || c.state === "suspended") {
    // Re-queue; context wasn't ready yet.
    pendingPlays[src] = p;
    return;
  }
  actuallyPlay(src, p.volume);
}

function flushAllPending() {
  const c = getCtx();
  if (!c || c.state === "suspended") return;
  const now = Date.now();
  for (const src of Object.keys(pendingPlays)) {
    const p = pendingPlays[src];
    delete pendingPlays[src];
    if (p.expiresAt < now) continue;
    if (bufferCache[src]) actuallyPlay(src, p.volume);
    else pendingPlays[src] = p; // still loading; keep it around
  }
}

function loadBuffer(src) {
  if (bufferCache[src]) return Promise.resolve(bufferCache[src]);
  if (inflight[src]) return inflight[src];
  const c = getCtx();
  if (!c) return Promise.resolve(null);
  inflight[src] = fetch(src)
    .then((r) => r.arrayBuffer())
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => {
      bufferCache[src] = buf;
      delete inflight[src];
      flushPendingFor(src);
      return buf;
    })
    .catch(() => {
      delete inflight[src];
      return null;
    });
  return inflight[src];
}

export function preloadSfx(src) {
  loadBuffer(src);
}

export function preloadAllSfx() {
  for (const f of SFX_FILES) loadBuffer(f);
}

function tryResumeAndFlush() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    c.resume().then(flushAllPending).catch(() => {});
  } else {
    flushAllPending();
  }
}

if (typeof window !== "undefined") {
  const gestureEvents = ["pointerdown", "keydown", "touchstart"];
  const onGesture = () => {
    tryResumeAndFlush();
    for (const e of gestureEvents) window.removeEventListener(e, onGesture);
  };
  for (const e of gestureEvents) {
    window.addEventListener(e, onGesture, { passive: true });
  }
  preloadAllSfx();
}

export function playSfx(src, volume = 1) {
  if (globalVolume <= 0) return;
  const c = getCtx();
  if (!c) return;

  const buf = bufferCache[src];
  if (!buf) {
    queuePending(src, volume);
    loadBuffer(src);
    return;
  }
  if (c.state === "suspended") {
    queuePending(src, volume);
    c.resume().then(flushAllPending).catch(() => {});
    return;
  }
  actuallyPlay(src, volume);
}
