import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CtaButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight transition duration-300",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-[0_12px_30px_-16px] shadow-primary hover:-translate-y-0.5 hover:brightness-110",
        variant === "secondary" &&
          "border border-border bg-background/70 text-foreground hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card",
        className,
      )}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
