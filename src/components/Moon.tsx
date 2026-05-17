import { motion } from "framer-motion";
import { useState } from "react";
import { audio } from "@/lib/audio";

export function Moon({
  size = 220,
  className = "",
  onTouch,
  interactive = true,
  glow = true,
}: { size?: number; className?: string; onTouch?: () => void; interactive?: boolean; glow?: boolean }) {
  const [dusts, setDusts] = useState<{ id: number; x: number; y: number }[]>([]);

  const handle = () => {
    if (!interactive) return;
    audio.sparkle();
    const id = Date.now();
    const newDusts = Array.from({ length: 18 }, (_, i) => ({
      id: id + i,
      x: (Math.random() - 0.5) * size,
      y: Math.random() * 100 + 50,
    }));
    setDusts((d) => [...d, ...newDusts]);
    setTimeout(() => setDusts((d) => d.filter((x) => !newDusts.find((n) => n.id === x.id))), 2500);
    onTouch?.();
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} onClick={handle}>
      <motion.div
        className={`relative ${glow ? "anim-moon-pulse" : ""}`}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        style={{ cursor: interactive ? "pointer" : "default" }}
      >
        <svg width={size} height={size} viewBox="0 0 220 220">
          <defs>
            <radialGradient id="moonG" cx="0.4" cy="0.4">
              <stop offset="0%" stopColor="oklch(0.99 0.03 90)" />
              <stop offset="70%" stopColor="oklch(0.92 0.07 85)" />
              <stop offset="100%" stopColor="oklch(0.78 0.1 75)" />
            </radialGradient>
            <radialGradient id="moonHalo" cx="0.5" cy="0.5">
              <stop offset="0%" stopColor="oklch(0.95 0.1 85 / 0.6)" />
              <stop offset="60%" stopColor="oklch(0.9 0.1 85 / 0.15)" />
              <stop offset="100%" stopColor="oklch(0.9 0.1 85 / 0)" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="110" r="108" fill="url(#moonHalo)" />
          <circle cx="110" cy="110" r="88" fill="url(#moonG)" />
          <circle cx="80" cy="85" r="10" fill="oklch(0.85 0.06 80)" opacity="0.35" />
          <circle cx="130" cy="120" r="14" fill="oklch(0.85 0.06 80)" opacity="0.3" />
          <circle cx="100" cy="150" r="6" fill="oklch(0.85 0.06 80)" opacity="0.4" />
          <circle cx="145" cy="85" r="5" fill="oklch(0.85 0.06 80)" opacity="0.35" />
        </svg>
      </motion.div>
      {dusts.map((d) => (
        <motion.div
          key={d.id}
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{ width: 4, height: 4, background: "oklch(0.95 0.1 85)", boxShadow: "0 0 8px oklch(0.95 0.1 85)" }}
          initial={{ x: d.x, y: 0, opacity: 1 }}
          animate={{ y: d.y + 300, opacity: 0 }}
          transition={{ duration: 2.2, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
