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
  // 0..10 main timeline · 11 = secret-ending overlay (girl turns + walks closer + whispers)
  const [secretEnding, setSecretEnding] = useState<0 | 1 | 2 | 3>(0);
  // 1 = quiet pause, 2 = girl turns + walks closer, 3 = whisper revealed

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

  // Secret ending — wait 5s after finale fully resolves, then play the closer.
  useEffect(() => {
    if (stage < 10) return;
    const t1 = setTimeout(() => { setSecretEnding(1); }, 5000);                   // 5s held silence
    const t2 = setTimeout(() => { setSecretEnding(2); audio.heartbeat(1.5); }, 7000); // she turns + walks
    const t3 = setTimeout(() => { setSecretEnding(3); audio.chime(523); audio.sparkle(); }, 12500); // whisper
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [stage]);

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

      {stage >= 10 && secretEnding < 2 && (
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

      {/* SECRET ENDING — wait 5s, girl turns back, smiles, walks closer, whispers */}
      <AnimatePresence>
        {secretEnding >= 2 && (
          <motion.div
            key="secret-ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-30 overflow-hidden"
            style={{ background: "radial-gradient(ellipse at center, oklch(0.08 0.04 280 / 0.96), black)" }}
          >
            <Starfield count={200} />
            <FloatingParticles count={30} />

            {/* Girl turns and walks closer — scale + slight rotate sells the "turn back, walk to camera" */}
            <motion.div
              className="absolute left-1/2 bottom-0 -translate-x-1/2 origin-bottom"
              initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
              animate={{
                scale: secretEnding >= 3 ? 1.8 : 1.1,
                opacity: 1,
                rotateY: 0,
                y: secretEnding >= 3 ? -20 : 0,
              }}
              transition={{ duration: 4, ease: [0.16, 0.84, 0.32, 1] }}
            >
              <Character age="woman" facing="front" scale={1.2} />
              {/* soft smile glow */}
              <motion.div
                className="absolute left-1/2 top-1/3 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ background: "radial-gradient(circle, oklch(0.95 0.15 85 / 0.5), transparent 70%)", filter: "blur(20px)" }}
              />
            </motion.div>

            {/* Whisper */}
            <AnimatePresence>
              {secretEnding >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 3, ease: "easeOut" }}
                  className="absolute top-[14%] inset-x-0 text-center px-8"
                >
                  <div className="font-display text-[10px] tracking-[0.6em] text-white/40 mb-3">
                    THE LAST SECRET
                  </div>
                  <div
                    className="font-script text-3xl md:text-5xl text-[oklch(0.95_0.15_85)] max-w-2xl mx-auto leading-tight"
                    style={{ textShadow: "0 0 40px oklch(0.95 0.18 85 / 0.9)" }}
                  >
                    "{v.final}"
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {secretEnding >= 3 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4 }}
                onClick={onReplay}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 px-8 py-3 rounded-full font-display text-sm tracking-[0.3em] border border-[oklch(0.95_0.15_85)] text-[oklch(0.95_0.15_85)] bg-black/40 backdrop-blur hover:bg-[oklch(0.95_0.15_85)] hover:text-black transition-colors"
              >
                ONE MORE MEMORY
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
