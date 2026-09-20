"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

function parseStat(value?: string) {
  const match = (value || "").match(/^([^\d]*)(\d+)(.*)$/);
  if (!match) return { prefix: "", number: null as number | null, suffix: value || "" };
  return { prefix: match[1], number: Number(match[2]), suffix: match[3] };
}

export function Counter({ value, className }: { value?: string; className?: string }) {
  const parsed = parseStat(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce || parsed.number === null ? parsed.number || 0 : 0);

  useEffect(() => {
    if (!inView || parsed.number === null || reduce) return;
    const start = performance.now();
    const duration = 1100;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(parsed.number! * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, parsed.number, reduce]);

  if (parsed.number === null) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}
      {n}
      {parsed.suffix}
    </span>
  );
}
