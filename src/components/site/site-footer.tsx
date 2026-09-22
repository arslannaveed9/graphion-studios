import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { NewsletterForm } from "@/components/site/inquiry-form";
import type { FooterColumn } from "@/types";

export function SiteFooter({
  columns,
  copyright,
  newsletterEnabled,
  newsletterHeading,
  newsletterBody,
  email,
  address,
  logoSrc,
  companyName,
}: {
  columns: FooterColumn[];
  copyright?: string;
  newsletterEnabled?: boolean;
  newsletterHeading?: string;
  newsletterBody?: string;
  email?: string;
  address?: string;
  logoSrc?: string;
  companyName?: string;
}) {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-4">
          <Logo src={logoSrc} name={companyName} />
          <p className="mt-6 max-w-xs text-sm leading-6 text-muted-foreground">
            Custom platforms, product engineering, and SaaS we operate ourselves.
          </p>
          {email ? <p className="mt-4 text-sm font-medium text-copper">{email}</p> : null}
          {address ? <p className="mt-2 text-sm text-muted-foreground">{address}</p> : null}
        </div>
        {columns
          .sort((a, b) => a.order - b.order)
          .map((column) => (
            <div key={column.id} className="md:col-span-2">
              <p className="mb-4 text-sm font-semibold">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        {newsletterEnabled ? (
          <div className="md:col-span-4">
            <p className="kicker mb-4">Letter</p>
            <h2 className="text-2xl">{newsletterHeading || "A short letter, occasionally."}</h2>
            <p className="mt-3 mb-5 text-sm text-muted-foreground">{newsletterBody}</p>
            <NewsletterForm />
          </div>
        ) : null}
      </div>
      <div className="border-t border-border/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground md:px-8">
          <span>{copyright || "© Graphion Studios"}</span>
          <span>Built as a living CMS, not a brochure.</span>
        </div>
      </div>
    </footer>
  );
}
