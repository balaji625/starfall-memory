import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { audio } from "@/lib/audio";
import { Moon } from "./Moon";
import { Starfield, FloatingParticles } from "./Particles";
import { scaleCount, useQuality } from "@/lib/quality";

// "Enter Her Universe" — a cinematic pre-experience that plays before Scene 1.
// Purely additive. Does not touch any existing scene/animation/audio/state.

const OPENING = [
  "Welcome...",
  "Not into a website...",
  "But into a story written with feelings.",
];

const QUOTES = [
  "🌸 Some people enter life...",
  "🤍 And quietly become important.",
  "🌙 Some people become memories...",
  "💫 And some become part of the heart.",
  "🫶 Tonight is not just a celebration...",
  "✨ It's the celebration of someone truly special.",
];

const NAME = "KONDREDDY VIJAYA";

export function WelcomeUniverse({ onEnter }: { onEnter: () => void }) {
  const q = useQuality();
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [openingIdx, setOpeningIdx] = useState(-1);
  const [quoteIdx, setQuoteIdx] = useState(-1);
  const [moonRipple, setMoonRipple] = useState(0);
  const [exploding, setExploding] = useState(false);

  // Soft cinematic heartbeat throughout the welcome.
  useEffect(() => {
    audio.unlock();
    const beat = setInterval(() => audio.heartbeat(0.45), 1400);
    return () => clearInterval(beat);
  }, []);

  // Phase scheduler — atmospheric, never rushed.
  useEffect(() => {
    const t: number[] = [];
    // Phase 0: black + stars + heartbeat (0-2.4s)
    t.push(window.setTimeout(() => setPhase(1), 2400));
    // Phase 1: opening triplet
    [0, 1, 2].forEach((i) => {
      t.push(window.setTimeout(() => {
        setOpeningIdx(i);
        audio.chime(620 + i * 60);
      }, 4000 + i * 2200));
    });
    // Phase 2: moon rises (~10.6s)
    t.push(window.setTimeout(() => { setPhase(2); audio.chime(540); }, 10600));
    // Phase 3: name reveal (~14s)
    t.push(window.setTimeout(() => { setPhase(3); audio.sparkle(); }, 14000));
    // Phase 4: emotional quotes (~18s) — staggered
    t.push(window.setTimeout(() => setPhase(4), 18000));
    QUOTES.forEach((_, i) => {
      t.push(window.setTimeout(() => {
        setQuoteIdx(i);
        audio.chime(720 + (i % 3) * 80);
      }, 18000 + i * 2100));
    });
    // Phase 5: button (~32s)
    t.push(window.setTimeout(() => { setPhase(5); audio.chime(880); }, 32000));
    return () => { t.forEach(clearTimeout); };
  }, []);

  const handleEnter = () => {
    if (exploding) return;
    setExploding(true);
    audio.whoosh();
    audio.sparkle();
    setTimeout(onEnter, 1400);
  };

  const handleMoon = () => {
    setMoonRipple((r) => r + 1);
    audio.sparkle();
  };

  const starCount = scaleCount(300, q);
  const petalCount = scaleCount(18, q);
  const beamCount = scaleCount(6, q);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4 }}
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, oklch(0.08 0.04 280) 0%, oklch(0.02 0.02 285) 70%, #000 100%)",
      }}
    >
      {/* Starfield breathes in slowly */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 4, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Starfield count={starCount} />
      </motion.div>

      {/* Drifting moonbeams */}
      {phase >= 2 && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: beamCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-0 h-full"
              style={{
                left: `${10 + i * (80 / beamCount)}%`,
                width: 2,
                background:
                  "linear-gradient(to bottom, oklch(0.98 0.06 85 / 0.35), transparent 70%)",
                filter: "blur(2px)",
              }}
              animate={{ opacity: [0.2, 0.55, 0.2], x: [0, 20, 0] }}
              transition={{ duration: 6 + i, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </div>
      )}

      {/* Floating petals */}
      {phase >= 2 && <Petals count={petalCount} />}

      {/* Particles */}
      <FloatingParticles count={scaleCount(22, q)} />

      {/* Moon */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            key="moon"
            initial={{ y: 80, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 3, ease: [0.22, 0.9, 0.3, 1] }}
            className="absolute left-1/2 -translate-x-1/2 top-[14%]"
          >
            <div className="relative" onClick={handleMoon} style={{ cursor: "pointer" }}>
              <Moon size={240} interactive={false} />
              {/* Ripple bursts on touch */}
              <AnimatePresence>
                {Array.from({ length: moonRipple }).slice(-3).map((_, i) => (
                  <motion.div
                    key={`r-${moonRipple}-${i}`}
                    initial={{ scale: 0.6, opacity: 0.7 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: "oklch(0.98 0.06 85 / 0.55)" }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opening triplet */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-6 space-y-5">
          {OPENING.map((line, i) => (
            <AnimatePresence key={i}>
              {phase === 1 && openingIdx >= i && openingIdx < 3 && phase < 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{
                    opacity: openingIdx === i ? 1 : 0.35,
                    y: [0, -3, 0],
                    filter: "blur(0px)",
                  }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 1.6, y: { duration: 4, repeat: Infinity } }}
                  className="font-display italic text-white"
                  style={{
                    fontSize: i === 2 ? "clamp(1.4rem, 3.6vw, 2.4rem)" : "clamp(1.6rem, 4vw, 2.8rem)",
                    letterSpacing: "0.04em",
                    textShadow:
                      "0 0 24px oklch(0.95 0.08 85 / 0.55), 0 0 60px oklch(0.9 0.12 80 / 0.3)",
                  }}
                >
                  {line}
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      {/* Name reveal */}
      <AnimatePresence>
        {phase >= 3 && phase < 5 && (
          <motion.div
            key="name"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.2 }}
            className="absolute left-1/2 -translate-x-1/2 top-[44%] -translate-y-1/2 text-center"
          >
            <div className="font-display tracking-[0.45em] text-[10px] text-white/55 mb-3">
              ✦ HER NAME ✦
            </div>
            <div className="font-display flex flex-wrap justify-center gap-x-2 gap-y-1">
              {NAME.split("").map((c, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.12 * i, duration: 0.9 }}
                  style={{
                    fontSize: "clamp(1.4rem, 4.2vw, 2.6rem)",
                    color: "oklch(0.98 0.06 85)",
                    textShadow:
                      "0 0 18px oklch(0.95 0.1 85 / 0.7), 0 0 40px oklch(0.9 0.14 80 / 0.4)",
                    letterSpacing: "0.18em",
                  }}
                >
                  {c === " " ? "\u00A0" : c}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quotes */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[28%] w-full px-6 text-center pointer-events-none">
        <AnimatePresence mode="wait">
          {phase === 4 && quoteIdx >= 0 && (
            <motion.div
              key={quoteIdx}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              transition={{ duration: 1.2 }}
              className="font-display italic"
              style={{
                fontSize: "clamp(1.1rem, 2.6vw, 1.7rem)",
                color: "oklch(0.97 0.04 85 / 0.92)",
                textShadow: "0 0 20px oklch(0.95 0.08 85 / 0.4)",
              }}
            >
              {QUOTES[quoteIdx]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enter button */}
      <AnimatePresence>
        {phase >= 5 && (
          <motion.div
            key="enter-btn"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[14%] z-20"
          >
            <motion.button
              onClick={handleEnter}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              animate={{
                boxShadow: [
                  "0 0 30px oklch(0.95 0.1 85 / 0.4), inset 0 0 20px oklch(0.95 0.1 85 / 0.15)",
                  "0 0 60px oklch(0.95 0.14 85 / 0.7), inset 0 0 30px oklch(0.95 0.12 85 / 0.25)",
                  "0 0 30px oklch(0.95 0.1 85 / 0.4), inset 0 0 20px oklch(0.95 0.1 85 / 0.15)",
                ],
              }}
              transition={{ boxShadow: { duration: 3.2, repeat: Infinity } }}
              className="relative px-10 py-4 rounded-full font-display tracking-[0.32em] text-sm text-white overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.05 285 / 0.55), oklch(0.12 0.04 280 / 0.7))",
                border: "1px solid oklch(0.95 0.08 85 / 0.45)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              }}
            >
              <span className="relative z-10">✨ Enter Her Universe ✨</span>
              {/* Floating sparks around button */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-white"
                  style={{ top: "50%", left: "50%" }}
                  animate={{
                    x: [0, Math.cos((i / 6) * Math.PI * 2) * 80],
                    y: [0, Math.sin((i / 6) * Math.PI * 2) * 30],
                    opacity: [0.9, 0],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </motion.button>
            <div className="mt-3 text-center font-display text-[10px] tracking-[0.4em] text-white/40">
              best with headphones · stay until the end
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic transition on click */}
      <AnimatePresence>
        {exploding && (
          <motion.div
            key="explode"
            className="absolute inset-0 pointer-events-none z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute left-1/2 top-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              initial={{ width: 240, height: 240, opacity: 0.9 }}
              animate={{ width: 3000, height: 3000, opacity: 0 }}
              transition={{ duration: 1.3, ease: "easeOut" }}
              style={{
                background:
                  "radial-gradient(circle, oklch(0.98 0.08 85 / 0.9) 0%, oklch(0.95 0.1 85 / 0.4) 30%, transparent 70%)",
              }}
            />
            {Array.from({ length: 40 }).map((_, i) => {
              const a = (i / 40) * Math.PI * 2;
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full bg-white"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(a) * 800,
                    y: Math.sin(a) * 800,
                    opacity: 0,
                  }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </motion.div>
  );
}

function Petals({ count }: { count: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        dur: 14 + Math.random() * 10,
        size: 6 + Math.random() * 8,
        hue: Math.random() > 0.5 ? 25 : 340,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            background: `oklch(0.85 0.12 ${p.hue} / 0.7)`,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, 40, -30, 20],
            rotate: [0, 360],
            opacity: [0, 0.9, 0.7, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
