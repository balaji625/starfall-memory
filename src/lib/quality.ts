// Adaptive quality + perf guardrails.
// Measures live FPS, downgrades particle counts / blur / shadow on slow devices,
// and exposes a single hook + cheap helper for components.

import { useEffect, useState } from "react";

export type Quality = "high" | "medium" | "low";

let current: Quality = "high";
let reducedMotion = false;
const listeners = new Set<(q: Quality) => void>();

function detectInitial(): Quality {
  if (typeof window === "undefined") return "high";
  const mem = (navigator as any).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const mobile = /Mobi|Android/i.test(navigator.userAgent);
  if (mem <= 2 || cores <= 2) return "low";
  if (mobile && (mem <= 4 || cores <= 4)) return "medium";
  return "high";
}

function setQuality(q: Quality) {
  if (q === current) return;
  current = q;
  if (typeof document !== "undefined") {
    document.documentElement.dataset.quality = q;
  }
  listeners.forEach((l) => l(q));
}

let started = false;
export function startQualityMonitor() {
  if (started || typeof window === "undefined") return;
  started = true;
  reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (reducedMotion) setQuality("low");
  else setQuality(detectInitial());

  // FPS sampler — adapts after sustained low frame rates, never upgrades aggressively.
  let frames = 0;
  let last = performance.now();
  let lowStreak = 0;
  let raf = 0;
  const tick = () => {
    frames++;
    const now = performance.now();
    if (now - last >= 1000) {
      const fps = (frames * 1000) / (now - last);
      frames = 0;
      last = now;
      if (fps < 35) {
        lowStreak++;
        if (lowStreak >= 2) {
          if (current === "high") setQuality("medium");
          else if (current === "medium") setQuality("low");
          lowStreak = 0;
        }
      } else {
        lowStreak = 0;
      }
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  // Pause monitor when tab hidden — avoids false low-FPS readings.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else {
      last = performance.now();
      frames = 0;
      raf = requestAnimationFrame(tick);
    }
  });
}

export function useQuality(): Quality {
  const [q, setQ] = useState<Quality>(current);
  useEffect(() => {
    setQ(current);
    const l = (next: Quality) => setQ(next);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return q;
}

// Scale a particle/effect count by current quality.
export function scaleCount(n: number, q: Quality = current): number {
  if (q === "low") return Math.max(4, Math.round(n * 0.25));
  if (q === "medium") return Math.max(6, Math.round(n * 0.55));
  return n;
}

export function isReducedMotion() { return reducedMotion; }
export function getQuality() { return current; }
