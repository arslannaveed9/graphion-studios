"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CtaButton } from "@/components/site/cta-button";
import { Constellation } from "@/components/site/constellation";
import { OrbField } from "@/components/motion/orb-field";
import { Marquee } from "@/components/motion/marquee";
import type { HomepageSection } from "@/types";

export function HeroBlock({
  section,
  clients,
}: {
  section: HomepageSection;
  clients?: string[];
}) {
  const reduce = useReducedMotion();
  const words = (section.heading || "").split(" ").filter(Boolean);

  return (
    <section className="relative overflow-hidden">
      <OrbField />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-20">
        <div>
          {section.kicker ? <p className="kicker">{section.kicker}</p> : null}
          <h1 className="mt-6 max-w-xl text-5xl leading-[0.95] text-pretty md:text-7xl">
            {words.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                className="mr-[0.28em] inline-block"
                initial={reduce ? false : { y: 18 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">{section.subheading}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {section.primaryCta?.label ? (
              <CtaButton href={section.primaryCta.href}>{section.primaryCta.label}</CtaButton>
            ) : null}
            {section.secondaryCta?.label ? (
              <CtaButton href={section.secondaryCta.href} variant="secondary">
                {section.secondaryCta.label}
              </CtaButton>
            ) : null}
          </div>
        </div>
        <motion.div
          className="flex justify-center"
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Constellation />
        </motion.div>
      </div>
      {clients?.length ? (
        <div className="mx-auto max-w-6xl px-6 pb-12 md:px-8">
          <Marquee items={clients} />
        </div>
      ) : null}
    </section>
  );
}
