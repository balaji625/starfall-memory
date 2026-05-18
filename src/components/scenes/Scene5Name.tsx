import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Starfield } from "../Particles";
import { audio } from "@/lib/audio";

const NAME = "KONDREDDY VIJAYA";
const MEANINGS: Record<string, string> = {
  K: "Kindness that the world remembers",
  O: "Open heart, always",
  N: "Never alone — not while I breathe",
  D: "Devotion, written in moonlight",
  R: "Reason every flower blooms",
  E: "Endless — that is how I love you",
  Y: "Yours — every star, every silence",
  V: "Victory of softness over the world",
  I: "Infinite — like the night sky",
  J: "Joy I never knew I was missing",
  A: "Always — and I mean it",
  " ": "·",
};

export function Scene5Name({ onDone }: { onDone: () => void }) {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [crown, setCrown] = useState(false);

  useEffect(() => {
    NAME.split("").forEach((_, i) => {
      setTimeout(() => setRevealed((r) => [...r, i]), i * 250);
    });
  }, []);

  useEffect(() => {
    if (revealed.length === NAME.length) {
      const t = setTimeout(() => {
        // auto-advance if user doesn't tap
        if (!crown) onDone();
      }, 14000);
      return () => clearTimeout(t);
    }
  }, [revealed.length, crown, onDone]);

  const [touched] = useState(() => new Set<number>());
  const handleLetter = (i: number) => {
    setActive(i);
    audio.chime(440 + (i % 8) * 60);
    touched.add(i);
    const lettersOnly = NAME.split("").filter((c) => c !== " ").length;
    if (touched.size >= lettersOnly - 2 && !crown) {
      setCrown(true);
      audio.sparkle();
      // Trigger Heart Galaxy secret overlay before advancing.
      window.dispatchEvent(new CustomEvent("secret:heart-galaxy"));
      setTimeout(onDone, 8000);
    }
    setTimeout(() => setActive(null), 2500);
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <Starfield count={250} />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        <div className="font-display text-xs uppercase tracking-[0.5em] text-white/40 mb-6">touch every letter</div>
        <div className="flex flex-wrap justify-center gap-1 md:gap-2 max-w-4xl">
          {NAME.split("").map((ch, i) => {
            if (ch === " ") return <div key={i} className="w-4 md:w-8" />;
            const isRevealed = revealed.includes(i);
            return (
              <motion.button
                key={i}
                onClick={() => handleLetter(i)}
                initial={{ y: -200, opacity: 0, scale: 0 }}
                animate={isRevealed ? { y: 0, opacity: 1, scale: 1 } : {}}
                whileHover={{ scale: 1.15, color: "oklch(0.95 0.15 85)" }}
                transition={{ type: "spring", damping: 12, stiffness: 100 }}
                className="font-display text-4xl md:text-7xl text-shimmer cursor-pointer relative"
                style={{ filter: active === i ? "drop-shadow(0 0 30px oklch(0.95 0.15 85))" : undefined }}
              >
                {ch}
                {active === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -40 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 -top-12 font-script text-base md:text-xl text-[oklch(0.95_0.1_85)] whitespace-nowrap pointer-events-none"
                  >
                    {MEANINGS[ch] ?? "yours"}
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {crown && (
          <motion.div
            initial={{ y: -200, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2"
          >
            <svg width="180" height="100" viewBox="0 0 180 100">
              <defs>
                <linearGradient id="crownG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.95 0.18 85)" />
                  <stop offset="100%" stopColor="oklch(0.7 0.15 60)" />
                </linearGradient>
              </defs>
              <path d="M20 80 L40 30 L70 60 L90 20 L110 60 L140 30 L160 80 Z" fill="url(#crownG)" stroke="oklch(0.98 0.05 85)" strokeWidth="2" className="glow-moon" />
              <circle cx="90" cy="45" r="6" fill="oklch(0.85 0.18 350)" />
              <circle cx="50" cy="55" r="4" fill="oklch(0.85 0.18 350)" />
              <circle cx="130" cy="55" r="4" fill="oklch(0.85 0.18 350)" />
            </svg>
            <div className="text-center font-script text-2xl text-[oklch(0.95_0.15_85)] mt-2">a crown for the queen</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
