"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { planPriceRange } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CatalogItem = {
  _id: unknown;
  name: string;
  slug: string;
  shortDescription: string;
  heroImage?: string;
  logo?: string;
  icon?: string;
  featured?: boolean;
  technologies?: string[];
  targetAudience?: string[];
  pricingPlans?: Array<{
    name?: string;
    price?: number | null;
    currency?: string;
    billingType?: string;
    customPriceLabel?: string;
    isCustom?: boolean;
    isEnabled?: boolean;
  }>;
};

export function CatalogDirectory({
  items,
  noun,
  hrefPrefix,
  cta,
}: {
  items: CatalogItem[];
  noun: "service" | "product";
  hrefPrefix: string;
  cta: string;
}) {
  const [query, setQuery] = useState("");
  const needle = useDeferredValue(query.trim().toLowerCase());
  const plural = `${noun}s`;

  const visible = useMemo(() => {
    const ranked = [...items].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    if (!needle) return ranked;
    return ranked.filter((item) => {
      const haystack = [
        item.name,
        item.shortDescription,
        ...(item.technologies || []),
        ...(item.targetAudience || []),
        ...(item.pricingPlans || []).map((plan) => plan.name || ""),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, needle]);

  return (
    <div>
      <form role="search" className="mb-8" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor={`${noun}-search`} className="sr-only">
          Search {plural}
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id={`${noun}-search`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${plural}`}
            className="h-12 w-full rounded-full border border-border bg-card pr-4 pl-11 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        {needle ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {visible.length} of {items.length} {items.length === 1 ? noun : plural}
          </p>
        ) : null}
      </form>

      {visible.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((item, index) => (
            <CatalogCard
              key={String(item._id)}
              item={item}
              href={`${hrefPrefix}/${item.slug}`}
              cta={cta}
              featured={Boolean(item.featured) && index === 0 && !needle}
              priority={index === 0}
            />
          ))}
        </div>
      ) : items.length ? (
        <p className="text-muted-foreground">No {plural} match that search.</p>
      ) : (
        <p className="text-muted-foreground">No published {plural} yet.</p>
      )}
    </div>
  );
}

function CatalogCard({
  item,
  href,
  cta,
  featured,
  priority,
}: {
  item: CatalogItem;
  href: string;
  cta: string;
  featured: boolean;
  priority: boolean;
}) {
  const range = planPriceRange(item.pricingPlans);
  const chips = (item.technologies?.length ? item.technologies : item.targetAudience || []).slice(0, 4);

  return (
    <Link
      href={href}
      className={cn(
        "surface group flex h-full overflow-hidden transition duration-300 hover:-translate-y-1",
        featured ? "flex-col md:col-span-2 md:grid md:grid-cols-2" : "flex-col",
      )}
    >
      <div className={cn("relative overflow-hidden bg-muted/40", featured ? "aspect-[16/10] md:aspect-auto md:min-h-72" : "aspect-[16/10]")}>
        {item.heroImage ? (
          <Image
            src={item.heroImage}
            alt={item.name}
            fill
            priority={priority}
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 45vw, 100vw"}
          />
        ) : (
          <div className="flex h-full min-h-48 items-end p-6">
            <span className="font-display text-6xl text-copper/30">{item.name.slice(0, 1)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-2">
          {featured ? <p className="kicker">Featured</p> : null}
          {item.logo ? (
            <span className="relative size-7 overflow-hidden rounded-lg border border-border bg-card">
              <Image src={item.logo} alt="" fill className="object-contain p-0.5" sizes="28px" />
            </span>
          ) : null}
        </div>
        <h2 className={cn("text-balance group-hover:text-copper", featured ? "mt-3 text-3xl md:text-5xl" : "mt-3 text-2xl md:text-3xl")}>
          {item.name}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground md:text-base">{item.shortDescription}</p>
        {chips.length ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <li key={chip} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                {chip}
              </li>
            ))}
          </ul>
        ) : null}
        {range ? <p className="mt-4 text-sm font-medium">{range}</p> : null}
        <p className="mt-auto pt-5 text-sm font-semibold text-copper">{cta}</p>
      </div>
    </Link>
  );
}
