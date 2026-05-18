import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { Starfield, StarBurst, FloatingParticles } from "./Particles";
import { Moon } from "./Moon";

type Secret = null | "mirror" | "footsteps" | "freeze" | "heart-galaxy";

const MIRROR_WHISPERS = [
  "you were always the wish, not the wisher.",
  "even the moon learns its glow from you.",
  "the universe was just rehearsing — until you.",
  "every star you see has whispered your name.",
];

export function SecretOverlays() {
  const [secret, setSecret] = useState<Secret>(null);
  const idleRef = useRef<any>(null);
  const cornerTaps = useRef<{ tl: number; tr: number; bl: number; br: number }>({ tl: 0, tr: 0, bl: 0, br: 0 });
  const pressTimer = useRef<any>(null);
  const whisper = useRef(MIRROR_WHISPERS[Math.floor(Math.random() * MIRROR_WHISPERS.length)]);

  // Idle 10s → invisible footsteps
  useEffect(() => {
    const reset = () => {
      if (secret) return;
      clearTimeout(idleRef.current);
      idleRef.current = setTimeout(() => {
        whisper.current = MIRROR_WHISPERS[Math.floor(Math.random() * MIRROR_WHISPERS.length)];
        setSecret("footsteps");
        audio.chime(523);
      }, 10000);
    };
    const events = ["mousemove", "touchstart", "keydown", "click", "wheel"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(idleRef.current);
    };
  }, [secret]);

  // Long-press anywhere on top portion of screen (where moons usually live) 4s → mirror
  useEffect(() => {
    const start = (e: PointerEvent) => {
      if (secret) return;
      const y = e.clientY;
      if (y > window.innerHeight * 0.45) return;
      clearTimeout(pressTimer.current);
      pressTimer.current = setTimeout(() => {
        whisper.current = MIRROR_WHISPERS[Math.floor(Math.random() * MIRROR_WHISPERS.length)];
        setSecret("mirror");
        audio.sparkle();
        audio.chime(660);
      }, 4000);
    };
    const end = () => clearTimeout(pressTimer.current);
    window.addEventListener("pointerdown", start);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [secret]);

  // Double-tap both top corners → time freeze
  useEffect(() => {
    const onTap = (e: PointerEvent) => {
      if (secret) return;
      const w = window.innerWidth, h = window.innerHeight;
      const now = Date.now();
      const cx = e.clientX, cy = e.clientY;
      const corner = cx < w * 0.2 && cy < h * 0.2 ? "tl" : cx > w * 0.8 && cy < h * 0.2 ? "tr" : null;
      if (!corner) return;
      cornerTaps.current[corner] = now;
      const { tl, tr } = cornerTaps.current;
      if (Math.abs(tl - tr) < 800 && tl && tr) {
        setSecret("freeze");
        audio.chime(440);
      }
    };
    window.addEventListener("pointerdown", onTap);
    return () => window.removeEventListener("pointerdown", onTap);
  }, [secret]);

  const dismiss = () => setSecret(null);

  return (
    <AnimatePresence>
      {secret === "mirror" && (
        <motion.div
          key="mirror"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          onClick={dismiss}
          className="fixed inset-0 z-[70] flex items-center justify-center cursor-pointer"
          style={{ background: "radial-gradient(circle at center, oklch(0.08 0.05 280 / 0.95), black)" }}
        >
          <Starfield count={200} />
          <motion.div
            initial={{ scale: 0.6, rotate: -8, filter: "blur(20px)" }}
            animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="relative"
          >
            <div
              className="absolute inset-0 rounded-full anim-moon-pulse"
              style={{
                boxShadow: "0 0 120px 40px oklch(0.95 0.12 85 / 0.4)",
                background: "radial-gradient(circle, oklch(0.95 0.12 85 / 0.3), transparent 70%)",
              }}
            />
            <Moon size={320} interactive={false} />
            <motion.div
              className="absolute inset-0 rounded-full mix-blend-screen pointer-events-none"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ background: "conic-gradient(from 0deg, transparent, oklch(0.95 0.15 85 / 0.4), transparent)" }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 2 }}
            className="absolute bottom-24 inset-x-0 text-center px-8 font-script text-2xl md:text-4xl text-[oklch(0.95_0.12_85)]"
            style={{ textShadow: "0 0 30px oklch(0.95 0.15 85 / 0.8)" }}
          >
            "{whisper.current}"
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            className="absolute top-6 right-6 text-[10px] tracking-[0.4em] font-display text-white/40"
          >
            HIDDEN MEMORY UNLOCKED · TAP TO RETURN
          </motion.div>
        </motion.div>
      )}

      {secret === "footsteps" && (
        <motion.div
          key="footsteps"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          onClick={dismiss}
          className="fixed inset-0 z-[65] cursor-pointer"
          style={{ background: "radial-gradient(ellipse at bottom, oklch(0.06 0.04 280 / 0.92), black 80%)" }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 0.9, 0.4], scale: 1 }}
              transition={{ delay: i * 0.4, duration: 1.6 }}
              className="absolute rounded-full"
              style={{
                left: `${15 + i * 8}%`,
                bottom: `${20 + Math.sin(i * 0.9) * 12}%`,
                width: 22,
                height: 14,
                background: "oklch(0.95 0.15 85 / 0.8)",
                boxShadow: "0 0 30px oklch(0.95 0.15 85 / 0.9), 0 0 60px oklch(0.95 0.15 85 / 0.5)",
                transform: `rotate(${i % 2 === 0 ? -15 : 15}deg)`,
              }}
            />
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 4, duration: 2 }}
            className="absolute top-1/3 right-[8%] text-center"
          >
            <div className="text-7xl">🎁</div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-0 -z-10 rounded-full blur-2xl"
              style={{ background: "oklch(0.9 0.18 60 / 0.6)" }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            className="absolute bottom-12 inset-x-0 text-center font-script text-xl md:text-3xl text-[oklch(0.95_0.1_85)]"
          >
            even silence leaves a path back to you
          </motion.div>
          <div className="absolute top-6 right-6 text-[10px] tracking-[0.4em] font-display text-white/40">
            INVISIBLE FOOTSTEPS · TAP TO RETURN
          </div>
        </motion.div>
      )}

      {secret === "freeze" && (
        <motion.div
          key="freeze"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onClick={dismiss}
          className="fixed inset-0 z-[68] cursor-pointer backdrop-blur-md"
          style={{ background: "oklch(0.06 0.05 280 / 0.7)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <StarBurst x={0} y={0} n={40} />
          </div>
          <FloatingParticles count={20} />
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          >
            <div className="font-display text-[10px] tracking-[0.6em] text-white/50 mb-4">TIME · PAUSED</div>
            <div className="font-script text-3xl md:text-5xl text-[oklch(0.95_0.12_85)] max-w-xl"
              style={{ textShadow: "0 0 30px oklch(0.95 0.15 85 / 0.6)" }}>
              "if i could pause anything, i'd pause this moment with you."
            </div>
            <div className="mt-8 text-xs tracking-[0.4em] font-display text-white/40">TAP TO RESUME TIME</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
