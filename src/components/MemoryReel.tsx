import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { CinematicCamera, type Shot } from "./CinematicCamera";
import { Scene1Birth } from "./scenes/Scene1Birth";
import { Scene2Growing } from "./scenes/Scene2Growing";
import { Scene3Destiny } from "./scenes/Scene3Destiny";
import { Scene4Journey } from "./scenes/Scene4Journey";
import { Scene5Name } from "./scenes/Scene5Name";
import { Scene6FalseEnding } from "./scenes/Scene6FalseEnding";
import { Scene7Palace } from "./scenes/Scene7Palace";
import { SceneFinale } from "./scenes/SceneFinale";

export type MemoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type Memory = {
  id: MemoryId;
  title: string;
  whisper: string;
  shot: Shot;
  hue: string;
};

const MEMORIES: Memory[] = [
  { id: 1, title: "A Soul Arrives", whisper: "the night the stars learned her name", shot: "slow-zoom", hue: "oklch(0.78 0.16 85)" },
  { id: 2, title: "She Grows", whisper: "time, breathing softly", shot: "close-up", hue: "oklch(0.78 0.16 35)" },
  { id: 3, title: "Destiny Walks In", whisper: "two paths · one moon", shot: "orbit", hue: "oklch(0.78 0.16 350)" },
  { id: 4, title: "The Journey", whisper: "every step in starlight", shot: "slow-mo", hue: "oklch(0.78 0.16 220)" },
  { id: 5, title: "Her Name", whisper: "each letter, a meaning", shot: "close-up", hue: "oklch(0.78 0.16 160)" },
  { id: 6, title: "The False Ending", whisper: "stay · it is not over", shot: "moon-reflect", hue: "oklch(0.78 0.16 280)" },
  { id: 7, title: "The Secret Palace", whisper: "where memory becomes light", shot: "orbit", hue: "oklch(0.78 0.16 60)" },
  { id: 8, title: "Forever", whisper: "happy birthday, Vijaya", shot: "slow-zoom", hue: "oklch(0.78 0.16 110)" },
];

function renderScene(id: MemoryId, variant: number, onDone: () => void): ReactNode {
  switch (id) {
    case 1: return <Scene1Birth variant={variant % 3} onDone={onDone} />;
    case 2: return <Scene2Growing onDone={onDone} />;
    case 3: return <Scene3Destiny onDone={onDone} />;
    case 4: return <Scene4Journey onDone={onDone} />;
    case 5: return <Scene5Name onDone={onDone} />;
    case 6: return <Scene6FalseEnding onDone={onDone} />;
    case 7: return <Scene7Palace variant={variant} onDone={onDone} />;
    case 8: return <SceneFinale variant={variant} onReplay={onDone} />;
  }
}

export function MemoryReel({ unlocked, variant }: { unlocked: Set<MemoryId>; variant: number }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Memory | null>(null);
  const [playKey, setPlayKey] = useState(0);

  const available = MEMORIES.filter((m) => unlocked.has(m.id));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={available.length === 0}
        className="absolute bottom-4 right-4 z-[60] px-4 h-9 rounded-full bg-black/40 backdrop-blur border border-white/20 text-white/80 text-[10px] font-display tracking-[0.35em] hover:bg-black/60 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="open memory reel"
      >
        ◐ MEMORIES · {available.length}/{MEMORIES.length}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="reel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-[80] flex items-center justify-center"
            style={{ background: "radial-gradient(ellipse at center, oklch(0.06 0.04 285 / 0.92), oklch(0.02 0.02 280 / 0.98))", backdropFilter: "blur(14px)" }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              aria-label="close"
            >
              ✕
            </button>

            <div className="w-full max-w-5xl px-6">
              <div className="text-center mb-8">
                <div className="font-display text-[10px] tracking-[0.6em] text-white/40 uppercase">interactive memory reel</div>
                <h2 className="font-script text-5xl md:text-6xl text-shimmer mt-2">Replay a Moment</h2>
                <p className="mt-3 font-display italic text-white/60 text-sm">pick any memory · watch it again from a new cinematic angle</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MEMORIES.map((m) => {
                  const locked = !unlocked.has(m.id);
                  return (
                    <motion.button
                      key={m.id}
                      whileHover={!locked ? { scale: 1.04, y: -4 } : undefined}
                      whileTap={!locked ? { scale: 0.97 } : undefined}
                      disabled={locked}
                      onClick={() => { setActive(m); setPlayKey((k) => k + 1); }}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group disabled:cursor-not-allowed"
                      style={{ background: `linear-gradient(160deg, ${m.hue}, oklch(0.1 0.04 280))` }}
                    >
                      <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ background: "radial-gradient(circle at 50% 30%, white, transparent 60%)" }} />
                      <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                        <div className="font-display text-[9px] tracking-[0.4em] text-white/70 uppercase">chapter {String(m.id).padStart(2, "0")}</div>
                        <div className="font-script text-xl text-white mt-1 leading-tight">{m.title}</div>
                        <div className="font-display italic text-[10px] text-white/60 mt-1">{m.whisper}</div>
                      </div>
                      {locked && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                          <div className="font-display text-[10px] tracking-[0.3em] text-white/50">◌ LOCKED</div>
                        </div>
                      )}
                      {!locked && (
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white/90 text-[10px] opacity-0 group-hover:opacity-100 transition">▶</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="text-center mt-6 font-display text-[10px] tracking-[0.4em] text-white/30">
                replays do not affect the main story
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <motion.div
            key={`play-${active.id}-${playKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-[90] bg-black"
          >
            <CinematicCamera shot={active.shot} cycle={9000}>
              {renderScene(active.id, variant + playKey, () => setActive(null))}
            </CinematicCamera>

            <div className="absolute top-5 left-5 z-[95] font-display text-[10px] tracking-[0.4em] text-white/60 uppercase">
              memory · {active.title} · {active.shot}
            </div>
            <button
              onClick={() => setActive(null)}
              className="absolute top-5 right-5 z-[95] w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white/80 hover:bg-black/70"
              aria-label="close memory"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
