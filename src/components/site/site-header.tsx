"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { CtaButton } from "@/components/site/cta-button";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/types";

export function SiteHeader({
  items,
  ctaLabel = "Start a project",
  logoSrc,
  companyName,
}: {
  items: NavItem[];
  ctaLabel?: string;
  logoSrc?: string;
  companyName?: string;
}) {
  const [open, setOpen] = useState(false);
  const visible = items.filter((item) => item.isEnabled !== false).sort((a, b) => a.order - b.order);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5 md:px-8 md:py-4">
        <Logo src={logoSrc} name={companyName} />
        <nav className="hidden items-center gap-7 lg:flex">
          {visible.map((item) => (
            <div key={item.id} className="group relative">
              <Link
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
              {item.children?.length ? (
                <div className="invisible absolute left-0 top-full z-20 mt-3 min-w-56 rounded-2xl border border-border bg-card py-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                  {item.children
                    .filter((child) => child.isEnabled !== false)
                    .sort((a, b) => a.order - b.order)
                    .map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        {child.label}
                      </Link>
                    ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" className="rounded-full text-muted-foreground">
            <Link href="/search" aria-label="Search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <CtaButton href="/contact" className="hidden h-10 px-5 sm:inline-flex">
            {ctaLabel}
          </CtaButton>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border bg-background px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-4">
            {visible.map((item) => (
              <div key={item.id}>
                <Link href={item.href} className="text-base font-medium" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
                {item.children?.length ? (
                  <div className="mt-2 flex flex-col gap-2 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="text-sm text-muted-foreground"
                        onClick={() => setOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <CtaButton href="/contact">Start a project</CtaButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}
