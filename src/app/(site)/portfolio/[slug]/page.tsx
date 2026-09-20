import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { RichText } from "@/components/site/rich-text";
import { Section, SectionIntro } from "@/components/site/section";
import { getProjectBySlug } from "@/lib/queries";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { safe } from "@/lib/safe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await safe(() => getProjectBySlug(slug), null);
  if (!project) return { title: "Case study" };
  return buildMetadata({
    title: project.name,
    description: project.summary,
    path: `/portfolio/${slug}`,
    image: project.heroImage,
    seo: project.seo as never,
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.name,
            description: project.summary,
          }),
        }}
      />
      <section className="mx-auto max-w-6xl px-6 py-16 md:px-8">
        <p className="kicker">{project.industry} {project.client ? `/ ${project.client}` : ""}</p>
        <h1 className="mt-4 text-5xl md:text-6xl">{project.name}</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{project.summary}</p>
      </section>
      {project.heroImage ? (
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <div className="relative aspect-[16/8] overflow-hidden rounded-3xl">
            <Image src={project.heroImage} alt="" fill className="object-cover" sizes="100vw" priority />
          </div>
        </div>
      ) : null}
      <Section>
        <RichText html={project.description} />
      </Section>
      {(project.challenges || project.solution) && (
        <Section>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="surface p-6">
              <p className="kicker">Challenge</p>
              <p className="mt-4 text-muted-foreground">{project.challenges}</p>
            </div>
            <div className="surface p-6">
              <p className="kicker">Solution</p>
              <p className="mt-4 text-muted-foreground">{project.solution}</p>
            </div>
          </div>
        </Section>
      )}
      {project.results?.length ? (
        <Section>
          <SectionIntro kicker="Results" heading="What changed." />
          <div className="grid gap-8 md:grid-cols-3">
            {project.results.map((result) => (
              <div key={result.label} className="surface p-6">
                <p className="text-4xl">{result.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{result.label}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
      {project.testimonialQuote ? (
        <Section>
          <blockquote className="max-w-3xl">
            <p className="font-display text-3xl md:text-4xl">“{project.testimonialQuote}”</p>
            <footer className="mt-4 text-sm text-muted-foreground">{project.testimonialAuthor}</footer>
          </blockquote>
        </Section>
      ) : null}
    </>
  );
}
