import type { Metadata } from "next";
import Link from "next/link";
import { searchSite } from "@/lib/search";
import { buildMetadata } from "@/lib/seo";
import { safe } from "@/lib/safe";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search Graphion Studios.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";
  const results = query ? await safe(() => searchSite(query), []) : [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="kicker">Search</p>
      <h1 className="mt-4 text-5xl">Find a piece of work.</h1>
      <form className="mt-8 border-b border-border pb-3">
        <input
          name="q"
          defaultValue={query}
          placeholder="Services, products, journal, work"
          className="w-full bg-transparent text-2xl outline-none placeholder:text-muted-foreground"
        />
      </form>
      <div className="mt-10 space-y-4">
        {results.map((item) => (
          <Link key={`${item.type}-${item.slug}`} href={item.url} className="surface block p-7 transition hover:-translate-y-0.5">
            <p className="kicker">{item.type}</p>
            <h2 className="mt-2 text-3xl">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.excerpt}</p>
          </Link>
        ))}
        {query && !results.length ? (
          <p className="text-muted-foreground">Nothing published matches that yet.</p>
        ) : null}
      </div>
    </div>
  );
}
