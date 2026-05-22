import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { startQualityMonitor } from "@/lib/quality";
import { audio } from "@/lib/audio";
import { Moon } from "./Moon";
import { Starfield, FloatingParticles } from "./Particles";
import { Scene1Birth } from "./scenes/Scene1Birth";
import { Scene2Growing } from "./scenes/Scene2Growing";
import { Scene3Destiny } from "./scenes/Scene3Destiny";
import { Scene4Journey } from "./scenes/Scene4Journey";
import { Scene5Name } from "./scenes/Scene5Name";
import { Scene6FalseEnding } from "./scenes/Scene6FalseEnding";
import { Scene7Palace } from "./scenes/Scene7Palace";
import { SceneFinale } from "./scenes/SceneFinale";
import { SecretOverlays } from "./SecretOverlays";
import { ChapterCard, FilmGrain, GodRays, LensFlare, Parallax3D, useChapterCard } from "./Cinematic3D";
import { MemoryReel, type MemoryId } from "./MemoryReel";
import { WowMoments } from "./WowMoments";
import { WelcomeUniverse } from "./WelcomeUniverse";

type Stage = "gate" | "welcome" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const CHAPTERS: Record<string, { t: string; s?: string }> = {
  "1": { t: "A Soul Arrives", s: "the night the stars learned her name" },
  "2": { t: "She Grows", s: "swipe to let time breathe" },
  "3": { t: "Destiny Walks In", s: "two paths · one moon" },
  "4": { t: "The Journey", s: "every step written in starlight" },
  "5": { t: "Her Name", s: "touch each letter · find its meaning" },
  "6": { t: "The False Ending", s: "stay · the story is not over" },
  "7": { t: "The Secret Palace", s: "where memory becomes light" },
  "8": { t: "Forever", s: "happy birthday, Vijaya" },
};

export function Experience() {
  const [stage, setStage] = useState<Stage>("gate");
  const [muted, setMuted] = useState(false);
  const [replay, setReplay] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<MemoryId>>(new Set());

  const unlock = (id: MemoryId) =>
    setUnlocked((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const start = () => {
    audio.unlock();
    setStage("welcome");
  };

  const enterUniverse = () => {
    audio.unlock();
    setStage(1);
  };

  const next = (from: MemoryId, n: Stage) => {
    unlock(from);
    setStage(n);
  };

  useEffect(() => {
    startQualityMonitor();
    audio.setMuted(muted);
  }, [muted]);

  const restart = () => {
    unlock(8);
    setReplay((r) => r + 1);
    setStage(1);
  };

  const chapter = useChapterCard(stage, CHAPTERS);

  return (
    <div className="fixed inset-0 select-none overflow-hidden">
      {/* Aurora atmosphere — sits behind everything */}
      {stage !== "gate" && (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <div className="aurora-bg absolute inset-0" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {stage === "gate" && <Gate key="gate" onStart={start} />}
        {stage === 1 && <Scene1Birth key={`s1-${replay}`} variant={replay % 3} onDone={() => next(1, 2)} />}
        {stage === 2 && <Scene2Growing key={`s2-${replay}`} onDone={() => next(2, 3)} />}
        {stage === 3 && <Scene3Destiny key={`s3-${replay}`} onDone={() => next(3, 4)} />}
        {stage === 4 && <Scene4Journey key={`s4-${replay}`} onDone={() => next(4, 5)} />}
        {stage === 5 && <Scene5Name key={`s5-${replay}`} onDone={() => next(5, 6)} />}
        {stage === 6 && <Scene6FalseEnding key={`s6-${replay}`} onDone={() => next(6, 7)} />}
        {stage === 7 && <Scene7Palace key={`s7-${replay}`} variant={replay} onDone={() => next(7, 8)} />}
        {stage === 8 && <SceneFinale key={`s8-${replay}`} variant={replay} onReplay={restart} />}
      </AnimatePresence>

      {/* Cinematic atmosphere layers — non-interactive, above scenes */}
      {stage !== "gate" && (
        <>
          <Parallax3D intensity={10}>
            <GodRays origin="50% 25%" />
            <LensFlare x={72} y={28} />
          </Parallax3D>
          <FilmGrain />
        </>
      )}

      {/* Chapter card transitions */}
      {chapter.data && (
        <ChapterCard
          index={typeof stage === "number" ? stage : 0}
          title={chapter.data.t}
          subtitle={chapter.data.s}
          visible={chapter.visible}
        />
      )}

      {/* HUD */}
      {stage !== "gate" && (
        <div className="absolute top-4 left-4 z-[60] flex items-center gap-3">
          <button
            onClick={() => setMuted((m) => !m)}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur border border-white/20 text-white/80 text-xs flex items-center justify-center hover:bg-black/60"
            aria-label="toggle sound"
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            onClick={() => {
              const order: Stage[] = [1, 2, 3, 4, 5, 6, 7, 8];
              const i = order.indexOf(stage as any);
              if (i < order.length - 1) setStage(order[i + 1]);
            }}
            className="px-3 h-9 rounded-full bg-black/40 backdrop-blur border border-white/20 text-white/70 text-xs font-display tracking-widest hover:bg-black/60"
          >
            skip →
          </button>
        </div>
      )}

      {stage !== "gate" && (
        <div className="absolute top-4 right-4 z-[60] text-[10px] font-display tracking-[0.3em] text-white/40">
          chapter {String(stage).padStart(2, "0")} / 08
        </div>
      )}

      {stage !== "gate" && <SecretOverlays />}
      {stage !== "gate" && <MemoryReel unlocked={unlocked} variant={replay} />}
      {stage !== "gate" && <WowMoments stage={stage} />}
    </div>
  );
}


function Gate({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: "radial-gradient(circle at center, oklch(0.15 0.06 285), oklch(0.02 0.02 280))" }}
    >
      <Starfield count={250} />
      <FloatingParticles count={20} />
      <div className="absolute top-1/4"><Moon size={260} interactive={false} /></div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.4 }}
        className="relative z-10 text-center px-6 mt-72"
      >
        <div className="font-display text-xs uppercase tracking-[0.6em] text-white/50 mb-4">a cinematic memory</div>
        <h1 className="font-script text-6xl md:text-8xl text-shimmer leading-none">For Vijaya</h1>
        <p className="mt-6 font-display italic text-lg md:text-xl text-white/70 max-w-md mx-auto">
          best with headphones · turn the lights down · stay until the end
        </p>
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="mt-10 px-10 py-4 rounded-full font-display tracking-[0.4em] text-sm bg-[oklch(0.95_0.15_85)] text-black hover:bg-white transition-colors glow-soft"
        >
          BEGIN
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
