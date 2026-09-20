"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6">
      <p className="kicker">500</p>
      <h1 className="mt-4 font-display text-5xl">Something failed on our side.</h1>
      <p className="mt-4 text-muted-foreground">The technical detail has been kept off this page. Please try again.</p>
      <Link href="/" className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-copper">
        Return home
      </Link>
    </div>
  );
}
