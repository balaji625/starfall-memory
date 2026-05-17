import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Character, Boy } from "../Character";
import { Moon } from "../Moon";
import { Starfield, FloatingParticles, Petals, useShake } from "../Particles";
import { audio } from "@/lib/audio";

const WORLDS = ["Moon Bridge", "Floating Flower Valley", "Star Waterfall", "Light Forest", "Memory Sky"];
const FLOWER_WHISPERS = ["You are kind.", "You are home.", "You are my favorite hello.", "You are the calm.", "You are the song."];
const STAR_WHISPERS = ["safe with you", "always", "one more day", "my forever", "yes — still you"];

export function Scene4Journey({ onDone }: { onDone: () => void }) {
  const [worldIdx, setWorldIdx] = useState(0);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [footprints, setFootprints] = useState<{ x: number; y: number; id: number }[]>([]);
  const [storm, setStorm] = useState(false);

  useShake(() => {
    setStorm(true);
    audio.whoosh();
    setTimeout(() => setStorm(false), 2500);
  });

  useEffect(() => {
    if (worldIdx < WORLDS.length - 1) {
      const t = setTimeout(() => { setWorldIdx((i) => i + 1); audio.chime(520 + worldIdx * 50); }, 5500);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 6000);
      return () => clearTimeout(t);
    }
  }, [worldIdx, onDone]);

  const showWhisper = (text: string) => {
    setWhisper(text);
    audio.chime(990);
    setTimeout(() => setWhisper(null), 2200);
  };

  const handleGround = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = Date.now();
    setFootprints((f) => [...f, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setFootprints((f) => f.filter((p) => p.id !== id)), 3000);
  };

  return (
    <div className="absolute inset-0 overflow-hidden cursor-pointer" onClick={handleGround} style={{ background: "linear-gradient(180deg, oklch(0.1 0.05 280), oklch(0.3 0.12 290))" }}>
      <Starfield count={150} />
      <div className="absolute top-8 right-12"><Moon size={150} /></div>

      {/* World layer */}
      <AnimatePresence mode="wait">
        <motion.div key={worldIdx} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}>
          {worldIdx === 0 && (
            <svg className="absolute bottom-32 inset-x-0 w-full" height="120" preserveAspectRatio="none" viewBox="0 0 1000 120">
              <path d="M0 60 Q500 0 1000 60 L1000 120 L0 120 Z" fill="oklch(0.9 0.08 80 / 0.35)" />
              <path d="M0 60 Q500 0 1000 60" stroke="oklch(0.95 0.1 85)" strokeWidth="2" fill="none" />
            </svg>
          )}
          {worldIdx === 1 && (
            <div className="absolute inset-0">
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); showWhisper(FLOWER_WHISPERS[i % FLOWER_WHISPERS.length]); }}
                  className="absolute anim-float"
                  style={{ left: `${(i * 53) % 95}%`, top: `${20 + ((i * 37) % 50)}%`, animationDelay: `${i * 0.3}s` }}
                >
                  <svg width="36" height="36" viewBox="0 0 36 36">
                    <g>
                      {[0, 72, 144, 216, 288].map((r) => (
                        <ellipse key={r} cx="18" cy="10" rx="5" ry="8" fill="oklch(0.85 0.15 350)" transform={`rotate(${r} 18 18)`} />
                      ))}
                      <circle cx="18" cy="18" r="4" fill="oklch(0.9 0.18 80)" />
                    </g>
                  </svg>
                </motion.button>
              ))}
            </div>
          )}
          {worldIdx === 2 && (
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 60 }).map((_, i) => (
                <motion.button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); showWhisper(STAR_WHISPERS[i % STAR_WHISPERS.length]); }}
                  className="absolute w-2 h-2 rounded-full bg-white"
                  style={{ left: `${Math.random() * 100}%`, top: -10, boxShadow: "0 0 8px white" }}
                  animate={{ y: ["0vh", "110vh"] }}
                  transition={{ duration: 5 + Math.random() * 4, delay: Math.random() * 3, repeat: Infinity, ease: "linear" }}
                />
              ))}
            </div>
          )}
          {worldIdx === 3 && (
            <div className="absolute inset-0">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="absolute bottom-0" style={{ left: `${i * 7}%` }}>
                  <svg width="60" height="220" viewBox="0 0 60 220">
                    <rect x="26" y="80" width="8" height="140" fill="oklch(0.15 0.04 30)" />
                    <ellipse cx="30" cy="60" rx="30" ry="55" fill="oklch(0.35 0.1 140)" opacity="0.8" />
                    <circle cx="20" cy="40" r="3" fill="oklch(0.9 0.15 85)" className="anim-twinkle" />
                    <circle cx="40" cy="70" r="2.5" fill="oklch(0.9 0.15 85)" className="anim-twinkle" />
                  </svg>
                </div>
              ))}
            </div>
          )}
          {worldIdx === 4 && <FloatingParticles count={60} />}
        </motion.div>
      </AnimatePresence>

      <Petals count={15} />
      {storm && <Starfield count={400} />}

      {/* Couple walking */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-end gap-4">
        <Character age="woman" walking facing="right" />
        <Boy walking facing="right" />
      </div>

      {/* Footprints */}
      {footprints.map((f) => (
        <motion.div
          key={f.id}
          className="absolute pointer-events-none rounded-full"
          style={{ left: f.x - 12, top: f.y - 12, width: 24, height: 24, background: "radial-gradient(circle, oklch(0.95 0.15 85 / 0.6), transparent 70%)" }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 3 }}
        />
      ))}

      <AnimatePresence>
        {whisper && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-1/3 -translate-x-1/2 font-script text-3xl text-white/95 pointer-events-none"
            style={{ textShadow: "0 0 20px oklch(0.95 0.15 85)" }}
          >
            {whisper}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div key={`w-${worldIdx}`} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 4 }} className="absolute top-12 left-1/2 -translate-x-1/2 font-display text-3xl text-shimmer tracking-widest">
        {WORLDS[worldIdx]}
      </motion.div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/40 font-script text-center">
        tap flowers · hold stars · shake for star storm · tap ground for footprints
      </div>
    </div>
  );
}
