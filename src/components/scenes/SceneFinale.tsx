import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Character } from "../Character";
import { Starfield, FloatingParticles, Petals, StarBurst } from "../Particles";
import { Moon } from "../Moon";
import { audio } from "@/lib/audio";

// Cinematic emotional storytelling — long-form pacing.
// Each quote breathes for ~3.2s with its own emoji.
const QUOTES: { e: string; t: string }[] = [
  { e: "✨", t: "Everyone is born..." },
  { e: "🌍", t: "But only a few people make the world feel different." },
  { e: "🌸", t: "Some people stay in photographs..." },
  { e: "💫", t: "And some stay inside memories forever." },
  { e: "🌙", t: "Some people talk..." },
  { e: "🤍", t: "But some silently become peace." },
  { e: "🫶", t: "Not everyone changes life..." },
  { e: "✨", t: "But some people make ordinary days feel special." },
  { e: "🌌", t: "Among billions of people..." },
  { e: "💖", t: "My heart quietly chose you." },
  { e: "🎈", t: "This isn't just another birthday..." },
  { e: "🌠", t: "It's the celebration of someone deeply special." },
  { e: "🕊️", t: "Someone who brought smiles..." },
  { e: "🌸", t: "Softness..." },
  { e: "💫", t: "Comfort..." },
  { e: "🌙", t: "And beautiful memories." },
  { e: "🎁", t: "I don't just wish happiness for today..." },
  { e: "✨", t: "I wish for more laughs together..." },
  { e: "🌷", t: "More unforgettable memories..." },
  { e: "🌌", t: "More moon conversations..." },
  { e: "🫂", t: "More moments that stay close to the heart." },
  { e: "💖", t: "And maybe..." },
  { e: "🌠", t: "Many more birthdays celebrated together." },
];

const QUOTE_MS = 3200;

// Phases:
// 'prologue' — moon rises, small intro
// 'quotes'  — cinematic quote reel
// 'silence' — black + heartbeat
// 'burst'   — universe explodes
// 'whisper' — girl turns + "oh... one more thing..."
// 'reveal'  — Happy Birthday + name
// 'secret'  — final secret line
type Phase = "prologue" | "quotes" | "silence" | "burst" | "whisper" | "reveal" | "secret";

const SECRETS = [
  "you were never the gift i wanted — you were the one i was made for.",
  "if every life is a song, you are the one note i'd never let end.",
  "i don't pray for forever — i pray every forever has you in it.",
  "of all the stories the world told me, yours is the only one i believe.",
  "even when the stars run out of light — i'd find you. i'd always find you.",
];

export function SceneFinale({ onReplay, variant }: { onReplay: () => void; variant: number }) {
  const [phase, setPhase] = useState<Phase>("prologue");
  const [qi, setQi] = useState(0);
  const secret = SECRETS[variant % SECRETS.length];

  // Prologue → quotes
  useEffect(() => {
    const t = setTimeout(() => setPhase("quotes"), 3000);
    return () => clearTimeout(t);
  }, []);

  // Quote reel
  useEffect(() => {
    if (phase !== "quotes") return;
    if (qi >= QUOTES.length) {
      const t = setTimeout(() => setPhase("silence"), 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      audio.chime(440 + (qi % 7) * 55);
      setQi((i) => i + 1);
    }, QUOTE_MS);
    return () => clearTimeout(t);
  }, [phase, qi]);

  // Silence → burst → whisper → reveal → secret
  useEffect(() => {
    if (phase !== "silence") return;
    const beats = [
      setTimeout(() => audio.heartbeat(2), 800),
      setTimeout(() => audio.heartbeat(2.5), 1600),
      setTimeout(() => { audio.sparkle(); setPhase("burst"); }, 2400),
    ];
    return () => beats.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "burst") return;
    const t = setTimeout(() => setPhase("whisper"), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "whisper") return;
    const t = setTimeout(() => { audio.sparkle(); setPhase("reveal"); }, 5000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const t = setTimeout(() => setPhase("secret"), 9000);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Background — preserved through prologue + quotes + reveal + secret (NOT silence/burst pre-explode) */}
      {(phase === "prologue" || phase === "quotes" || phase === "reveal" || phase === "secret") && (
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
          <Starfield count={phase === "reveal" || phase === "secret" ? 400 : 220} />
          <FloatingParticles count={phase === "reveal" || phase === "secret" ? 80 : 30} />
          <Petals count={phase === "reveal" || phase === "secret" ? 60 : 18} />
          {/* Moon — kept high so it never overlaps centered text */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2"
            initial={{ top: "18%", scale: 0.85 }}
            animate={{ top: phase === "prologue" ? "20%" : "6%", scale: phase === "reveal" || phase === "secret" ? 1 : 0.85 }}
            transition={{ duration: 4, ease: "easeInOut" }}
          >
            <Moon size={170} interactive={false} />
          </motion.div>
        </motion.div>
      )}

      {/* PROLOGUE */}
      {phase === "prologue" && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
          className="absolute inset-x-0 bottom-[18%] text-center px-6"
        >
          <div className="font-display text-[10px] tracking-[0.6em] text-white/40 mb-3">A LETTER WRITTEN IN LIGHT</div>
          <div className="font-script text-3xl md:text-5xl text-[oklch(0.95_0.12_85)]" style={{ textShadow: "0 0 30px oklch(0.95 0.18 85 / 0.6)" }}>
            stay with me until the last star...
          </div>
        </motion.div>
      )}

      {/* QUOTE REEL — positioned well below the moon */}
      {phase === "quotes" && (
        <div className="absolute inset-x-0 top-[42%] -translate-y-1/2 flex justify-center px-6 pointer-events-none">
          <AnimatePresence mode="wait">
            {qi < QUOTES.length && (
              <motion.div
                key={qi}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="max-w-3xl text-center"
              >
                <div className="text-4xl md:text-5xl mb-4">{QUOTES[qi].e}</div>
                <div
                  className="font-display italic text-2xl md:text-4xl text-[oklch(0.97_0.04_85)] leading-snug"
                  style={{ textShadow: "0 0 30px oklch(0.95 0.18 85 / 0.5)" }}
                >
                  {QUOTES[qi].t}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* progress */}
          <div className="absolute -bottom-12 inset-x-0 flex justify-center">
            <div className="h-[2px] w-40 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[oklch(0.95_0.18_85)]"
                animate={{ width: `${Math.min(100, (qi / QUOTES.length) * 100)}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SILENCE — pure black + heartbeat pulse */}
      {phase === "silence" && (
        <motion.div className="absolute inset-0 bg-black flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="w-24 h-24 rounded-full"
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ background: "radial-gradient(circle, oklch(0.85 0.18 30 / 0.8), transparent 70%)" }}
          />
        </motion.div>
      )}

      {/* UNIVERSE BURST */}
      {phase === "burst" && (
        <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}>
          <Starfield count={500} />
          <Petals count={80} />
          <FloatingParticles count={120} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><StarBurst x={0} y={0} n={140} /></div>
        </motion.div>
      )}

      {/* WHISPER — girl turns and speaks */}
      {phase === "whisper" && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-end pb-24"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
          style={{ background: "radial-gradient(ellipse at center, oklch(0.08 0.04 280 / 0.96), black)" }}
        >
          <Starfield count={150} />
          <motion.div initial={{ scale: 0.9, rotateY: 160 }} animate={{ scale: 1.1, rotateY: 0 }} transition={{ duration: 3, ease: "easeOut" }}>
            <Character age="woman" facing="front" scale={1.2} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 2 }}
            className="absolute top-[20%] inset-x-0 text-center px-6"
          >
            <div className="text-3xl mb-2">✨</div>
            <div className="font-script text-3xl md:text-5xl text-[oklch(0.95_0.12_85)]" style={{ textShadow: "0 0 40px oklch(0.95 0.18 85 / 0.7)" }}>
              "Oh... one more thing..."
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* REVEAL — Happy Birthday · My World · KONDREDDY VIJAYA */}
      {phase === "reveal" && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
        >
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1.6 }}
            className="text-center">
            <div className="text-4xl md:text-5xl mb-4">🎂</div>
            <div className="font-display text-5xl md:text-8xl text-shimmer tracking-wider">Happy Birthday</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4, duration: 1.6 }}
            className="text-center mt-6">
            <div className="text-3xl md:text-4xl mb-3">🌙</div>
            <div className="font-script text-4xl md:text-6xl text-[oklch(0.95_0.15_85)]" style={{ textShadow: "0 0 40px oklch(0.95 0.18 85)" }}>
              My World ❤️
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 4.6, duration: 2 }}
            className="text-center mt-10">
            <div className="font-display text-3xl md:text-6xl tracking-[0.25em] text-shimmer">✨ KONDREDDY VIJAYA ✨</div>
          </motion.div>
        </motion.div>
      )}

      {/* SECRET — final whisper + replay */}
      {phase === "secret" && (
        <motion.div
          className="absolute inset-0 z-30"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
          style={{ background: "radial-gradient(ellipse at center, oklch(0.08 0.04 280 / 0.92), black)" }}
        >
          <Starfield count={600} />
          <FloatingParticles count={60} />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            <div className="font-display text-[10px] tracking-[0.6em] text-white/40 mb-4">THE LAST SECRET</div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 3 }}
              className="font-script text-3xl md:text-5xl text-[oklch(0.95_0.15_85)] text-center max-w-3xl leading-tight"
              style={{ textShadow: "0 0 40px oklch(0.95 0.18 85 / 0.9)" }}
            >
              "{secret}"
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4 }}
              onClick={onReplay}
              className="mt-12 px-8 py-3 rounded-full font-display text-xs tracking-[0.4em] border border-[oklch(0.95_0.15_85)] text-[oklch(0.95_0.15_85)] bg-black/40 backdrop-blur hover:bg-[oklch(0.95_0.15_85)] hover:text-black transition-colors"
            >
              ONE MORE MEMORY
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
