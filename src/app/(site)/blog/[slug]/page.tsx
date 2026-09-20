import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { RichText } from "@/components/site/rich-text";
import { getPostBySlug } from "@/lib/queries";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { safe } from "@/lib/safe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await safe(() => getPostBySlug(slug), null);
  if (!post) return { title: "Journal" };
  const authorName =
    post.author && typeof post.author === "object" && "name" in post.author
      ? String(post.author.name)
      : undefined;
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    image: post.featuredImage,
    seo: post.seo as never,
    type: "article",
    publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    authors: authorName ? [authorName] : undefined,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const author =
    post.author && typeof post.author === "object" && "name" in post.author ? post.author : null;
  const category =
    post.category && typeof post.category === "object" && "slug" in post.category ? post.category : null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 md:px-0 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            datePublished: post.publishedAt,
            description: post.excerpt,
            image: post.featuredImage,
            author: author ? { "@type": "Person", name: author.name } : undefined,
          }),
        }}
      />
      <p className="kicker">
        <Link href="/blog">Journal</Link>
            {category ? (
          <>
            {" / "}
            <Link href={`/blog/category/${String(category.slug)}`}>
              {"name" in category ? String((category as { name?: string }).name) : "Category"}
            </Link>
          </>
        ) : null}
      </p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl">{post.title}</h1>
      <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {author ? String(author.name) : "Graphion"} · {post.readingMinutes || 5} min
      </p>
      {post.featuredImage ? (
        <div className="relative my-10 aspect-[16/9] overflow-hidden border border-hairline">
          <Image src={post.featuredImage} alt="" fill className="object-cover" sizes="800px" priority />
        </div>
      ) : null}
      <RichText html={post.content} />
    </article>
  );
}
