import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { audio } from "@/lib/audio";
import { Starfield, StarBurst, FloatingParticles, Petals } from "./Particles";
import { Moon } from "./Moon";
import { Character } from "./Character";
import { CinematicCamera } from "./CinematicCamera";
import { useQuality, scaleCount } from "@/lib/quality";

type Secret = null | "mirror" | "footsteps" | "freeze" | "flower-castle" | "star-staircase" | "heart-galaxy";

const MIRROR_WHISPERS = [
  "you were always the wish, not the wisher.",
  "even the moon learns its glow from you.",
  "the universe was just rehearsing — until you.",
  "every star you see has whispered your name.",
];

const STAIR_WORDS = ["Care.", "Trust.", "Memories.", "Smile.", "World."];

export function SecretOverlays() {
  const [secret, setSecret] = useState<Secret>(null);
  const idleRef = useRef<any>(null);
  const cornerTaps = useRef<{ tl: number; tr: number }>({ tl: 0, tr: 0 });
  const pressTimer = useRef<any>(null);
  const flowerTapped = useRef(new Set<number>());
  const whisper = useRef(MIRROR_WHISPERS[Math.floor(Math.random() * MIRROR_WHISPERS.length)]);
  const [stairStep, setStairStep] = useState(0);
  const quality = useQuality();

  // ---- Triggers ----------------------------------------------------------

  // Idle 10s → invisible footsteps
  useEffect(() => {
    const reset = () => {
      if (secret) return;
      clearTimeout(idleRef.current);
      idleRef.current = setTimeout(() => {
        setSecret("footsteps");
        audio.chime(523);
      }, 10000);
    };
    const events = ["mousemove", "touchstart", "keydown", "click", "wheel"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true } as any));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(idleRef.current);
    };
  }, [secret]);

  // Long-press upper screen 4s → mirror
  useEffect(() => {
    const start = (e: PointerEvent) => {
      if (secret) return;
      if (e.clientY > window.innerHeight * 0.45) return;
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
      const corner = e.clientX < w * 0.2 && e.clientY < h * 0.2 ? "tl"
        : e.clientX > w * 0.8 && e.clientY < h * 0.2 ? "tr" : null;
      if (!corner) return;
      cornerTaps.current[corner] = now;
      const { tl, tr } = cornerTaps.current;
      if (tl && tr && Math.abs(tl - tr) < 800) {
        setSecret("freeze");
        audio.chime(440);
      }
    };
    window.addEventListener("pointerdown", onTap);
    return () => window.removeEventListener("pointerdown", onTap);
  }, [secret]);

  // Fast upward swipe → star staircase
  useEffect(() => {
    let startY = 0, startT = 0;
    const ts = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startT = Date.now();
    };
    const te = (e: TouchEvent) => {
      if (secret) return;
      const dy = e.changedTouches[0].clientY - startY;
      const dt = Date.now() - startT;
      const v = -dy / Math.max(dt, 1); // upward velocity
      if (v > 0.9 && -dy > 180) {
        setSecret("star-staircase");
        setStairStep(0);
        audio.chime(528);
      }
    };
    // wheel equivalent for desktop
    let accW = 0, wT: any;
    const wh = (e: WheelEvent) => {
      if (secret) return;
      accW += e.deltaY;
      clearTimeout(wT);
      wT = setTimeout(() => {
        if (accW < -600) {
          setSecret("star-staircase");
          setStairStep(0);
          audio.chime(528);
        }
        accW = 0;
      }, 120);
    };
    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchend", te, { passive: true });
    window.addEventListener("wheel", wh, { passive: true });
    return () => {
      window.removeEventListener("touchstart", ts);
      window.removeEventListener("touchend", te);
      window.removeEventListener("wheel", wh);
    };
  }, [secret]);

  // Walk staircase one step every 1.6s, then stop at the top.
  useEffect(() => {
    if (secret !== "star-staircase") return;
    if (stairStep >= STAIR_WORDS.length) return;
    const t = setTimeout(() => {
      setStairStep((s) => s + 1);
      audio.chime(440 + stairStep * 90);
    }, 1600);
    return () => clearTimeout(t);
  }, [secret, stairStep]);

  // Heart Galaxy — triggered by Scene5Name completing every letter
  useEffect(() => {
    const handler = () => {
      if (secret) return;
      setSecret("heart-galaxy");
      audio.sparkle();
      audio.chime(880);
    };
    window.addEventListener("secret:heart-galaxy", handler as EventListener);
    return () => window.removeEventListener("secret:heart-galaxy", handler as EventListener);
  }, [secret]);

  // Auto-dismiss after each secret has played long enough.
  useEffect(() => {
    if (!secret) return;
    const dur: Record<string, number> = {
      mirror: 9000,
      footsteps: 8500,
      freeze: 7000,
      "flower-castle": 9500,
      "star-staircase": STAIR_WORDS.length * 1600 + 4500,
      "heart-galaxy": 10000,
    };
    const t = setTimeout(() => setSecret(null), dur[secret] ?? 8000);
    return () => clearTimeout(t);
  }, [secret]);

  const dismiss = () => setSecret(null);

  // ---- Hidden interactive flowers (Flower Castle trigger) ----------------
  const flowers = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    id: i,
    left: 6 + (i * 13) + (i % 2 ? 3 : 0),
    top: 35 + Math.sin(i * 1.4) * 25,
  })), []);

  const handleFlower = (id: number) => {
    if (secret) return;
    flowerTapped.current.add(id);
    audio.chime(523 + id * 40);
    if (flowerTapped.current.size >= 7) {
      flowerTapped.current.clear();
      setSecret("flower-castle");
      audio.sparkle();
    }
  };

  return (
    <>
      {/* Subtle hidden flower buds scattered — only visible on close hover */}
      {!secret && (
        <div className="pointer-events-none fixed inset-0 z-[58]">
          {flowers.map((f) => (
            <button
              key={f.id}
              onClick={(e) => { e.stopPropagation(); handleFlower(f.id); }}
              aria-label="hidden flower"
              className="pointer-events-auto absolute w-6 h-6 rounded-full transition-opacity"
              style={{
                left: `${f.left}%`,
                top: `${f.top}%`,
                background: "radial-gradient(circle, oklch(0.9 0.15 350 / 0.35), transparent 70%)",
                opacity: flowerTapped.current.has(f.id) ? 0.85 : 0.18,
              }}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {secret === "mirror" && (
          <motion.div
            key="mirror"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            onClick={dismiss}
            className="fixed inset-0 z-[70] cursor-pointer"
            style={{ background: "radial-gradient(circle at center, oklch(0.08 0.05 280 / 0.95), black)" }}
          >
            <CinematicCamera shot="moon-reflect">
              <Starfield count={scaleCount(200, quality)} />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.6, rotate: -8, filter: "blur(20px)" }}
                  animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 rounded-full anim-moon-pulse"
                    style={{ boxShadow: "0 0 120px 40px oklch(0.95 0.12 85 / 0.4)" }} />
                  <Moon size={320} interactive={false} />
                  <motion.div
                    className="absolute inset-0 rounded-full mix-blend-screen pointer-events-none"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ background: "conic-gradient(from 0deg, transparent, oklch(0.95 0.15 85 / 0.4), transparent)" }}
                  />
                </motion.div>
              </div>
            </CinematicCamera>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 2 }}
              className="absolute bottom-24 inset-x-0 text-center px-8 font-script text-2xl md:text-4xl text-[oklch(0.95_0.12_85)] z-[71]"
              style={{ textShadow: "0 0 30px oklch(0.95 0.15 85 / 0.8)" }}
            >"{whisper.current}"</motion.div>
            <div className="absolute top-6 right-6 text-[10px] tracking-[0.4em] font-display text-white/40 z-[71]">
              HIDDEN MEMORY · TAP TO RETURN
            </div>
          </motion.div>
        )}

        {secret === "footsteps" && (
          <motion.div
            key="footsteps"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            onClick={dismiss}
            className="fixed inset-0 z-[65] cursor-pointer"
            style={{ background: "radial-gradient(ellipse at bottom, oklch(0.06 0.04 280 / 0.92), black 80%)" }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: [0, 0.9, 0.4], scale: 1 }}
                transition={{ delay: i * 0.4, duration: 1.6 }}
                className="absolute rounded-full"
                style={{
                  left: `${15 + i * 8}%`,
                  bottom: `${20 + Math.sin(i * 0.9) * 12}%`,
                  width: 22, height: 14,
                  background: "oklch(0.95 0.15 85 / 0.8)",
                  boxShadow: "0 0 30px oklch(0.95 0.15 85 / 0.9), 0 0 60px oklch(0.95 0.15 85 / 0.5)",
                  transform: `rotate(${i % 2 === 0 ? -15 : 15}deg)`,
                }} />
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 4, duration: 2 }}
              className="absolute top-1/3 right-[8%] text-center"
            >
              <div className="text-7xl">🎁</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5 }}
              className="absolute bottom-12 inset-x-0 text-center font-script text-xl md:text-3xl text-[oklch(0.95_0.1_85)]">
              even silence leaves a path back to you
            </motion.div>
          </motion.div>
        )}

        {secret === "freeze" && (
          <motion.div
            key="freeze"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={dismiss}
            className="fixed inset-0 z-[68] cursor-pointer backdrop-blur-md"
            style={{ background: "oklch(0.06 0.05 280 / 0.7)" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <StarBurst x={0} y={0} n={40} />
            </div>
            <FloatingParticles count={20} />
            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <div className="font-display text-[10px] tracking-[0.6em] text-white/50 mb-4">TIME · PAUSED</div>
              <div className="font-script text-3xl md:text-5xl text-[oklch(0.95_0.12_85)] max-w-xl"
                style={{ textShadow: "0 0 30px oklch(0.95 0.15 85 / 0.6)" }}>
                "if i could pause anything, i'd pause this moment with you."
              </div>
              <div className="mt-8 text-xs tracking-[0.4em] font-display text-white/40">TAP TO RESUME</div>
            </motion.div>
          </motion.div>
        )}

        {secret === "flower-castle" && (
          <motion.div
            key="castle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            onClick={dismiss}
            className="fixed inset-0 z-[68] cursor-pointer overflow-hidden"
            style={{ background: "radial-gradient(ellipse at top, oklch(0.18 0.08 340), oklch(0.05 0.03 280))" }}
          >
            <CinematicCamera shot="slow-zoom">
              <Petals count={scaleCount(40, quality)} />
              <Starfield count={scaleCount(120, quality)} />

              {/* 7 flowers rising and morphing into castle silhouette */}
              {Array.from({ length: 7 }).map((_, i) => (
                <motion.div key={i}
                  initial={{ y: 200, opacity: 0, scale: 0.3 }}
                  animate={{ y: -120 - i * 6, opacity: 1, scale: 1 }}
                  transition={{ duration: 3, delay: i * 0.18, ease: "easeOut" }}
                  className="absolute"
                  style={{ left: `${15 + i * 10}%`, bottom: "30%" }}
                >
                  <svg width="50" height="50" viewBox="0 0 50 50">
                    {Array.from({ length: 6 }).map((_, k) => (
                      <ellipse key={k} cx="25" cy="14" rx="6" ry="11"
                        fill="oklch(0.85 0.15 350)" opacity="0.85"
                        transform={`rotate(${k * 60} 25 25)`} />
                    ))}
                    <circle cx="25" cy="25" r="5" fill="oklch(0.95 0.15 85)" />
                  </svg>
                </motion.div>
              ))}

              {/* Castle silhouette */}
              <motion.svg
                viewBox="0 0 600 300"
                className="absolute left-1/2 top-1/4 -translate-x-1/2"
                width="80%"
                style={{ maxWidth: 600, filter: "drop-shadow(0 0 60px oklch(0.9 0.15 350 / 0.5))" }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 0.92, y: 0 }}
                transition={{ delay: 2.6, duration: 2 }}
              >
                <defs>
                  <linearGradient id="castleG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.92 0.12 350)" />
                    <stop offset="100%" stopColor="oklch(0.55 0.18 320)" />
                  </linearGradient>
                </defs>
                <path d="M50 280 L50 160 L90 160 L90 110 L130 110 L130 160 L200 160 L200 80 L250 40 L300 80 L300 160 L370 160 L370 110 L410 110 L410 160 L450 160 L450 280 Z"
                  fill="url(#castleG)" opacity="0.95" />
                {[110, 250, 390].map((cx, i) => (
                  <circle key={i} cx={cx} cy="200" r="4" fill="oklch(0.95 0.18 85)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" begin={`${i * 0.6}s`} />
                  </circle>
                ))}
              </motion.svg>

              {/* Girl walks into castle */}
              <motion.div
                className="absolute bottom-12 left-0"
                initial={{ x: "10vw", opacity: 0 }}
                animate={{ x: "45vw", opacity: 1 }}
                transition={{ delay: 4, duration: 4, ease: "easeInOut" }}
              >
                <Character age="woman" walking facing="right" />
              </motion.div>
            </CinematicCamera>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 6, duration: 2 }}
              className="absolute bottom-10 inset-x-0 text-center px-6 font-script text-2xl md:text-4xl text-[oklch(0.95_0.12_85)] z-[71]"
              style={{ textShadow: "0 0 30px oklch(0.95 0.15 85 / 0.6)" }}
            >
              "every petal you ever touched became a wall i'd build for you."
            </motion.div>
          </motion.div>
        )}

        {secret === "star-staircase" && (
          <motion.div
            key="stairs"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            onClick={dismiss}
            className="fixed inset-0 z-[68] cursor-pointer overflow-hidden"
            style={{ background: "radial-gradient(ellipse at top, oklch(0.12 0.06 280), black)" }}
          >
            <Starfield count={scaleCount(220, quality)} />

            {/* staircase of stars from bottom-right to top-left */}
            {STAIR_WORDS.map((_, i) => {
              const total = STAIR_WORDS.length;
              const left = 75 - (i / total) * 55;
              const bottom = 8 + (i / total) * 70;
              return (
                <motion.div key={i}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.3, duration: 0.8 }}
                  style={{ left: `${left}%`, bottom: `${bottom}%` }}
                >
                  <div className="w-16 h-3 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent, oklch(0.95 0.15 85), transparent)",
                      boxShadow: "0 0 30px oklch(0.95 0.15 85 / 0.8)",
                    }} />
                </motion.div>
              );
            })}

            {/* Girl climbing */}
            {(() => {
              const total = STAIR_WORDS.length;
              const i = Math.min(stairStep, total);
              const left = 75 - (i / total) * 55;
              const bottom = 8 + (i / total) * 70;
              return (
                <motion.div
                  className="absolute"
                  animate={{ left: `${left}%`, bottom: `${bottom + 3}%` }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  style={{ left: `${left}%`, bottom: `${bottom + 3}%` }}
                >
                  <Character age="woman" walking={stairStep < total} facing="left" scale={0.85} />
                </motion.div>
              );
            })()}

            {/* Emotional word per step */}
            <AnimatePresence>
              {stairStep > 0 && stairStep <= STAIR_WORDS.length && (
                <motion.div
                  key={stairStep}
                  initial={{ opacity: 0, scale: 0.6, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -30 }}
                  transition={{ duration: 1.4 }}
                  className="absolute left-1/2 top-1/3 -translate-x-1/2 font-script text-6xl md:text-8xl text-[oklch(0.95_0.15_85)]"
                  style={{ textShadow: "0 0 40px oklch(0.95 0.18 85 / 0.9)" }}
                >
                  {STAIR_WORDS[stairStep - 1]}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Crown at the top */}
            {stairStep >= STAIR_WORDS.length && (
              <motion.div
                initial={{ y: -100, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.6 }}
                className="absolute top-10 left-[15%]"
              >
                <svg width="120" height="70" viewBox="0 0 180 100">
                  <defs>
                    <linearGradient id="crown2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.95 0.18 85)" />
                      <stop offset="100%" stopColor="oklch(0.7 0.15 60)" />
                    </linearGradient>
                  </defs>
                  <path d="M20 80 L40 30 L70 60 L90 20 L110 60 L140 30 L160 80 Z"
                    fill="url(#crown2)" stroke="oklch(0.98 0.05 85)" strokeWidth="2" />
                </svg>
                <div className="text-center font-script text-lg text-[oklch(0.95_0.15_85)] mt-1">
                  moon crown unlocked
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {secret === "heart-galaxy" && (
          <motion.div
            key="heart"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            onClick={dismiss}
            className="fixed inset-0 z-[70] cursor-pointer overflow-hidden bg-black"
          >
            <CinematicCamera shot="orbit">
              <Starfield count={scaleCount(360, quality)} />
              {/* Heart-shaped star explosion */}
              <HeartGalaxy count={scaleCount(180, quality)} />

              {/* Girl floating in space */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Character age="woman" facing="front" scale={1.1} />
              </motion.div>

              {/* Orbiting flowers */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const r = 180;
                return (
                  <motion.div key={i}
                    className="absolute left-1/2 top-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 18 + i, repeat: Infinity, ease: "linear" }}
                    style={{ width: 0, height: 0 }}
                  >
                    <div
                      className="absolute"
                      style={{
                        left: Math.cos(angle) * r,
                        top: Math.sin(angle) * r,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <svg width="28" height="28" viewBox="0 0 50 50">
                        {Array.from({ length: 6 }).map((_, k) => (
                          <ellipse key={k} cx="25" cy="14" rx="6" ry="11"
                            fill="oklch(0.88 0.15 350)" opacity="0.9"
                            transform={`rotate(${k * 60} 25 25)`} />
                        ))}
                        <circle cx="25" cy="25" r="5" fill="oklch(0.95 0.18 85)" />
                      </svg>
                    </div>
                  </motion.div>
                );
              })}
            </CinematicCamera>

            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 2 }}
              className="absolute bottom-16 inset-x-0 text-center px-6 font-script text-2xl md:text-4xl text-[oklch(0.95_0.15_85)] z-[71]"
              style={{ textShadow: "0 0 40px oklch(0.95 0.18 85 / 0.9)" }}
            >
              "the whole galaxy bent into a heart — just to hold you."
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 180 stars arranged in heart-curve parametric formation
function HeartGalaxy({ count }: { count: number }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => {
    const t = (i / count) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const jitter = (Math.random() - 0.5) * 1.6;
    return { id: i, x: x + jitter, y: y + jitter, d: Math.random() * 2, s: Math.random() * 2 + 1 };
  }), [count]);
  return (
    <div className="absolute left-1/2 top-1/2 pointer-events-none" style={{ width: 0, height: 0 }}>
      {stars.map((s) => (
        <motion.div key={s.id}
          className="absolute rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.7], scale: 1 }}
          transition={{ duration: 1.6, delay: s.d, repeat: Infinity, repeatType: "mirror", repeatDelay: 2 }}
          style={{
            left: s.x * 16,
            top: s.y * 16,
            width: s.s * 2,
            height: s.s * 2,
            background: "oklch(0.95 0.15 85)",
            boxShadow: `0 0 ${s.s * 6}px oklch(0.95 0.15 85)`,
          }}
        />
      ))}
    </div>
  );
}
