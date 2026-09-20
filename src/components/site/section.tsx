import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  id,
  compact = false,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  compact?: boolean;
}) {
  return (
    <section id={id} className={cn("relative", compact ? "py-8 md:py-10" : "py-14 md:py-20", className)}>
      <div className="mx-auto w-full max-w-6xl px-6 md:px-8">{children}</div>
    </section>
  );
}

export function SectionIntro({
  kicker,
  heading,
  subheading,
  compact = false,
}: {
  kicker?: string;
  heading?: string;
  subheading?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", compact ? "mb-6" : "mb-8 md:mb-10")}>
      {kicker ? <p className="kicker mb-4">{kicker}</p> : null}
      {heading ? (
        <h2 className="text-3xl leading-tight text-pretty md:text-5xl">{heading}</h2>
      ) : null}
      {subheading ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{subheading}</p>
      ) : null}
    </div>
  );
}
