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
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const t: any[] = [];
    const beat = setInterval(() => audio.heartbeat(0.6), 1100);
    t.push(setTimeout(() => setStage(1), 2400));                    // start walking
    t.push(setTimeout(() => { setStage(2); audio.chime(523); }, 8200)); // they stop · 2s eye contact
    t.push(setTimeout(() => setStage(3), 10400));                   // quote 1
    t.push(setTimeout(() => setStage(4), 14200));                   // quote 2
    t.push(setTimeout(() => setStage(5), 18000));                   // quote 3
    t.push(setTimeout(() => {                                       // handshake + bloom
      setStage(6); setBurst(true);
      audio.chime(880); audio.sparkle();
    }, 22000));
    t.push(setTimeout(() => setStage(7), 24500));                   // reveal continue
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

      <AnimatePresence>
        {stage === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="font-display text-6xl md:text-8xl text-shimmer tracking-widest">10 · 06 · 2023</div>
              <div className="mt-4 font-script text-2xl text-[oklch(0.9_0.1_80)]">destiny written</div>
            </div>
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
