import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Section, SectionIntro } from "@/components/site/section";
import { getBlogPosts } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { safe } from "@/lib/safe";

export const metadata: Metadata = buildMetadata({
  title: "Journal",
  description: "Notes on delivery, architecture, and shipping software that lasts.",
  path: "/blog",
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const result = await safe(() => getBlogPosts({ page: Number(page || 1) }), {
    items: [],
    total: 0,
    page: 1,
    pageSize: 9,
    pageCount: 0,
  });

  return (
    <Section className="pt-16 md:pt-24">
      <SectionIntro kicker="Journal" heading="Notes from the studio." />
      <div className="grid gap-8 md:grid-cols-3">
        {result.items.map((post) => (
          <Link key={String(post._id)} href={`/blog/${post.slug}`} className="group">
            <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-3xl border border-border">
              {post.featuredImage ? (
                <Image src={post.featuredImage} alt="" fill className="object-cover transition duration-700 group-hover:scale-[1.04]" sizes="30vw" />
              ) : null}
            </div>
            <p className="kicker">
              {post.category && typeof post.category === "object" && "name" in post.category
                ? String(post.category.name)
                : "Journal"}
            </p>
            <h2 className="mt-3 text-2xl group-hover:text-copper">{post.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>
      {result.pageCount > 1 ? (
        <div className="mt-12 flex gap-3 text-sm font-semibold">
          {Array.from({ length: result.pageCount }).map((_, i) => (
            <Link
              key={i}
              href={`/blog?page=${i + 1}`}
              className={result.page === i + 1 ? "text-copper" : "text-muted-foreground"}
            >
              {String(i + 1).padStart(2, "0")}
            </Link>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
