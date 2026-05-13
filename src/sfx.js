// Lightweight SFX player backed by the Web Audio API. Decodes each file once
// and starts an AudioBufferSourceNode per call — much cheaper than allocating
// a new HTMLAudioElement on every play, which is what was making the tick
// sound jank on mobile.

let ctx = null;
const bufferCache = {};
const inflight = {};

function getCtx() {
  if (ctx) return ctx;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
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

export function playSfx(src, volume = 1) {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const buf = bufferCache[src];
  if (!buf) {
    loadBuffer(src);
    return;
  }
  try {
    const source = c.createBufferSource();
    source.buffer = buf;
    const gain = c.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(c.destination);
    source.start(0);
  } catch (e) {}
}
