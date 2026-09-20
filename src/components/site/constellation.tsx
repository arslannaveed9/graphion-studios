"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Constellation() {
  const reduce = useReducedMotion();

  return (
    <div className="relative aspect-square w-full max-w-lg">
      <motion.div
        className="absolute inset-8 rounded-full border border-primary/20"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-16 rounded-full border border-dashed border-copper/30"
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <svg viewBox="0 0 400 400" className="h-full w-full text-copper" aria-hidden>
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="180" fill="url(#glow)" />
        <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5">
          <polygon points="80,90 200,40 330,110 300,250 160,320 70,210" />
          <line x1="200" y1="40" x2="160" y2="320" />
          <line x1="80" y1="90" x2="300" y2="250" />
          <line x1="330" y1="110" x2="70" y2="210" />
        </g>
        {[
          [80, 90],
          [200, 40],
          [330, 110],
          [300, 250],
          [160, 320],
          [70, 210],
          [200, 190],
        ].map(([x, y], i) => (
          <motion.circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={i === 6 ? 6 : 3.8}
            fill="currentColor"
            animate={reduce ? undefined : { opacity: [0.4, 1, 0.4], scale: [1, 1.25, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </svg>
    </div>
  );
}
