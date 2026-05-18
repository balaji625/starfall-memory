import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Character } from "../Character";
import { Starfield, FloatingParticles, Petals, StarBurst } from "../Particles";
import { Moon } from "../Moon";
import { audio } from "@/lib/audio";

const VARIANTS = [
  { l1: "28 May gave the world someone...", l2: "10 June gave someone his world...", core: "My World...", name: "Vijaya ❤️", more: "Oh… one more thing…", final: "you were never the gift i wanted — you were the one i was made for." },
  { l1: "On 28 May the moon learned a new name...", l2: "On 10 June the moon gave it to me...", core: "My Universe...", name: "Vijaya ❤️", more: "Wait — one more secret…", final: "if every life is a song, you are the one note i'd never let end." },
  { l1: "28 May — the stars rehearsed...", l2: "10 June — the curtain finally rose...", core: "My Always...", name: "Vijaya ❤️", more: "One more whisper before I go…", final: "i don't pray for forever — i pray every forever has you in it." },
  { l1: "28 May wrote the first line...", l2: "10 June became the whole story...", core: "My Forever...", name: "Vijaya ❤️", more: "And one final thing…", final: "of all the stories the world told me, yours is the only one i believe." },
  { l1: "Before 28 May, the world was waiting...", l2: "After 10 June, the world was mine...", core: "My Everything...", name: "Vijaya ❤️", more: "P.S. you should know…", final: "even when the stars run out of light — i'd find you. i'd always find you." },
];

export function SceneFinale({ onReplay, variant }: { onReplay: () => void; variant: number }) {
  const v = VARIANTS[variant % VARIANTS.length];
  const [stage, setStage] = useState(0);
  // 0 stars→memories merge, 1 girl turns, 2 line1, 3 line2, 4 black, 5 explosion, 6 "My World", 7 name, 8 "one more thing", 9 happy birthday, 10 infinite

  useEffect(() => {
    const steps = [800, 3200, 5800, 8800, 11500, 12500, 14500, 17000, 20000, 22500, 25500];
    const timers = steps.map((ms, i) => setTimeout(() => {
      setStage(i + 1);
      if (i === 3) { audio.heartbeat(2); }
      if (i === 4) audio.heartbeat(2.5);
      if (i === 5) { audio.sparkle(); audio.chime(660); }
      if (i === 9) audio.sparkle();
    }, ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Background */}
      <AnimatePresence>
        {stage < 4 && (
          <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
            <Starfield count={300} />
            <Petals count={30} />
            <FloatingParticles count={50} />
            <div className="absolute top-10 left-1/2 -translate-x-1/2"><Moon size={200} interactive={false} /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Girl turns toward screen */}
      {stage >= 1 && stage < 4 && (
        <motion.div className="absolute inset-0 flex items-end justify-center pb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1.05 }} transition={{ duration: 3 }}>
            <Character age="woman" facing="front" scale={1.3} />
          </motion.div>
        </motion.div>
      )}

      {/* Whispered lines */}
      <AnimatePresence mode="wait">
        {stage === 2 && (
          <motion.div key="l1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute top-24 inset-x-0 text-center px-6 font-script text-3xl md:text-5xl text-[oklch(0.95_0.1_85)]">
            {v.l1}
          </motion.div>
        )}
        {stage === 3 && (
          <motion.div key="l2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute top-24 inset-x-0 text-center px-6 font-script text-3xl md:text-5xl text-[oklch(0.95_0.1_85)]">
            {v.l2}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Black silence */}
      {stage === 4 && <div className="absolute inset-0 bg-black" />}

      {/* Universe explosion */}
      {stage >= 5 && stage < 9 && (
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
          <Starfield count={400} />
          <Petals count={60} />
          <FloatingParticles count={100} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><StarBurst x={0} y={0} n={120} /></div>
        </motion.div>
      )}

      <AnimatePresence>
        {stage === 6 && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.8 }} className="absolute inset-0 flex items-center justify-center">
            <div className="font-display text-6xl md:text-8xl text-shimmer tracking-widest">{v.core}</div>
          </motion.div>
        )}
        {stage === 7 && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.8 }} className="absolute inset-0 flex items-center justify-center">
            <div className="font-script text-7xl md:text-9xl text-[oklch(0.95_0.15_85)]" style={{ textShadow: "0 0 40px oklch(0.95 0.18 85)" }}>{v.name}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "One more thing" */}
      {stage >= 8 && stage < 10 && (
        <motion.div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-center px-6">
            <Character age="woman" facing="front" scale={0.8} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2 }} className="font-script text-2xl md:text-4xl text-[oklch(0.95_0.1_85)] mt-4">
              {v.more}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Happy Birthday */}
      {stage >= 9 && (
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
          <Starfield count={500} />
          <FloatingParticles count={120} />
          <Petals count={80} />
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 10, delay: 0.5 }}
            className="relative z-10 text-center px-6">
            <div className="font-display text-6xl md:text-9xl text-shimmer tracking-wider">Happy Birthday</div>
            <div className="font-script text-5xl md:text-7xl text-[oklch(0.95_0.15_85)] mt-4" style={{ textShadow: "0 0 40px oklch(0.95 0.18 85)" }}>✨ Vijaya ✨</div>
          </motion.div>
        </motion.div>
      )}

      {stage >= 10 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={onReplay}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 px-8 py-3 rounded-full font-display text-lg border border-[oklch(0.95_0.15_85)] text-[oklch(0.95_0.15_85)] bg-black/30 backdrop-blur hover:bg-[oklch(0.95_0.15_85)] hover:text-black transition-colors"
        >
          watch again · new memory
        </motion.button>
      )}
    </div>
  );
}
