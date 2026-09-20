"use client";

import { motion, useReducedMotion } from "framer-motion";

export function OrbField() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl dark:bg-primary/25"
        animate={{ x: [0, 24, 0], y: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-24 h-80 w-80 rounded-full bg-primary/8 blur-3xl dark:bg-copper/20"
        animate={{ x: [0, -30, 0], y: [0, 22, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
