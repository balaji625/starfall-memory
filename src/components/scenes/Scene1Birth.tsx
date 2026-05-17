import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Moon } from "../Moon";
import { Character } from "../Character";
import { Starfield, FloatingParticles } from "../Particles";
import { audio } from "@/lib/audio";

export function Scene1Birth({ onDone, variant }: { onDone: () => void; variant: number }) {
  const [stage, setStage] = useState(0);
  // 0: black + heartbeat, 1: star appears, 2: baby light, 3: girl revealed, 4: text date, 5: text quote, 6: walks off

  useEffect(() => {
    const t: any[] = [];
    const beat = setInterval(() => audio.heartbeat(0.8), 1100);
    t.push(setTimeout(() => setStage(1), 800));
    t.push(setTimeout(() => setStage(2), 2600));
    t.push(setTimeout(() => { setStage(3); audio.chime(660); }, 4800));
    t.push(setTimeout(() => setStage(4), 7000));
    t.push(setTimeout(() => setStage(5), 10000));
    t.push(setTimeout(() => setStage(6), 13500));
    t.push(setTimeout(() => onDone(), 17500));
    return () => { t.forEach(clearTimeout); clearInterval(beat); };
  }, [onDone]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
            <Starfield count={stage >= 3 ? 180 : 40} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lone star → baby light → girl */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {stage >= 1 && stage < 3 && (
            <motion.div
              key="star"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: stage === 2 ? 8 : 1,
                opacity: 1,
                filter: stage === 2 ? "blur(20px)" : "blur(0px)",
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-4 h-4 rounded-full bg-white"
              style={{ boxShadow: "0 0 60px white, 0 0 120px oklch(0.9 0.1 85)" }}
            />
          )}

          {stage >= 3 && stage < 6 && (
            <motion.div
              key="girl-reveal"
              initial={{ scale: 0.3, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-32 rounded-full" style={{ background: "radial-gradient(circle, oklch(0.95 0.1 85 / 0.3), transparent 70%)" }} />
              <Character age="child" facing="front" scale={1.1} />
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-pink-200"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-160px)`,
                      boxShadow: "0 0 20px oklch(0.88 0.1 350)",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {stage === 6 && (
            <motion.div
              key="walk-off"
              initial={{ x: 0, opacity: 1 }}
              animate={{ x: 400, opacity: 0 }}
              transition={{ duration: 3.5, ease: "easeInOut" }}
            >
              <Character age="child" walking facing="right" scale={1.1} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text */}
      <div className="absolute inset-x-0 bottom-24 text-center pointer-events-none">
        <AnimatePresence mode="wait">
          {stage === 4 && (
            <motion.div
              key="date"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="font-display text-5xl md:text-7xl text-shimmer tracking-widest"
            >
              28 · 05 · 2006
            </motion.div>
          )}
          {stage === 5 && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="font-display italic text-2xl md:text-4xl text-[oklch(0.95_0.05_85)] max-w-2xl mx-auto px-6"
            >
              {variant === 0 ? "The universe welcomed someone rare." : variant === 1 ? "A star fell — and the sky kept her name." : "Before she was born, the moon was waiting."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Touchable moon top-right */}
      {stage >= 3 && (
        <div className="absolute top-8 right-8">
          <Moon size={140} />
        </div>
      )}

      <FloatingParticles count={stage >= 3 ? 30 : 0} />
    </div>
  );
}
