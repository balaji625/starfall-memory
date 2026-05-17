import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Character } from "../Character";
import { Starfield, FloatingParticles, StarBurst, Petals } from "../Particles";
import { Moon } from "../Moon";
import { audio } from "@/lib/audio";

const ALT_MESSAGES = [
  "I planned every star.",
  "Every flower was practice for you.",
  "The moon was always your mirror.",
];

export function Scene7Palace({ onDone, variant }: { onDone: () => void; variant: number }) {
  const [stage, setStage] = useState(0);
  // 0 palace appears, 1 girl walks, 2 gift, 3 opens, 4 explosion
  const [touchedEarly, setTouchedEarly] = useState(false);
  const [altMsg, setAltMsg] = useState<string | null>(null);

  useEffect(() => {
    const t: any[] = [];
    t.push(setTimeout(() => setStage(1), 2000));
    t.push(setTimeout(() => setStage(2), 6000));
    t.push(setTimeout(() => { setStage(3); audio.sparkle(); }, 9500));
    t.push(setTimeout(() => { setStage(4); audio.heartbeat(2); }, 11000));
    t.push(setTimeout(onDone, 14500));
    return () => t.forEach(clearTimeout);
  }, [onDone]);

  const tapGift = () => {
    if (stage === 2 && !touchedEarly) {
      setTouchedEarly(true);
      setAltMsg(ALT_MESSAGES[variant % ALT_MESSAGES.length]);
      audio.chime(1100);
      setTimeout(() => setAltMsg(null), 2800);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg, oklch(0.05 0.04 280) 0%, oklch(0.18 0.08 290) 100%)" }}>
      <Starfield count={200} />

      {/* Floating moon palace */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 anim-float"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 40, opacity: 1 }}
        transition={{ duration: 2.5 }}
      >
        <svg width="380" height="280" viewBox="0 0 380 280" className="glow-moon">
          <defs>
            <linearGradient id="palG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.95 0.05 85)" />
              <stop offset="100%" stopColor="oklch(0.7 0.08 80)" />
            </linearGradient>
          </defs>
          <ellipse cx="190" cy="250" rx="140" ry="14" fill="oklch(0.95 0.08 85 / 0.3)" />
          <rect x="80" y="140" width="220" height="110" fill="url(#palG)" opacity="0.95" />
          <polygon points="80,140 190,40 300,140" fill="url(#palG)" />
          <rect x="100" y="120" width="40" height="40" fill="url(#palG)" />
          <rect x="240" y="120" width="40" height="40" fill="url(#palG)" />
          <polygon points="100,120 120,90 140,120" fill="url(#palG)" />
          <polygon points="240,120 260,90 280,120" fill="url(#palG)" />
          <rect x="175" y="180" width="30" height="70" fill="oklch(0.3 0.06 280)" />
          <circle cx="190" cy="100" r="5" fill="oklch(0.95 0.2 85)" />
        </svg>
      </motion.div>

      {/* Girl walking alone to palace */}
      {stage >= 1 && stage < 3 && (
        <motion.div
          className="absolute bottom-16"
          initial={{ left: "-10%" }}
          animate={{ left: stage >= 2 ? "45%" : "20%" }}
          transition={{ duration: 4, ease: "easeInOut" }}
        >
          <Character age="woman" walking={stage < 2} facing="right" />
        </motion.div>
      )}

      {/* Gift */}
      {stage >= 2 && stage < 4 && (
        <motion.button
          onClick={tapGift}
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="absolute left-1/2 bottom-32 -translate-x-1/2 anim-float"
        >
          <svg width="120" height="120" viewBox="0 0 120 120" className="glow-moon">
            <rect x="20" y="40" width="80" height="70" fill="oklch(0.7 0.18 350)" rx="4" />
            <rect x="20" y="40" width="80" height="14" fill="oklch(0.9 0.15 85)" />
            <rect x="56" y="40" width="8" height="70" fill="oklch(0.9 0.15 85)" />
            <path d="M40 40 Q40 20 60 30 Q80 20 80 40" stroke="oklch(0.9 0.15 85)" strokeWidth="4" fill="none" />
          </svg>
        </motion.button>
      )}

      {stage >= 4 && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <StarBurst x={0} y={0} n={120} />
          </div>
          <FloatingParticles count={80} />
          <Petals count={40} />
        </>
      )}

      <AnimatePresence>
        {altMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-1/3 -translate-x-1/2 font-script text-3xl text-white/95"
            style={{ textShadow: "0 0 20px oklch(0.95 0.15 85)" }}
          >
            {altMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-10 left-1/2 -translate-x-1/2 font-display italic text-xl md:text-2xl text-white/70 tracking-widest">
        the secret palace
      </div>
    </div>
  );
}
