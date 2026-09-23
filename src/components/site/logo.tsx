import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  src,
  srcLight,
  name,
}: {
  className?: string;
  compact?: boolean;
  /** Logo for dark mode (lighter mark on dark backgrounds). */
  src?: string;
  /** Logo for light mode (darker mark on light backgrounds). */
  srcLight?: string;
  name?: string;
}) {
  const label = name || "Graphion Studios";
  const dark = typeof src === "string" ? src.trim() : "";
  const light = typeof srcLight === "string" ? srcLight.trim() : "";
  const darkSrc = dark || light;
  const lightSrc = light || dark;
  const size = cn(
    "w-auto object-contain object-left",
    compact
      ? "h-11 max-h-11 max-w-[12rem] sm:h-12 sm:max-w-[14rem]"
      : "h-12 max-h-14 max-w-[15rem] sm:h-14 sm:max-w-[18rem]",
  );

  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label={label}>
      {darkSrc || lightSrc ? (
        <>
          {lightSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lightSrc} alt={label} className={cn(size, "dark:hidden")} />
          ) : null}
          {darkSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={darkSrc} alt={label} className={cn(size, "hidden dark:block")} />
          ) : null}
        </>
      ) : (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display tracking-tight", compact ? "text-base" : "text-lg sm:text-xl")}>
            {label.split(" ")[0] || "Graphion"}
          </span>
          {!compact ? (
            <span className="mt-1 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {label.split(" ").slice(1).join(" ") || "Studios"}
            </span>
          ) : null}
        </span>
      )}
    </Link>
  );
}
