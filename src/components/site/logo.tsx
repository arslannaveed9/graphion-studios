import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-2xl bg-primary/15 text-copper">
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden>
          <circle cx="8" cy="8" r="2.2" fill="currentColor" />
          <circle cx="24" cy="10" r="2.2" fill="currentColor" />
          <circle cx="16" cy="24" r="2.2" fill="currentColor" />
          <path d="M8 8 L24 10 L16 24 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-sm tracking-tight">Graphion</span>
          <span className="mt-0.5 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">Studios</span>
        </span>
      ) : null}
    </Link>
  );
}
