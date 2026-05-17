import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Character } from "../Character";
import { Starfield, FloatingParticles, Petals, useSwipe } from "../Particles";
import { Moon } from "../Moon";
import { audio } from "@/lib/audio";

const ENVIRONMENTS = [
  { name: "Childhood Garden", bg: "linear-gradient(180deg, oklch(0.4 0.1 200) 0%, oklch(0.7 0.15 130) 100%)", flora: "garden" },
  { name: "Rain Path", bg: "linear-gradient(180deg, oklch(0.25 0.04 250) 0%, oklch(0.45 0.06 240) 100%)", flora: "rain" },
  { name: "Flower Fields", bg: "linear-gradient(180deg, oklch(0.55 0.12 30) 0%, oklch(0.78 0.16 350) 100%)", flora: "petals" },
  { name: "Moon Lake", bg: "linear-gradient(180deg, oklch(0.15 0.05 280) 0%, oklch(0.3 0.08 260) 100%)", flora: "moon" },
  { name: "Golden Evening", bg: "linear-gradient(180deg, oklch(0.5 0.15 50) 0%, oklch(0.75 0.18 70) 100%)", flora: "gold" },
  { name: "Night Sky", bg: "linear-gradient(180deg, oklch(0.06 0.04 280) 0%, oklch(0.15 0.06 280) 100%)", flora: "stars" },
];

export function Scene2Growing({ onDone }: { onDone: () => void }) {
  const [envIdx, setEnvIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const env = ENVIRONMENTS[envIdx];

  useSwipe(
    () => setSpeed((s) => Math.min(s + 0.5, 3)),
    () => setSpeed((s) => Math.max(s - 0.5, 0.4)),
  );

  useEffect(() => {
    const dur = 4500 / speed;
    if (envIdx < ENVIRONMENTS.length - 1) {
      const t = setTimeout(() => {
        setEnvIdx((i) => i + 1);
        audio.chime(440 + envIdx * 60);
      }, dur);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, dur);
      return () => clearTimeout(t);
    }
  }, [envIdx, speed, onDone]);

  const age = envIdx <= 1 ? "child" : envIdx <= 3 ? "teen" : "woman";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        key={envIdx}
        className="absolute inset-0 anim-camera"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{ background: env.bg }}
      >
        {env.flora === "stars" && <Starfield count={200} />}
        {env.flora === "moon" && (
          <>
            <div className="absolute top-12 right-16"><Moon size={180} /></div>
            <div className="absolute bottom-0 inset-x-0 h-1/3" style={{ background: "linear-gradient(180deg, transparent, oklch(0.2 0.08 260 / 0.6))" }} />
          </>
        )}
        {env.flora === "petals" && <Petals count={30} />}
        {env.flora === "rain" && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 80 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-8 bg-white/40"
                style={{ left: `${Math.random() * 100}%`, top: -20 }}
                animate={{ y: ["0vh", "110vh"] }}
                transition={{ duration: 0.7, delay: Math.random() * 2, repeat: Infinity, ease: "linear" }}
              />
            ))}
          </div>
        )}
        {env.flora === "garden" && (
          <div className="absolute bottom-0 inset-x-0 h-32">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="absolute bottom-0" style={{ left: `${i * 4}%` }}>
                <svg width="20" height="40"><circle cx="10" cy="8" r="6" fill="oklch(0.85 0.18 50)" /><rect x="9" y="14" width="2" height="26" fill="oklch(0.4 0.15 140)" /></svg>
              </div>
            ))}
          </div>
        )}
        {env.flora === "gold" && <FloatingParticles count={50} color="oklch(0.9 0.18 80)" />}
      </motion.div>

      {/* Walking character */}
      <div className="absolute bottom-20 left-0 right-0 flex items-end justify-center">
        <motion.div
          key={age}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <Character age={age as any} walking facing="right" />
        </motion.div>
      </div>

      {/* Env label */}
      <motion.div
        key={`l-${envIdx}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], y: 0 }}
        transition={{ duration: 3, times: [0, 0.2, 0.8, 1] }}
        className="absolute top-10 left-1/2 -translate-x-1/2 font-display text-2xl text-white/90 tracking-widest"
      >
        {env.name}
      </motion.div>

      {/* Speed hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/50 font-script">
        swipe up · faster · swipe down · slow memory · {speed.toFixed(1)}×
      </div>
    </div>
  );
}
