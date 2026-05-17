import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { audio } from "@/lib/audio";

export function Scene6FalseEnding({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState(0);
  // 0 fading, 1 text "ends here", 2 pause, 3 crack, 4 moon breaks, 5 reveal

  useEffect(() => {
    const t: any[] = [];
    t.push(setTimeout(() => setStage(1), 1500));
    t.push(setTimeout(() => setStage(2), 4500));
    t.push(setTimeout(() => { setStage(3); audio.whoosh(); }, 6500));
    t.push(setTimeout(() => { setStage(4); audio.heartbeat(2); audio.sparkle(); }, 8500));
    t.push(setTimeout(() => onDone(), 11000));
    return () => t.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
      <AnimatePresence>
        {stage >= 1 && stage < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="font-display italic text-3xl md:text-5xl text-white/80 tracking-wide"
          >
            The story ends here...
          </motion.div>
        )}
      </AnimatePresence>

      {stage >= 3 && (
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <motion.path
            d="M50 0 L48 20 L52 35 L46 50 L54 65 L48 80 L50 100"
            stroke="oklch(0.95 0.1 85)"
            strokeWidth="0.3"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            style={{ filter: "drop-shadow(0 0 4px white)" }}
          />
          <motion.path
            d="M30 0 L34 25 L28 50 L36 75 L30 100"
            stroke="oklch(0.95 0.1 85)"
            strokeWidth="0.2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.3 }}
          />
          <motion.path
            d="M70 0 L66 30 L72 60 L68 100"
            stroke="oklch(0.95 0.1 85)"
            strokeWidth="0.2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, delay: 0.5 }}
          />
        </svg>
      )}

      {stage >= 4 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 3, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, white, oklch(0.95 0.15 85), transparent)", filter: "blur(20px)" }} />
        </motion.div>
      )}
    </div>
  );
}
