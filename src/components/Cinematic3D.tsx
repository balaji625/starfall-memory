// 3D-feeling cinematic layers: gyro/mouse parallax, volumetric god-rays,
// lens flare, film grain, letterbox + chapter cards. Pure CSS/SVG, GPU-friendly.
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuality } from "@/lib/quality";

/* ---------- Parallax 3D wrapper ---------- */
export function Parallax3D({ children, intensity = 14 }: { children: ReactNode; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || typeof window === "undefined") return;
    const el = ref.current; if (!el) return;
    let rx = 0, ry = 0, tx = 0, ty = 0, raf = 0;
    const apply = () => {
      rx += (ty - rx) * 0.08;
      ry += (tx - ry) * 0.08;
      el.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      tx = ((e.clientX / w) - 0.5) * intensity;
      ty = -((e.clientY / h) - 0.5) * intensity;
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-intensity, Math.min(intensity, e.gamma / 4));
      ty = Math.max(-intensity, Math.min(intensity, (e.beta - 45) / 6));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onOrient, { passive: true } as any);
    raf = requestAnimationFrame(apply);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onOrient as any);
      cancelAnimationFrame(raf);
    };
  }, [intensity, reduced]);
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ perspective: 1400 }}>
      <div ref={ref} className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Volumetric god-rays ---------- */
export function GodRays({ origin = "50% 30%", color = "oklch(0.96 0.16 90 / 0.18)" }: { origin?: string; color?: string }) {
  const q = useQuality();
  if (q === "low") return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 mix-blend-screen"
      style={{
        background: `conic-gradient(from 200deg at ${origin}, transparent 0deg, ${color} 6deg, transparent 14deg, ${color} 22deg, transparent 32deg, ${color} 44deg, transparent 60deg, ${color} 78deg, transparent 96deg, transparent 360deg)`,
        maskImage: `radial-gradient(circle at ${origin}, black 0%, transparent 65%)`,
        WebkitMaskImage: `radial-gradient(circle at ${origin}, black 0%, transparent 65%)`,
        animation: "rays-shimmer 14s ease-in-out infinite",
        opacity: 0.7,
      }}
    />
  );
}

/* ---------- Lens flare ---------- */
export function LensFlare({ x = 70, y = 30 }: { x?: number; y?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 mix-blend-screen">
      <div
        className="absolute rounded-full"
        style={{
          left: `${x}%`, top: `${y}%`, width: 380, height: 380, transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, oklch(1 0.18 90 / 0.55), transparent 60%)",
          filter: "blur(8px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: `${100 - x}%`, top: `${100 - y}%`, width: 120, height: 120, transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, oklch(0.9 0.22 25 / 0.35), transparent 70%)",
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}

/* ---------- Film grain + chromatic edges ---------- */
export function FilmGrain() {
  const q = useQuality();
  if (q === "low") return null;
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          animation: "grain-shift 1.2s steps(6) infinite",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 220px 40px oklch(0.05 0.04 280 / 0.85)" }}
      />
    </>
  );
}

/* ---------- Letterbox + chapter card ---------- */
export function ChapterCard({ index, title, subtitle, visible }: {
  index: number; title: string; subtitle?: string; visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`chap-${index}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none fixed inset-0 z-[58] flex items-center justify-center"
        >
          {/* letterbox bars */}
          <motion.div
            initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}
            transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
            className="absolute top-0 left-0 right-0 h-[14vh] bg-black"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
            className="absolute bottom-0 left-0 right-0 h-[14vh] bg-black"
          />
          <motion.div
            initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="relative text-center px-8"
          >
            <div className="font-display text-[10px] tracking-[0.7em] text-[oklch(0.9_0.18_85)]/80 mb-3">
              CHAPTER {String(index).padStart(2, "0")}
            </div>
            <div className="font-script text-5xl md:text-7xl text-shimmer leading-none">{title}</div>
            {subtitle && (
              <div className="mt-4 font-display italic text-sm md:text-base text-white/65 max-w-lg mx-auto">{subtitle}</div>
            )}
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="mx-auto mt-6 h-px w-48 origin-left bg-gradient-to-r from-transparent via-[oklch(0.9_0.18_85)] to-transparent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Hook: cycling chapter cards on stage change ---------- */
export function useChapterCard(stage: any, titles: Record<string, { t: string; s?: string }>) {
  const [visible, setVisible] = useState(false);
  const data = titles[String(stage)];
  useEffect(() => {
    if (!data) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [stage]);
  return { visible: visible && !!data, data };
}
