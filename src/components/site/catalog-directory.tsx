"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { planPriceRange } from "@/lib/format";

export type CatalogItem = {
  _id: unknown;
  name: string;
  slug: string;
  shortDescription: string;
  heroImage?: string;
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
  const needle = query.trim().toLowerCase();
  const plural = `${noun}s`;

  const visible = useMemo(() => {
    if (!needle) return items;
    return items.filter((item) => {
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
        <div className="grid gap-6">
          {visible.map((item) => {
            const range = planPriceRange(item.pricingPlans);
            return (
              <Link
                key={String(item._id)}
                href={`${hrefPrefix}/${item.slug}`}
                className="surface group grid gap-6 overflow-hidden p-6 transition hover:-translate-y-1 md:grid-cols-2 md:p-8"
              >
                <div>
                  <h2 className="text-4xl group-hover:text-copper">{item.name}</h2>
                  <p className="mt-4 text-muted-foreground">{item.shortDescription}</p>
                  {range ? <p className="mt-4 text-sm font-medium">{range}</p> : null}
                  <p className="mt-6 text-sm font-semibold text-copper">{cta}</p>
                </div>
                {item.heroImage ? (
                  <div className="relative min-h-48 overflow-hidden rounded-2xl">
                    <Image
                      src={item.heroImage}
                      alt=""
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      sizes="50vw"
                    />
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">No {plural} match that search.</p>
      )}
    </div>
  );
}
