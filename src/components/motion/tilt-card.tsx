"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("h-full", className)}
      initial={reduce ? false : { y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={reduce ? undefined : { y: -8, scale: 1.01 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
