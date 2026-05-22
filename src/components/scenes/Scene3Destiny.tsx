import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Character, Boy } from "../Character";
import { Moon } from "../Moon";
import { Starfield, FloatingParticles, Petals, StarBurst } from "../Particles";
import { audio } from "@/lib/audio";

// Beats:
// 0 date · 1 walking · 2 stop + eye contact · 3 quote 1 · 4 quote 2 · 5 quote 3
// 6 handshake + bloom burst · 7 continue button (manual advance only)
const QUOTES = [
  { icon: "✨", text: "Some meetings are not sudden..." },
  { icon: "🌙", text: "They are written somewhere long before they happen." },
  { icon: "🤍", text: "And some people quietly become important before we even realize it." },
];

export function Scene3Destiny({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState(0);
  const [burst, setBurst] = useState(false);
  const [replays, setReplays] = useState(0);
  const [wowFx, setWowFx] = useState(false);
  const wowFiredRef = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // Reliable 5s-on-scene trigger for moonbeam + heart-stars — exactly once per visit.
  useEffect(() => {
    const id = setTimeout(() => {
      if (wowFiredRef.current) return;
      wowFiredRef.current = true;
      setWowFx(true);
      audio.chime(720);
    }, 5000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const t: any[] = [];
    const beat = setInterval(() => audio.heartbeat(0.6), 1100);
    // Longer, breathing title card — no rush.
    t.push(setTimeout(() => audio.chime(440), 600));
    t.push(setTimeout(() => audio.chime(523), 2000));
    t.push(setTimeout(() => audio.chime(660), 3600));
    t.push(setTimeout(() => setStage(1), 6800));                    // start walking
    t.push(setTimeout(() => { setStage(2); audio.chime(523); }, 12600));
    t.push(setTimeout(() => setStage(3), 14800));
    t.push(setTimeout(() => setStage(4), 18600));
    t.push(setTimeout(() => setStage(5), 22400));
    t.push(setTimeout(() => {
      setStage(6); setBurst(true);
      audio.chime(880); audio.sparkle();
    }, 26400));
    t.push(setTimeout(() => setStage(7), 28900));
    return () => { t.forEach(clearTimeout); clearInterval(beat); };
  }, []);

  const triggerReplay = () => {
    setReplays((r) => r + 1);
    setBurst(false);
    setTimeout(() => { setBurst(true); audio.sparkle(); }, 100);
  };

  const showActiveQuote = stage >= 3 && stage <= 5;
  const activeQuoteIdx = stage - 3;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg, oklch(0.1 0.04 280) 0%, oklch(0.25 0.08 290) 100%)" }}>
      <Starfield count={120} />
      <motion.div
        className="absolute top-10 right-10"
        animate={{ scale: stage >= 6 ? 1.2 : stage >= 2 ? 1.08 : 1, filter: stage >= 6 ? "brightness(1.4)" : "brightness(1)" }}
        transition={{ duration: 2 }}
      >
        <Moon size={170} />
      </motion.div>
      <Petals count={stage >= 6 ? 48 : 16} />

      <div className="absolute bottom-1/3 inset-x-0 flex justify-around opacity-50 pointer-events-none">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div key={i} className="w-4 h-4 rounded-full" style={{ background: "oklch(0.85 0.16 60)", boxShadow: "0 0 30px oklch(0.85 0.16 60)" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }} />
        ))}
      </div>

      {/* ─── CINEMATIC TITLE CARD (stage 0) ─────────────────────── */}
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.4 } }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20"
          >
            {/* soft radial vignette behind text */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, oklch(0.12 0.06 285 / 0.55), transparent 65%)" }}
            />

            {/* swirling stars + soft light rays */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 3 }}
              style={{
                background:
                  "conic-gradient(from 200deg at 50% 40%, transparent, oklch(0.95 0.15 85 / 0.08) 30%, transparent 50%, oklch(0.85 0.12 320 / 0.06) 70%, transparent)",
                filter: "blur(40px)",
              }}
            />
            <FloatingParticles count={18} />

            {/* CHAPTER LABEL */}
            <motion.div
              initial={{ opacity: 0, y: -10, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.6em" }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="relative font-display text-[11px] md:text-xs text-[oklch(0.92_0.08_85)]/80 mb-7"
              style={{ textShadow: "0 0 20px oklch(0.95 0.18 85 / 0.5)" }}
            >
              ✦&nbsp;&nbsp;CHAPTER&nbsp;&nbsp;03&nbsp;&nbsp;✦
            </motion.div>

            {/* MAIN TITLE — luxury serif, cinematic spacing */}
            <motion.h2
              initial={{ opacity: 0, y: 26, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: [0, -4, 0], filter: "blur(0px)" }}
              transition={{
                opacity: { duration: 2.4, ease: "easeOut" },
                filter: { duration: 2.4, ease: "easeOut" },
                y: { duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 2.4 },
              }}
              className="relative font-display text-shimmer text-center leading-[1.05]"
              style={{
                fontSize: "clamp(2.4rem, 7vw, 5.5rem)",
                letterSpacing: "0.28em",
                paddingLeft: "0.28em",
                textShadow:
                  "0 0 40px oklch(0.95 0.18 85 / 0.55), 0 0 80px oklch(0.95 0.18 85 / 0.25), 0 2px 0 oklch(0 0 0 / 0.4)",
              }}
            >
              DESTINY&nbsp;&nbsp;WRITTEN
            </motion.h2>

            {/* hairline divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.6, duration: 1.6, ease: "easeOut" }}
              className="mt-6 h-px w-40 origin-center"
              style={{
                background:
                  "linear-gradient(to right, transparent, oklch(0.95 0.18 85 / 0.85), transparent)",
                boxShadow: "0 0 12px oklch(0.95 0.18 85 / 0.6)",
              }}
            />

            {/* SUBTITLE */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 1.8 }}
              className="mt-6 font-display italic text-base md:text-xl text-white/75 tracking-wide text-center"
              style={{ textShadow: "0 0 18px oklch(0.95 0.18 85 / 0.35)" }}
            >
              🌙&nbsp; "Two paths. One moment. One story."
            </motion.div>

            {/* GLASSMORPHISM DATE CARD */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 3.6, duration: 2, ease: "easeOut" }}
              className="mt-12 px-10 py-5 rounded-2xl backdrop-blur-xl border border-white/15 max-w-md mx-auto"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.16 0.08 320 / 0.45), oklch(0.1 0.05 280 / 0.35))",
                boxShadow:
                  "0 0 80px oklch(0.95 0.18 85 / 0.22), inset 0 1px 0 oklch(1 0 0 / 0.18)",
              }}
            >
              <div className="text-[9px] tracking-[0.55em] font-display text-white/55 text-center mb-2">
                THE DAY DESTINY ARRIVED
              </div>
              <div
                className="font-display text-shimmer text-center"
                style={{
                  fontSize: "clamp(1.1rem, 2.4vw, 1.6rem)",
                  letterSpacing: "0.35em",
                  paddingLeft: "0.35em",
                  textShadow: "0 0 22px oklch(0.95 0.18 85 / 0.7)",
                }}
              >
                ✨&nbsp; 10 • JULY • 2023 &nbsp;✨
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4.8, duration: 1.6 }}
                className="mt-3 font-display italic text-xs md:text-sm text-white/70 text-center"
              >
                🤍 "The day destiny quietly arrived."
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Characters approaching slowly, then standing still */}
      {stage >= 1 && (
        <div className="absolute bottom-24 inset-x-0">
          <motion.div
            className="absolute bottom-0 left-0"
            initial={{ x: "5vw" }}
            animate={{ x: stage >= 2 ? "32vw" : "5vw" }}
            transition={{ duration: 5.5, ease: "easeInOut" }}
          >
            <Character age="woman" walking={stage < 2} facing="right" />
          </motion.div>
          <motion.div
            className="absolute bottom-0 right-0"
            initial={{ x: "-5vw" }}
            animate={{ x: stage >= 2 ? "-32vw" : "-5vw" }}
            transition={{ duration: 5.5, ease: "easeInOut" }}
          >
            <Boy walking={stage < 2} facing="left" />
          </motion.div>
        </div>
      )}

      {/* WOW — moonlight beam falling between the two characters once they stop */}
      {stage >= 2 && stage <= 5 && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-[15]"
          initial={{ opacity: 0, scaleY: 0.4 }}
          animate={{ opacity: [0, 0.85, 0.7], scaleY: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          style={{ transformOrigin: "top center", width: 220, height: "70vh" }}
        >
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.98 0.06 85 / 0.55), oklch(0.95 0.18 85 / 0.22) 60%, transparent)",
              filter: "blur(14px)",
              clipPath: "polygon(42% 0%, 58% 0%, 78% 100%, 22% 100%)",
            }}
          />
        </motion.div>
      )}

      {/* tiny star-heart constellation between them */}
      {stage >= 2 && stage <= 5 && (
        <motion.svg
          viewBox="0 0 100 90"
          className="absolute left-1/2 top-[34%] -translate-x-1/2 pointer-events-none z-[16]"
          width="120"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0.9], scale: 1 }}
          transition={{ duration: 2.6, delay: 1.4 }}
          style={{ filter: "drop-shadow(0 0 18px oklch(0.95 0.18 85 / 0.9))" }}
        >
          {[
            [50, 18], [38, 28], [62, 28], [28, 40], [72, 40],
            [34, 54], [66, 54], [44, 64], [56, 64], [50, 74],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill="oklch(0.98 0.05 85)">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </motion.svg>
      )}

      {/* Quote layer — clearly above characters, single line at a time */}
      <AnimatePresence mode="wait">
        {showActiveQuote && (
          <motion.div
            key={`q-${activeQuoteIdx}`}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-x-0 top-[18%] flex justify-center px-6 pointer-events-none z-20"
          >
            <div className="max-w-3xl text-center">
              <div className="text-3xl md:text-4xl mb-3">{QUOTES[activeQuoteIdx].icon}</div>
              <div
                className="font-display italic text-2xl md:text-4xl leading-snug text-[oklch(0.97_0.04_85)]"
                style={{ textShadow: "0 0 30px oklch(0.95 0.18 85 / 0.6)" }}
              >
                {QUOTES[activeQuoteIdx].text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Handshake glow */}
      {stage >= 6 && (
        <motion.div
          className="absolute left-1/2 bottom-44 -translate-x-1/2 cursor-pointer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], opacity: 1 }}
          transition={{ duration: 1.6 }}
          onClick={triggerReplay}
        >
          <div className="w-28 h-28 rounded-full" style={{ background: "radial-gradient(circle, oklch(0.95 0.18 85), transparent 70%)", filter: "blur(2px)" }} />
        </motion.div>
      )}

      {burst && (
        <>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <StarBurst x={0} y={0} n={80} />
          </div>
          <FloatingParticles count={50} />
        </>
      )}

      {/* Manual continue — story never auto-skips past the meeting */}
      <AnimatePresence>
        {stage >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-3 z-30"
          >
            <motion.button
              onClick={() => { audio.chime(660); onDone(); }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              animate={{ boxShadow: ["0 0 20px oklch(0.95 0.18 85 / 0.4)", "0 0 60px oklch(0.95 0.18 85 / 0.85)", "0 0 20px oklch(0.95 0.18 85 / 0.4)"] }}
              transition={{ boxShadow: { duration: 2.4, repeat: Infinity } }}
              className="px-10 py-4 rounded-full font-display tracking-[0.4em] text-sm bg-[oklch(0.95_0.15_85)] text-black hover:bg-white"
            >
              ✨ CONTINUE THE STORY ✨
            </motion.button>
            <div className="text-[10px] tracking-[0.4em] text-white/40">tap the glow to replay {replays > 0 && `· ${replays}`}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
