"use client";

import { useReducedMotion } from "framer-motion";

export function Marquee({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  const list = items.length ? items : ["Graphion"];
  const loop = [...list, ...list];

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex w-max gap-10 pr-10"
        style={reduce ? undefined : { animation: "marquee 32s linear infinite" }}
      >
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
