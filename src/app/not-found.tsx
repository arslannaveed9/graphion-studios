import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6">
      <p className="kicker">404</p>
      <h1 className="mt-4 font-display text-5xl">This page is not on the map.</h1>
      <p className="mt-4 text-muted-foreground">It may have been unpublished, renamed, or never existed.</p>
      <Link href="/" className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-copper">
        Return home
      </Link>
    </div>
  );
}
