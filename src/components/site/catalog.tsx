import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function CatalogPageHeader({
  kicker,
  heading,
  subheading,
  count,
  noun,
}: {
  kicker: string;
  heading: string;
  subheading: string;
  count: number;
  noun: string;
}) {
  const label = count === 1 ? noun : `${noun}s`;
  return (
    <header className="mb-10 max-w-3xl md:mb-12">
      <p className="kicker mb-4">{kicker}</p>
      <h1 className="text-4xl leading-[1.05] text-pretty md:text-6xl">{heading}</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{subheading}</p>
      <p className="mt-4 text-sm text-muted-foreground">
        {count} published {label}
      </p>
    </header>
  );
}

export function CatalogBreadcrumb({
  href,
  label,
  current,
}: {
  href: string;
  label: string;
  current: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {label}
        <span className="text-border">/</span>
        <span className="text-foreground">{current}</span>
      </Link>
    </nav>
  );
}

export function ChipList({ items, className }: { items?: string[]; className?: string }) {
  if (!items?.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function FeatureGrid({
  items,
  columns = 3,
}: {
  items?: Array<{ title: string; description?: string }>;
  columns?: 2 | 3;
}) {
  if (!items?.length) return null;
  return (
    <div className={cn("grid gap-4", columns === 2 ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {items.map((item) => (
        <article key={item.title} className="surface h-full p-5 md:p-6">
          <h3 className="text-xl md:text-2xl">{item.title}</h3>
          {item.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function FaqList({ items }: { items?: Array<{ question: string; answer: string }> }) {
  if (!items?.length) return null;
  return (
    <div>
      {items.map((faq) => (
        <details key={faq.question} className="surface mb-3 px-5 py-4">
          <summary className="cursor-pointer text-xl">{faq.question}</summary>
          <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function ScreenshotStrip({ images, alt }: { images?: string[]; alt: string }) {
  const shots = (images || []).filter(Boolean);
  if (!shots.length) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {shots.map((src) => (
        <div key={src} className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border">
          <Image src={src} alt={alt} fill className="object-cover" sizes="(min-width: 768px) 45vw, 100vw" />
        </div>
      ))}
    </div>
  );
}

export function CatalogHero({
  kicker,
  title,
  description,
  image,
  imageAlt,
  logo,
  actions,
  chips,
  meta,
  breadcrumb,
}: {
  kicker: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt: string;
  logo?: string;
  actions?: ReactNode;
  chips?: string[];
  meta?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <section className="border-b border-border/80">
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-12 md:px-8 md:pt-12 md:pb-16">
        {breadcrumb}
        <div
          className={cn(
            "grid items-center gap-10",
            image ? "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" : "",
            breadcrumb ? "mt-2" : "",
          )}
        >
          <div className="min-w-0">
            <p className="kicker">{kicker}</p>
            <div className="mt-4 flex items-start gap-4">
              {logo ? (
                <div className="relative mt-1 size-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-card">
                  <Image src={logo} alt="" fill className="object-contain p-1.5" sizes="48px" />
                </div>
              ) : null}
              <h1 className="text-4xl leading-[1.05] text-pretty md:text-6xl">{title}</h1>
            </div>
            {description ? (
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">{description}</p>
            ) : null}
            {meta ? <div className="mt-5">{meta}</div> : null}
            <ChipList items={chips} className="mt-6" />
            {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {image ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border lg:aspect-[5/4]">
              <Image
                src={image}
                alt={imageAlt}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function visiblePlans<T extends { isEnabled?: boolean; order?: number }>(plans?: T[]) {
  return (plans || [])
    .filter((plan) => plan.isEnabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
