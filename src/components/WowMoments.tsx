import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { Starfield, FloatingParticles, Petals, StarBurst } from "./Particles";
import { useQuality, scaleCount } from "@/lib/quality";

/**
 * WowMoments — purely additive cinematic surprises layered above everything.
 * Never touches existing scenes. All overlays are dismissable & quality-aware.
 *
 *  ⭐ Falling Star Wish  — tap the streaking star
 *  💫 Memory Orbs        — tap floating orbs for whispered quotes
 *  🌠 Star Rain          — auto-triggers once per session at a calm beat
 *  ❤️ Heartbeat Mode     — long-press anywhere for 5s
 *  📅 Destiny Date Card  — call <DestinyDateCard /> from Scene3 if desired
 *  🌌 Galaxy Spin        — exposed via window event "wow:galaxy-spin"
 */

const ORB_QUOTES = [
  { e: "🌸", t: "Some people make life softer." },
  { e: "🤍", t: "Some people feel like comfort." },
  { e: "🌙", t: "Some people become home." },
  { e: "✨", t: "Some smiles rewrite the universe." },
  { e: "💫", t: "Some memories never leave the heart." },
  { e: "🌷", t: "Some names sound like music." },
];

type Active =
  | null
  | { kind: "wish" }
  | { kind: "orb"; quote: { e: string; t: string }; hue: number }
  | { kind: "rain" }
  | { kind: "heartbeat" }
  | { kind: "spin" };

export function WowMoments({ stage }: { stage: number | string }) {
  const [active, setActive] = useState<Active>(null);
  const [starKey, setStarKey] = useState(0);
  const quality = useQuality();
  const pressTimer = useRef<any>(null);
  const rainShown = useRef(false);

  // Recycle the falling star every ~9-14s when nothing is active
  useEffect(() => {
    if (active?.kind === "wish") return;
    const t = setTimeout(() => setStarKey((k) => k + 1), 9000 + Math.random() * 5000);
    return () => clearTimeout(t);
  }, [starKey, active]);

  // Long-press 5s → heartbeat mode
  useEffect(() => {
    const start = () => {
      if (active) return;
      clearTimeout(pressTimer.current);
      pressTimer.current = setTimeout(() => {
        setActive({ kind: "heartbeat" });
        audio.heartbeat(2);
      }, 5000);
    };
    const end = () => clearTimeout(pressTimer.current);
    window.addEventListener("pointerdown", start);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      clearTimeout(pressTimer.current);
    };
  }, [active]);

  // External triggers
  useEffect(() => {
    const onSpin = () => setActive({ kind: "spin" });
    const onRain = () => {
      if (rainShown.current) return;
      rainShown.current = true;
      setActive({ kind: "rain" });
    };
    window.addEventListener("wow:galaxy-spin", onSpin);
    window.addEventListener("wow:star-rain", onRain);
    return () => {
      window.removeEventListener("wow:galaxy-spin", onSpin);
      window.removeEventListener("wow:star-rain", onRain);
    };
  }, []);

  // One-time star rain on an emotional chapter
  useEffect(() => {
    if (stage === 4 && !rainShown.current && !active) {
      const t = setTimeout(() => {
        rainShown.current = true;
        setActive({ kind: "rain" });
        audio.sparkle();
      }, 8000);
      return () => clearTimeout(t);
    }
  }, [stage, active]);

  // Auto-dismiss timers
  useEffect(() => {
    if (!active) return;
    const dur: Record<string, number> = { wish: 7000, orb: 6000, rain: 12000, heartbeat: 9000, spin: 2200 };
    const t = setTimeout(() => setActive(null), dur[active.kind] ?? 6000);
    return () => clearTimeout(t);
  }, [active]);

  // Memory orbs — 3 floating, recycled positions
  const orbs = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: i,
        left: 14 + i * 30 + Math.random() * 8,
        top: 18 + ((i * 19) % 30),
        hue: [350, 85, 280][i],
        delay: i * 0.7,
        q: ORB_QUOTES[(i * 2) % ORB_QUOTES.length],
      })),
    [stage]
  );

  const dismiss = () => setActive(null);

  return (
    <>
      {/* ── Falling Star (tappable) ─────────────────────────── */}
      {!active && stage !== "gate" && (
        <motion.button
          key={starKey}
          onClick={() => {
            setActive({ kind: "wish" });
            audio.sparkle();
            audio.chime(740);
          }}
          aria-label="make a wish"
          initial={{ x: "-10vw", y: "10vh", opacity: 0, rotate: 35 }}
          animate={{ x: "110vw", y: "60vh", opacity: [0, 1, 1, 0], rotate: 35 }}
          transition={{ duration: 3.8, ease: "easeOut" }}
          className="fixed top-0 left-0 z-[55] pointer-events-auto"
          style={{ width: 6, height: 6 }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: "oklch(0.98 0.05 85)",
              boxShadow:
                "0 0 20px oklch(0.95 0.18 85), -40px 12px 60px oklch(0.95 0.18 85 / 0.35), -80px 24px 100px oklch(0.95 0.18 85 / 0.15)",
            }}
          />
        </motion.button>
      )}

      {/* ── Memory Orbs ─────────────────────────────────────── */}
      {!active && stage !== "gate" && (
        <div className="pointer-events-none fixed inset-0 z-[56]">
          {orbs.map((o) => (
            <motion.button
              key={o.id}
              onClick={(e) => {
                e.stopPropagation();
                setActive({ kind: "orb", quote: o.q, hue: o.hue });
                audio.chime(523 + o.id * 90);
              }}
              aria-label="memory orb"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [-8, 8, -8], opacity: 0.7 }}
              transition={{ delay: o.delay, duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-auto absolute rounded-full"
              style={{
                left: `${o.left}%`,
                top: `${o.top}%`,
                width: 18,
                height: 18,
                background: `radial-gradient(circle, oklch(0.95 0.18 ${o.hue} / 0.9), oklch(0.7 0.15 ${o.hue} / 0.3) 60%, transparent)`,
                boxShadow: `0 0 30px oklch(0.9 0.18 ${o.hue} / 0.7)`,
              }}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {/* ── Wish overlay ──────────────────────────────────── */}
        {active?.kind === "wish" && (
          <motion.div
            key="wish"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            onClick={dismiss}
            className="fixed inset-0 z-[72] cursor-pointer"
            style={{ background: "radial-gradient(circle, oklch(0.06 0.04 280 / 0.9), black)" }}
          >
            <Starfield count={scaleCount(220, quality)} />
            <div className="absolute inset-0 flex items-center justify-center">
              <StarBurst x={0} y={0} n={60} />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.8 }}
              className="absolute bottom-24 inset-x-0 text-center px-6"
            >
              <div className="text-4xl mb-3">🌠</div>
              <div
                className="font-script text-3xl md:text-5xl text-[oklch(0.95_0.15_85)]"
                style={{ textShadow: "0 0 30px oklch(0.95 0.18 85 / 0.8)" }}
              >
                "Some wishes quietly become reality."
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Orb quote overlay ─────────────────────────────── */}
        {active?.kind === "orb" && (
          <motion.div
            key="orb"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            onClick={dismiss}
            className="fixed inset-0 z-[72] cursor-pointer flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at center, oklch(0.12 0.08 ${active.hue} / 0.85), black 80%)`,
              backdropFilter: "blur(8px)",
            }}
          >
            <FloatingParticles count={scaleCount(30, quality)} />
            <div className="text-center px-8 max-w-2xl">
              <div className="text-6xl mb-6">{active.quote.e}</div>
              <div
                className="font-script text-3xl md:text-5xl text-[oklch(0.95_0.12_85)]"
                style={{ textShadow: `0 0 30px oklch(0.95 0.18 ${active.hue} / 0.7)` }}
              >
                "{active.quote.t}"
              </div>
              <div className="mt-8 text-[10px] tracking-[0.4em] font-display text-white/40">TAP TO RETURN</div>
            </div>
          </motion.div>
        )}

        {/* ── Star Rain ────────────────────────────────────── */}
        {active?.kind === "rain" && (
          <motion.div
            key="rain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            onClick={dismiss}
            className="fixed inset-0 z-[64] cursor-pointer overflow-hidden"
            style={{ background: "radial-gradient(ellipse at top, oklch(0.06 0.04 280 / 0.7), transparent)" }}
          >
            {Array.from({ length: scaleCount(40, quality) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -40, x: `${Math.random() * 100}vw`, opacity: 0 }}
                animate={{ y: "110vh", opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  delay: Math.random() * 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-[3px] h-[18px] rounded-full"
                style={{
                  background: "linear-gradient(to bottom, oklch(0.98 0.05 85), transparent)",
                  boxShadow: "0 0 10px oklch(0.95 0.18 85 / 0.8)",
                }}
              />
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 2 }}
              className="absolute bottom-16 inset-x-0 text-center px-6"
            >
              <div
                className="font-script text-2xl md:text-4xl text-[oklch(0.95_0.12_85)]"
                style={{ textShadow: "0 0 30px oklch(0.95 0.18 85 / 0.7)" }}
              >
                "the sky is whispering your name tonight."
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Heartbeat Mode ──────────────────────────────── */}
        {active?.kind === "heartbeat" && (
          <motion.div
            key="hb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-[72] cursor-pointer flex items-center justify-center"
            style={{ background: "radial-gradient(circle, oklch(0.1 0.08 20 / 0.85), black)" }}
          >
            <motion.div
              className="absolute w-72 h-72 rounded-full"
              animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ background: "radial-gradient(circle, oklch(0.7 0.2 25 / 0.7), transparent 65%)" }}
            />
            <div className="relative text-center px-6">
              <div className="text-6xl mb-4">❤️</div>
              <div
                className="font-script text-3xl md:text-5xl text-[oklch(0.95_0.12_30)]"
                style={{ textShadow: "0 0 30px oklch(0.85 0.2 25 / 0.9)" }}
              >
                "Some people become important silently."
              </div>
              <div className="mt-8 text-[10px] tracking-[0.4em] font-display text-white/40">TAP TO RETURN</div>
            </div>
          </motion.div>
        )}

        {/* ── Galaxy Spin Transition ───────────────────────── */}
        {active?.kind === "spin" && (
          <motion.div
            key="spin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[80] pointer-events-none"
            style={{ background: "black" }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ rotate: 0, scale: 1.2, opacity: 0 }}
              animate={{ rotate: 360, scale: 2.2, opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              style={{
                background:
                  "conic-gradient(from 0deg, transparent, oklch(0.95 0.18 85 / 0.6), transparent 30%, oklch(0.7 0.2 280 / 0.5), transparent 70%)",
              }}
            />
            <Starfield count={scaleCount(300, quality)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Cinematic glassmorphism date card. Drop into Scene3Destiny if desired.
 * Currently used as a passive prop-less overlay when stage===3.
 */
export function DestinyDateCard() {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0, scale: 0.92 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 2, ease: "easeOut" }}
      className="pointer-events-none fixed bottom-8 left-1/2 -translate-x-1/2 z-[59]"
    >
      <div
        className="px-8 py-4 rounded-2xl backdrop-blur-xl border border-white/20"
        style={{
          background: "linear-gradient(135deg, oklch(0.15 0.08 320 / 0.5), oklch(0.1 0.05 280 / 0.4))",
          boxShadow: "0 0 60px oklch(0.95 0.18 85 / 0.25), inset 0 1px 0 oklch(1 0 0 / 0.2)",
        }}
      >
        <div className="text-[9px] tracking-[0.5em] font-display text-white/50 text-center mb-1">THE DAY DESTINY ARRIVED</div>
        <div
          className="font-display text-xl md:text-2xl tracking-[0.35em] text-center text-shimmer"
          style={{ textShadow: "0 0 20px oklch(0.95 0.18 85 / 0.6)" }}
        >
          ✨ 10 · JULY · 2023 ✨
        </div>
      </div>
    </motion.div>
  );
}
