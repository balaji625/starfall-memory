import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Character, Boy } from "../Character";
import { Moon } from "../Moon";
import { Starfield, FloatingParticles, Petals, StarBurst } from "../Particles";
import { audio } from "@/lib/audio";

export function Scene3Destiny({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState(0);
  // 0 date, 1 walking towards, 2 eye contact, 3 handshake, 4 burst, 5 quote, 6 done
  const [burst, setBurst] = useState(false);
  const [replays, setReplays] = useState(0);

  useEffect(() => {
    const t: any[] = [];
    const beat = setInterval(() => audio.heartbeat(0.5 + stage * 0.15), Math.max(1200 - stage * 200, 500));
    t.push(setTimeout(() => setStage(1), 2200));
    t.push(setTimeout(() => setStage(2), 5500));
    t.push(setTimeout(() => { setStage(3); audio.chime(880); }, 8200));
    t.push(setTimeout(() => { setStage(4); setBurst(true); audio.sparkle(); }, 9000));
    t.push(setTimeout(() => setStage(5), 11000));
    t.push(setTimeout(() => onDone(), 15500));
    return () => { t.forEach(clearTimeout); clearInterval(beat); };
  }, [stage, onDone]);

  const triggerReplay = () => {
    setReplays((r) => r + 1);
    setBurst(false);
    setTimeout(() => { setBurst(true); audio.sparkle(); }, 100);
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg, oklch(0.1 0.04 280) 0%, oklch(0.25 0.08 290) 100%)" }}>
      <Starfield count={120} />
      <div className="absolute top-10 right-10"><Moon size={170} /></div>
      <Petals count={20} />

      {/* Distant warm family lights */}
      <div className="absolute bottom-1/3 inset-x-0 flex justify-around opacity-50">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div key={i} className="w-4 h-4 rounded-full" style={{ background: "oklch(0.85 0.16 60)", boxShadow: "0 0 30px oklch(0.85 0.16 60)" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }} />
        ))}
      </div>

      {/* Date */}
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

      {/* Characters approaching */}
      {stage >= 1 && (
        <div className="absolute bottom-24 inset-x-0">
          <motion.div
            className="absolute bottom-0 left-0"
            initial={{ x: "5vw" }}
            animate={{ x: stage >= 2 ? "35vw" : "5vw" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            <Character age="woman" walking={stage < 2} facing="right" />
          </motion.div>
          <motion.div
            className="absolute bottom-0 right-0"
            initial={{ x: "-5vw" }}
            animate={{ x: stage >= 2 ? "-35vw" : "-5vw" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            <Boy walking={stage < 2} facing="left" />
          </motion.div>
        </div>
      )}

      {/* Handshake glow */}
      {stage >= 3 && (
        <motion.div
          className="absolute left-1/2 bottom-44 -translate-x-1/2 cursor-pointer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={triggerReplay}
        >
          <div className="w-24 h-24 rounded-full" style={{ background: "radial-gradient(circle, oklch(0.95 0.15 85), transparent 70%)", filter: "blur(2px)" }} />
        </motion.div>
      )}

      {burst && (
        <>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <StarBurst x={0} y={0} n={60} />
          </div>
          <FloatingParticles count={40} />
        </>
      )}

      <AnimatePresence>
        {stage >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-x-0 top-1/4 text-center px-6"
          >
            <div className="font-display italic text-2xl md:text-4xl text-[oklch(0.95_0.05_85)] max-w-2xl mx-auto">
              "Some meetings are written before they happen."
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage >= 4 && (
        <div className="absolute bottom-6 inset-x-0 text-center text-xs text-white/50 font-script">
          tap the glow · replay from a new angle {replays > 0 && `· ${replays}`}
        </div>
      )}
    </div>
  );
}
