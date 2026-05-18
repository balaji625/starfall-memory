import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

export type Shot =
  | "wide"          // default establishing
  | "close-up"      // tight crop, shallow DOF
  | "orbit"         // slow rotational drift
  | "slow-zoom"    // continuous push-in
  | "moon-reflect" // tilted, mirrored vibe
  | "slow-mo";    // soft blur + scale, memory feel

type Props = {
  children: ReactNode;
  shot?: Shot;
  /** auto-cycle through shots every `cycle` ms */
  cycle?: number;
  className?: string;
};

const PRESETS: Record<Shot, {
  initial: any;
  animate: any;
  transition: any;
  filter?: string;
  overlay?: ReactNode;
}> = {
  wide: {
    initial: { scale: 1, x: 0, y: 0, rotate: 0 },
    animate: { scale: 1, x: 0, y: 0, rotate: 0 },
    transition: { duration: 2, ease: "easeInOut" },
  },
  "close-up": {
    initial: { scale: 1 },
    animate: { scale: 1.35, y: -20 },
    transition: { duration: 6, ease: "easeInOut" },
    filter: "blur(0px) saturate(1.1)",
  },
  orbit: {
    initial: { scale: 1.08, rotate: -1.5 },
    animate: { scale: 1.08, rotate: 1.5, x: [-15, 15, -15] },
    transition: { duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" as const },
  },
  "slow-zoom": {
    initial: { scale: 1 },
    animate: { scale: 1.18 },
    transition: { duration: 14, ease: "linear" },
  },
  "moon-reflect": {
    initial: { scale: 1.1, rotate: 0, y: 0 },
    animate: { scale: 1.12, rotate: 0.6, y: 6 },
    transition: { duration: 10, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" as const },
    filter: "hue-rotate(-8deg) brightness(1.05)",
  },
  "slow-mo": {
    initial: { scale: 1.05, opacity: 0.95 },
    animate: { scale: 1.12, opacity: 1 },
    transition: { duration: 8, ease: [0.16, 0.84, 0.32, 1] },
    filter: "blur(0.4px) saturate(1.15) brightness(1.04)",
  },
};

export function CinematicCamera({ children, shot = "wide", cycle, className = "" }: Props) {
  const [active, setActive] = useState<Shot>(shot);
  const reduced = useReducedMotion();

  useEffect(() => { setActive(shot); }, [shot]);

  useEffect(() => {
    if (!cycle || reduced) return;
    const order: Shot[] = ["wide", "slow-zoom", "close-up", "orbit", "moon-reflect", "slow-mo"];
    let i = order.indexOf(active);
    const t = setInterval(() => {
      i = (i + 1) % order.length;
      setActive(order[i]);
    }, cycle);
    return () => clearInterval(t);
  }, [cycle, reduced, active]);

  const preset = PRESETS[reduced ? "wide" : active];

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ perspective: 1200 }}>
      {/* depth-of-field vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[55]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, oklch(0.05 0.03 280 / 0.55) 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0 will-change-transform"
        initial={preset.initial}
        animate={preset.animate}
        transition={preset.transition}
        style={{ filter: preset.filter, transformOrigin: "50% 55%" }}
      >
        {children}
      </motion.div>
      {preset.overlay}
    </div>
  );
}
