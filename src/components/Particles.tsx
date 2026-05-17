import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export function Starfield({ count = 120, className = "" }: { count?: number; className?: string }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 2 + 0.5,
        d: Math.random() * 3,
      })),
    [count],
  );
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white anim-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            animationDelay: `${s.d}s`,
            boxShadow: `0 0 ${s.s * 3}px white`,
          }}
        />
      ))}
    </div>
  );
}

export function FloatingParticles({ count = 30, color = "var(--moonglow)", className = "" }: { count?: number; color?: string; className?: string }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        dur: 8 + Math.random() * 8,
        size: Math.random() * 4 + 2,
      })),
    [count],
  );
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {items.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: -10,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
          animate={{ y: [0, -(typeof window !== "undefined" ? window.innerHeight : 800) - 50], opacity: [0, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

export function Petals({ count = 18, className = "" }: { count?: number; className?: string }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        dur: 12 + Math.random() * 8,
        rot: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
      })),
    [count],
  );
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {items.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: -20, transform: `scale(${p.scale})` }}
          animate={{ y: [0, (typeof window !== "undefined" ? window.innerHeight : 800) + 40], rotate: [p.rot, p.rot + 360], x: [0, Math.sin(p.id) * 80, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M9 1 Q14 6 9 17 Q4 6 9 1 Z" fill="oklch(0.88 0.1 350)" opacity="0.85" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export function StarBurst({ x, y, n = 30 }: { x: number; y: number; n?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        id: i,
        a: (i / n) * Math.PI * 2,
        d: 80 + Math.random() * 160,
      })),
    [n, x, y],
  );
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {bits.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full bg-white"
          style={{ width: 4, height: 4, boxShadow: "0 0 8px white" }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: Math.cos(b.a) * b.d, y: Math.sin(b.a) * b.d, opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function useShake(onShake: () => void) {
  const last = useRef({ x: 0, y: 0, z: 0, t: 0 });
  useEffect(() => {
    const h = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const now = Date.now();
      if (now - last.current.t < 200) return;
      const dx = (a.x ?? 0) - last.current.x;
      const dy = (a.y ?? 0) - last.current.y;
      const dz = (a.z ?? 0) - last.current.z;
      const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (mag > 18) onShake();
      last.current = { x: a.x ?? 0, y: a.y ?? 0, z: a.z ?? 0, t: now };
    };
    window.addEventListener("devicemotion", h);
    return () => window.removeEventListener("devicemotion", h);
  }, [onShake]);
}

export function useSwipe(onUp: () => void, onDown: () => void) {
  useEffect(() => {
    let startY = 0;
    const ts = (e: TouchEvent) => (startY = e.touches[0].clientY);
    const te = (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - startY;
      if (dy < -60) onUp();
      else if (dy > 60) onDown();
    };
    window.addEventListener("touchstart", ts);
    window.addEventListener("touchend", te);
    let startWY = 0, accW = 0, tWheel: any;
    const wh = (e: WheelEvent) => {
      accW += e.deltaY;
      clearTimeout(tWheel);
      tWheel = setTimeout(() => {
        if (accW < -100) onUp();
        else if (accW > 100) onDown();
        accW = 0;
      }, 80);
    };
    window.addEventListener("wheel", wh);
    return () => {
      window.removeEventListener("touchstart", ts);
      window.removeEventListener("touchend", te);
      window.removeEventListener("wheel", wh);
    };
  }, [onUp, onDown]);
}
