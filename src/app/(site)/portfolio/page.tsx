import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Section, SectionIntro } from "@/components/site/section";
import { getProjects } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { safe } from "@/lib/safe";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description: "Selected platforms, products, and operational systems.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const projects = await safe(getProjects, []);
  return (
    <Section className="pt-16 md:pt-24">
      <SectionIntro kicker="Selected work" heading="Quiet systems. Visible results." />
      <div className="grid gap-8 md:grid-cols-2">
        {projects.map((project) => (
          <Link key={String(project._id)} href={`/portfolio/${project.slug}`} className="group">
            <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-3xl border border-border">
              {project.heroImage ? (
                <Image
                  src={project.heroImage}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  sizes="(min-width:768px) 45vw, 100vw"
                />
              ) : null}
            </div>
            <p className="kicker">{project.industry}</p>
            <h2 className="mt-3 text-3xl">{project.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
