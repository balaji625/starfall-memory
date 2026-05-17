// Royalty-free CDN audio (Pixabay / mixkit) + tone generator fallback
let ctx: AudioContext | null = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
};

export const audio = {
  unlocked: false,
  muted: false,
  ambient: null as HTMLAudioElement | null,

  async unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    const c = getCtx();
    if (c && c.state === "suspended") await c.resume();
    this.startAmbient();
  },

  startAmbient() {
    if (this.ambient || typeof window === "undefined") return;
    // Soft ambient pad (royalty-free, Pixabay)
    const a = new Audio("https://cdn.pixabay.com/audio/2022/10/18/audio_31748d3d31.mp3");
    a.loop = true; a.volume = 0.25; a.crossOrigin = "anonymous";
    a.play().catch(() => {});
    this.ambient = a;
  },

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ambient) this.ambient.volume = m ? 0 : 0.25;
  },

  heartbeat(intensity = 1) {
    const c = getCtx(); if (!c || this.muted) return;
    const now = c.currentTime;
    [0, 0.18].forEach((d, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = 55;
      g.gain.setValueAtTime(0, now + d);
      g.gain.linearRampToValueAtTime(0.4 * intensity * (i ? 0.7 : 1), now + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + d + 0.25);
      o.connect(g).connect(c.destination);
      o.start(now + d); o.stop(now + d + 0.3);
    });
  },

  chime(freq = 880) {
    const c = getCtx(); if (!c || this.muted) return;
    const now = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = "triangle"; o.frequency.value = freq;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.18, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    o.connect(g).connect(c.destination);
    o.start(now); o.stop(now + 1.5);
  },

  whoosh() {
    const c = getCtx(); if (!c || this.muted) return;
    const now = c.currentTime;
    const buf = c.createBuffer(1, c.sampleRate * 0.8, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 800;
    const g = c.createGain(); g.gain.value = 0.15;
    s.connect(f).connect(g).connect(c.destination);
    s.start(now);
  },

  sparkle() {
    [1320, 1760, 2200].forEach((f, i) =>
      setTimeout(() => this.chime(f), i * 80)
    );
  },
};
