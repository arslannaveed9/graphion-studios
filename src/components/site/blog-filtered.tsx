import Link from "next/link";
import { Section, SectionIntro } from "@/components/site/section";
import { getBlogPosts } from "@/lib/queries";
import { safe } from "@/lib/safe";

export async function BlogFilteredPage({
  kind,
  slug,
}: {
  kind: "category" | "tag";
  slug: string;
}) {
  const result = await safe(
    () => getBlogPosts(kind === "category" ? { category: slug } : { tag: slug }),
    { items: [], total: 0, page: 1, pageSize: 9, pageCount: 0 },
  );

  return (
    <Section className="border-t-0">
      <SectionIntro kicker={kind} heading={slug.replace(/-/g, " ")} />
      <div className="space-y-6">
        {result.items.map((post) => (
          <Link key={String(post._id)} href={`/blog/${post.slug}`} className="block border-t border-hairline pt-5">
            <h2 className="font-display text-3xl">{post.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
