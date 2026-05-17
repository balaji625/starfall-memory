import { motion } from "framer-motion";

type Props = {
  age?: "baby" | "child" | "teen" | "woman";
  walking?: boolean;
  facing?: "left" | "right" | "front";
  scale?: number;
  className?: string;
};

// Single SVG rig — scale + proportions shift with age.
// All sub-parts use CSS keyframes for breathing/blinking/hair/dress/walk.
export function Character({ age = "woman", walking = false, facing = "right", scale = 1, className = "" }: Props) {
  const sz = age === "baby" ? 0.45 : age === "child" ? 0.65 : age === "teen" ? 0.85 : 1;
  const flip = facing === "left" ? -1 : 1;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: 180 * scale, height: 320 * scale, transform: `scale(${sz * scale})`, transformOrigin: "bottom center" }}
    >
      <div className={walking ? "anim-bob" : "anim-breathe"} style={{ transform: `scaleX(${flip})` }}>
        <svg viewBox="0 0 180 320" width="180" height="320" className="overflow-visible">
          <defs>
            <radialGradient id="skin" cx="0.5" cy="0.4">
              <stop offset="0%" stopColor="oklch(0.88 0.06 50)" />
              <stop offset="100%" stopColor="oklch(0.78 0.08 45)" />
            </radialGradient>
            <linearGradient id="dressG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.18 350)" />
              <stop offset="100%" stopColor="oklch(0.4 0.16 350)" />
            </linearGradient>
            <linearGradient id="hairG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.25 0.04 30)" />
              <stop offset="100%" stopColor="oklch(0.15 0.03 30)" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="90" cy="312" rx="38" ry="5" fill="black" opacity="0.35" />

          {/* Legs */}
          <g transform="translate(90 200)">
            <rect className={walking ? "anim-walk-leg-l" : ""} x="-16" y="0" width="12" height="90" rx="6" fill="url(#skin)" />
            <rect className={walking ? "anim-walk-leg-r" : ""} x="4" y="0" width="12" height="90" rx="6" fill="url(#skin)" />
          </g>

          {/* Dress / Body */}
          <g className="anim-dress">
            <path
              d="M55 130 Q90 120 125 130 L140 240 Q90 255 40 240 Z"
              fill="url(#dressG)"
            />
            <path d="M55 130 Q90 120 125 130 L120 150 Q90 145 60 150 Z" fill="oklch(0.95 0.05 85)" opacity="0.4" />
          </g>

          {/* Arms */}
          <g transform="translate(90 138)">
            <rect className={walking ? "anim-walk-arm-l" : "anim-breathe"} x="-44" y="0" width="11" height="75" rx="5.5" fill="url(#skin)" />
            <rect className={walking ? "anim-walk-arm-r" : "anim-breathe"} x="33" y="0" width="11" height="75" rx="5.5" fill="url(#skin)" />
          </g>

          {/* Neck */}
          <rect x="82" y="105" width="16" height="22" rx="6" fill="url(#skin)" />

          {/* Head */}
          <g transform="translate(90 75)">
            {/* Hair back */}
            <path className="anim-hair" d="M-42 -10 Q-46 30 -30 55 L-30 30 Q-25 -25 0 -38 Q25 -25 30 30 L30 55 Q46 30 42 -10 Q35 -52 0 -55 Q-35 -52 -42 -10 Z" fill="url(#hairG)" />
            {/* Face */}
            <ellipse cx="0" cy="0" rx="32" ry="38" fill="url(#skin)" />
            {/* Cheeks */}
            <ellipse cx="-18" cy="10" rx="6" ry="4" fill="oklch(0.75 0.15 20)" opacity="0.5" />
            <ellipse cx="18" cy="10" rx="6" ry="4" fill="oklch(0.75 0.15 20)" opacity="0.5" />
            {/* Eyes */}
            <g className="anim-blink">
              <ellipse cx="-11" cy="-4" rx="4" ry="5" fill="oklch(0.15 0.04 30)" />
              <ellipse cx="11" cy="-4" rx="4" ry="5" fill="oklch(0.15 0.04 30)" />
              <circle cx="-10" cy="-5" r="1.2" fill="white" />
              <circle cx="12" cy="-5" r="1.2" fill="white" />
            </g>
            {/* Brows */}
            <path d="M-16 -13 Q-11 -16 -6 -13" stroke="oklch(0.18 0.04 30)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M6 -13 Q11 -16 16 -13" stroke="oklch(0.18 0.04 30)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Smile */}
            <path d="M-8 16 Q0 22 8 16" stroke="oklch(0.45 0.12 20)" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Hair front */}
            <path className="anim-hair" d="M-30 -28 Q-10 -42 0 -38 Q10 -42 30 -28 Q20 -22 0 -24 Q-20 -22 -30 -28 Z" fill="url(#hairG)" />
          </g>
        </svg>
      </div>
    </motion.div>
  );
}

export function Boy({ walking = false, facing = "left", scale = 1, className = "" }: { walking?: boolean; facing?: "left" | "right"; scale?: number; className?: string }) {
  const flip = facing === "left" ? -1 : 1;
  return (
    <motion.div className={`relative ${className}`} style={{ width: 180 * scale, height: 320 * scale, transformOrigin: "bottom center" }}>
      <div className={walking ? "anim-bob" : "anim-breathe"} style={{ transform: `scaleX(${flip})` }}>
        <svg viewBox="0 0 180 320" width="180" height="320" className="overflow-visible">
          <defs>
            <linearGradient id="suitG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.3 0.04 260)" />
              <stop offset="100%" stopColor="oklch(0.15 0.03 260)" />
            </linearGradient>
          </defs>
          <ellipse cx="90" cy="312" rx="36" ry="5" fill="black" opacity="0.35" />
          <g transform="translate(90 200)">
            <rect className={walking ? "anim-walk-leg-l" : ""} x="-14" y="0" width="12" height="95" rx="6" fill="url(#suitG)" />
            <rect className={walking ? "anim-walk-leg-r" : ""} x="2" y="0" width="12" height="95" rx="6" fill="url(#suitG)" />
          </g>
          <path d="M58 130 Q90 122 122 130 L130 210 Q90 220 50 210 Z" fill="url(#suitG)" />
          <rect x="86" y="125" width="8" height="80" fill="oklch(0.95 0.02 80)" opacity="0.5" />
          <g transform="translate(90 138)">
            <rect className={walking ? "anim-walk-arm-l" : "anim-breathe"} x="-42" y="0" width="11" height="78" rx="5.5" fill="url(#suitG)" />
            <rect className={walking ? "anim-walk-arm-r" : "anim-breathe"} x="31" y="0" width="11" height="78" rx="5.5" fill="url(#suitG)" />
          </g>
          <rect x="82" y="105" width="16" height="22" rx="6" fill="oklch(0.78 0.08 50)" />
          <g transform="translate(90 78)">
            <path d="M-32 -20 Q-34 -40 0 -42 Q34 -40 32 -20 Q30 -8 0 -12 Q-30 -8 -32 -20 Z" fill="oklch(0.18 0.04 30)" />
            <ellipse cx="0" cy="0" rx="30" ry="36" fill="oklch(0.78 0.08 50)" />
            <g className="anim-blink">
              <ellipse cx="-10" cy="-3" rx="3.5" ry="4.5" fill="oklch(0.15 0.04 30)" />
              <ellipse cx="10" cy="-3" rx="3.5" ry="4.5" fill="oklch(0.15 0.04 30)" />
              <circle cx="-9" cy="-4" r="1" fill="white" />
              <circle cx="11" cy="-4" r="1" fill="white" />
            </g>
            <path d="M-15 -12 Q-10 -15 -5 -12" stroke="oklch(0.18 0.04 30)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M5 -12 Q10 -15 15 -12" stroke="oklch(0.18 0.04 30)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M-7 15 Q0 20 7 15" stroke="oklch(0.45 0.12 20)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </motion.div>
  );
}
