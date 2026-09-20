import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@/components/site/rich-text";
import { getLegalPage } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { safe } from "@/lib/safe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await safe(() => getLegalPage(slug), null);
  if (!page) return { title: "Legal" };
  return buildMetadata({
    title: page.title,
    description: page.excerpt,
    path: `/legal/${slug}`,
    seo: page.seo as never,
  });
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) notFound();
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <p className="kicker">Legal</p>
      <h1 className="mt-4 font-display text-5xl">{page.title}</h1>
      <div className="mt-10">
        <RichText html={page.content} />
      </div>
    </article>
  );
}
