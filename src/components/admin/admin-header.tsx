import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="kicker">Admin</p>
        <h1 className="mt-2 font-display text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actionHref ? (
        <Button asChild className="rounded-none">
          <Link href={actionHref}>{actionLabel || "Create"}</Link>
        </Button>
      ) : null}
    </div>
  );
}
