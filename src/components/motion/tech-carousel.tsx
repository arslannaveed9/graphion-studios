"use client";

import { useReducedMotion } from "framer-motion";

type Tech = Record<string, unknown>;

export function TechCarousel({
  heading,
  kicker,
  subheading,
  technologies,
}: {
  heading?: string;
  kicker?: string;
  subheading?: string;
  technologies: Tech[];
}) {
  const reduce = useReducedMotion();
  if (!technologies.length) return null;

  const row = technologies.length < 8 ? [...technologies, ...technologies] : technologies;
  const loop = [...row, ...row];

  return (
    <div aria-label={heading || "Technologies"} className="min-w-0 w-full max-w-full">
      <div className="mb-8 max-w-3xl md:mb-10">
        <p className="kicker mb-4">{kicker || "03 / Stack"}</p>
        {heading ? <h2 className="text-3xl leading-tight text-pretty md:text-5xl">{heading}</h2> : null}
        {subheading ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{subheading}</p>
        ) : null}
      </div>

      <div className="group min-w-0 w-full overflow-hidden rounded-2xl bg-ink text-paper">
        <div
          className="flex w-max items-center gap-10 py-4 pr-10 md:gap-14 md:py-5 group-hover:[animation-play-state:paused]"
          style={reduce ? undefined : { animation: "marquee 36s linear infinite" }}
        >
          {loop.map((tech, index) => {
            const name = String(tech.name || "Technology");
            return (
              <div key={`${name}-${index}`} className="shrink-0">
                <p className="text-lg leading-none md:text-xl">{name}</p>
                <p className="mt-1.5 text-[11px] font-medium tracking-[0.18em] text-paper/50 uppercase">Stack</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
