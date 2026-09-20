import Link from "next/link";
import Image from "next/image";
import * as Lucide from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Counter } from "@/components/motion/counter";
import { HeroBlock } from "@/components/motion/hero-block";
import { TiltCard } from "@/components/motion/tilt-card";
import { Marquee } from "@/components/motion/marquee";
import { TechCarousel } from "@/components/motion/tech-carousel";
import { CtaButton } from "@/components/site/cta-button";
import { Section, SectionIntro } from "@/components/site/section";
import { billingLabel, formatCurrency } from "@/lib/format";
import type { HomepageSection } from "@/types";

function Icon({ name, className }: { name?: string; className?: string }) {
  const Cmp = (name && (Lucide as unknown as Record<string, Lucide.LucideIcon>)[name]) || Lucide.Sparkles;
  return <Cmp className={className || "h-5 w-5 text-copper"} />;
}

const SMALL = new Set(["logos", "stats"]);

function compose(sections: HomepageSection[]) {
  const mains = sections.filter((section) => !SMALL.has(section.type)).map((main) => ({ main, extras: [] as HomepageSection[] }));

  for (const small of sections.filter((section) => SMALL.has(section.type))) {
    const index = sections.findIndex((section) => section.id === small.id);
    const previous = [...sections.slice(0, index)].reverse().find((section) => !SMALL.has(section.type));
    const next = sections.slice(index + 1).find((section) => !SMALL.has(section.type));

    let host = previous;
    if (small.type === "stats" && (next?.type === "testimonials" || next?.type === "cta")) host = next;
    if (small.type === "logos" && previous?.type === "hero") host = previous;

    const group = mains.find((item) => item.main.id === host?.id);
    if (group) group.extras.push(small);
    else mains.push({ main: small, extras: [] });
  }

  const stackAt = mains.findIndex((item) => item.main.type === "technologies");
  const methodAt = mains.findIndex((item) => item.main.type === "process");
  if (stackAt !== -1 && methodAt !== -1) {
    const [stack] = mains.splice(stackAt, 1);
    mains.splice(
      mains.findIndex((item) => item.main.type === "process"),
      0,
      stack,
    );
  }

  return mains;
}

function extraOf(extras: HomepageSection[], type: HomepageSection["type"]) {
  return extras.find((section) => section.type === type);
}

function clientNames(section?: HomepageSection) {
  const names = (section?.items || []).map((item) => item.title).filter(Boolean);
  return names.length ? names : ["Harbor Mutual", "Kitefield", "Northwind", "Aperture", "Relay Co."];
}

function StatStrip({ items }: { items: NonNullable<HomepageSection["items"]> }) {
  if (!items.length) return null;
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label || item.title} className="px-1 py-1">
          <p className="text-3xl md:text-4xl">
            <Counter value={item.value} />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export function HomepageView({
  sections,
  services,
  products,
  projects,
  testimonials,
  technologies,
}: {
  sections: HomepageSection[];
  services: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  testimonials: Array<Record<string, unknown>>;
  technologies: Array<Record<string, unknown>>;
}) {
  const groups = compose([...sections].filter((section) => section.enabled).sort((a, b) => a.order - b.order));

  return (
    <div>
      {groups.map(({ main, extras }) => {
        const logos = extraOf(extras, "logos");
        const stats = extraOf(extras, "stats");

        switch (main.type) {
          case "hero":
            return <HeroBlock key={main.id} section={main} clients={logos ? clientNames(logos) : undefined} />;
          case "logos":
            return (
              <Section key={main.id} compact>
                <MarqueeStrip names={clientNames(main)} />
              </Section>
            );
          case "services": {
            const visible = pick(services, main.featuredIds);
            if (!visible.length) return null;
            return <ServicesBlock key={main.id} section={main} services={visible} />;
          }
          case "why":
            return (
              <Section key={main.id}>
                <SectionIntro kicker={main.kicker} heading={main.heading} subheading={main.subheading} />
                <div className="grid gap-4 md:grid-cols-3">
                  {(main.items || []).map((item, i) => (
                    <TiltCard key={item.title} delay={i * 0.08} className="surface p-6">
                      <p className="text-xs font-semibold tracking-[0.18em] text-copper">0{i + 1}</p>
                      <h3 className="mt-3 text-xl">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </TiltCard>
                  ))}
                </div>
              </Section>
            );
          case "technologies":
            return (
              <Section key={main.id}>
                <TechCarousel
                  kicker={main.kicker || "03 / Stack"}
                  heading={main.heading}
                  subheading={main.subheading}
                  technologies={technologies}
                />
              </Section>
            );
          case "process":
            return (
              <Section key={main.id}>
                <SectionIntro kicker={main.kicker} heading={main.heading} />
                <ol className="relative">
                  <span
                    aria-hidden
                    className="absolute top-4 bottom-4 left-[1.05rem] w-px bg-border md:left-[1.7rem]"
                  />
                  {(main.items || []).map((item, i) => (
                    <li
                      key={item.title}
                      className="relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-border/80 py-5 last:border-b-0 md:grid-cols-[5rem_15rem_minmax(0,1fr)] md:items-baseline md:gap-x-8 md:py-6"
                    >
                      <span className="relative z-10 bg-background pr-2 font-display text-2xl leading-none text-copper md:text-4xl">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-xl md:text-2xl">{item.title}</h3>
                      <p className="col-start-2 text-sm leading-6 text-muted-foreground md:col-start-3 md:text-base">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ol>
              </Section>
            );
          case "products": {
            const visible = pick(products, main.featuredIds);
            if (!visible.length) return null;
            return (
              <Section key={main.id}>
                <SectionIntro kicker={main.kicker} heading={main.heading} subheading={main.subheading} />
                <div className="grid gap-4">
                  {visible.map((product, i) => (
                    <TiltCard key={String(product._id)} delay={i * 0.08}>
                      <Link href={`/products/${product.slug}`} className="surface group grid gap-6 overflow-hidden p-5 md:grid-cols-2 md:p-7">
                        <div>
                          <p className="kicker">SaaS product</p>
                          <h3 className="mt-3 text-3xl md:text-4xl">{String(product.name)}</h3>
                          <p className="mt-3 text-muted-foreground">{String(product.shortDescription)}</p>
                          <p className="mt-5 text-sm font-semibold text-copper">View product →</p>
                        </div>
                        {product.heroImage ? (
                          <div className="relative min-h-40 overflow-hidden rounded-2xl">
                            <Image
                              src={String(product.heroImage)}
                              alt=""
                              fill
                              className="object-cover transition duration-700 group-hover:scale-[1.05]"
                              sizes="(min-width: 768px) 40vw, 100vw"
                            />
                          </div>
                        ) : null}
                      </Link>
                    </TiltCard>
                  ))}
                </div>
              </Section>
            );
          }
          case "portfolio": {
            const visible = pick(projects, main.featuredIds);
            if (!visible.length) return null;
            return (
              <Section key={main.id}>
                <SectionIntro kicker={main.kicker} heading={main.heading} />
                {stats?.items?.length ? <StatStrip items={stats.items} /> : null}
                <div className="grid gap-6 md:grid-cols-3">
                  {visible.map((project, i) => (
                    <TiltCard key={String(project._id)} delay={i * 0.08}>
                      <Link href={`/portfolio/${project.slug}`} className="group block">
                        <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-3xl border border-border">
                          {project.heroImage ? (
                            <Image
                              src={String(project.heroImage)}
                              alt=""
                              fill
                              className="object-cover transition duration-700 group-hover:scale-[1.06]"
                              sizes="(min-width: 768px) 30vw, 100vw"
                            />
                          ) : null}
                        </div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-copper uppercase">
                          {String(project.industry || "Case study")}
                        </p>
                        <h3 className="mt-2 text-2xl">{String(project.name)}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{String(project.summary || "")}</p>
                      </Link>
                    </TiltCard>
                  ))}
                </div>
              </Section>
            );
          }
          case "stats":
            return (
              <Section key={main.id} compact>
                <StatStrip items={main.items || []} />
              </Section>
            );
          case "testimonials":
            return (
              <Section key={main.id}>
                <SectionIntro kicker={main.kicker} heading={main.heading} />
                {stats?.items?.length ? <StatStrip items={stats.items} /> : null}
                <div className="grid gap-4 md:grid-cols-2">
                  {testimonials.slice(0, 4).map((item, i) => (
                    <Reveal key={String(item._id)} delay={i * 0.08} className="surface p-6">
                      <p className="text-xl leading-snug md:text-2xl">“{String(item.quote)}”</p>
                      <footer className="mt-4 text-sm text-muted-foreground">
                        {String(item.authorName)} — {String(item.company || "")}
                      </footer>
                    </Reveal>
                  ))}
                </div>
              </Section>
            );
          case "cta":
            return (
              <Section key={main.id} compact>
                {stats?.items?.length ? <StatStrip items={stats.items} /> : null}
                <Reveal className="surface overflow-hidden px-7 py-10 md:px-12 md:py-12">
                  <h2 className="max-w-3xl text-4xl md:text-5xl">{main.heading}</h2>
                  <p className="mt-5 max-w-xl text-muted-foreground">{main.body}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    {main.primaryCta?.label ? <CtaButton href={main.primaryCta.href}>{main.primaryCta.label}</CtaButton> : null}
                    {main.secondaryCta?.label ? (
                      <CtaButton href={main.secondaryCta.href} variant="secondary">
                        {main.secondaryCta.label}
                      </CtaButton>
                    ) : null}
                  </div>
                </Reveal>
              </Section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function MarqueeStrip({ names }: { names: string[] }) {
  return <Marquee items={names} />;
}

function catalogId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object" && "$oid" in value) return String((value as { $oid: string }).$oid);
  return String(value);
}

function pick(items: Array<Record<string, unknown>>, ids?: string[]) {
  if (!items.length) return [];
  const wanted = (ids || []).map(catalogId).filter(Boolean);
  if (!wanted.length) return items;

  const map = new Map(items.map((item) => [catalogId(item._id ?? item.id), item]));
  const selected = wanted.map((id) => map.get(id)).filter(Boolean) as Array<Record<string, unknown>>;
  if (!selected.length) return items;

  const seen = new Set(selected.map((item) => catalogId(item._id ?? item.id)));
  return [...selected, ...items.filter((item) => !seen.has(catalogId(item._id ?? item.id)))];
}

function ServicesBlock({
  section,
  services,
}: {
  section: HomepageSection;
  services: Array<Record<string, unknown>>;
}) {
  return (
    <Section>
      <SectionIntro kicker={section.kicker} heading={section.heading} subheading={section.subheading} />
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service, i) => (
          <TiltCard key={String(service._id)} delay={i * 0.06}>
            <Link href={`/services/${service.slug}`} className="surface group flex h-full flex-col p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10">
                  <Icon name={String(service.icon || "Sparkles")} />
                </span>
                <span className="text-xs font-semibold tracking-[0.16em] text-copper">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-5 text-2xl group-hover:text-copper">{String(service.name)}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{String(service.shortDescription)}</p>
              <p className="mt-5 text-sm font-semibold text-copper">Explore →</p>
            </Link>
          </TiltCard>
        ))}
      </div>
    </Section>
  );
}

export function Price({
  plan,
}: {
  plan: {
    name: string;
    price?: number | null;
    currency?: string;
    billingType?: string;
    customPriceLabel?: string;
    isRecommended?: boolean;
    features?: string[];
    notIncluded?: string[];
    ctaText?: string;
    ctaHref?: string;
    notes?: string;
  };
}) {
  const amount = formatCurrency(plan.price ?? null, plan.currency || "USD");
  return (
    <div
      className={`surface flex h-full min-w-0 flex-col p-6 ${plan.isRecommended ? "border-primary/50 bg-primary/5" : ""}`}
    >
      {plan.isRecommended ? <p className="kicker mb-3">Recommended</p> : null}
      <h3 className="text-2xl">{plan.name}</h3>
      <p className="mt-4 text-4xl">
        {plan.customPriceLabel || amount || "Custom"}
        {amount ? <span className="ml-1 text-base font-medium text-muted-foreground">{billingLabel(plan.billingType || "")}</span> : null}
      </p>
      <ul className="mt-6 min-w-0 space-y-2 text-sm break-words">
        {(plan.features || []).map((feature) => (
          <li key={feature}>— {feature}</li>
        ))}
      </ul>
      {(plan.notIncluded || []).length ? (
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          {plan.notIncluded!.map((item) => (
            <li key={item}>Not included: {item}</li>
          ))}
        </ul>
      ) : null}
      {plan.notes ? <p className="mt-4 text-xs text-muted-foreground">{plan.notes}</p> : null}
      <div className="mt-auto pt-6">
        <CtaButton
          href={
            plan.ctaHref && plan.ctaHref !== "/contact"
              ? plan.ctaHref
              : `?package=${encodeURIComponent(plan.name)}#enquire`
          }
          className="w-full justify-center"
        >
          {plan.ctaText || "Enquire"}
        </CtaButton>
      </div>
    </div>
  );
}
