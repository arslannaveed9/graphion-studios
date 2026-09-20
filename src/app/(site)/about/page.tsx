import type { Metadata } from "next";
import Image from "next/image";
import { Section, SectionIntro } from "@/components/site/section";
import { CtaButton } from "@/components/site/cta-button";
import { getAbout, getTeam, getTechnologies } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { safe } from "@/lib/safe";

export const metadata: Metadata = buildMetadata({
  title: "Studio",
  description: "Graphion Studios is an independent technology practice.",
  path: "/about",
});

export default async function AboutPage() {
  const [about, team, technologies] = await Promise.all([
    safe(getAbout, null),
    safe(getTeam, []),
    safe(getTechnologies, []),
  ]);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-8">
        <div>
          <p className="kicker">Studio</p>
          <h1 className="mt-4 text-5xl md:text-6xl">
            {about?.introductionHeading || "A small studio for serious software."}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{about?.introduction}</p>
        </div>
        {about?.heroImage ? (
          <div className="relative min-h-80 overflow-hidden rounded-3xl">
            <Image src={about.heroImage} alt="" fill className="object-cover" sizes="50vw" />
          </div>
        ) : null}
      </section>
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface p-8">
            <p className="kicker">Mission</p>
            <p className="mt-4 text-3xl">{about?.mission}</p>
          </div>
          <div className="surface p-8">
            <p className="kicker">Vision</p>
            <p className="mt-4 text-3xl">{about?.vision}</p>
          </div>
        </div>
      </Section>
      <Section>
        <SectionIntro kicker="Story" heading="Why we exist." />
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{about?.story}</p>
      </Section>
      <Section>
        <SectionIntro kicker="Values" heading="How we decide." />
        <div className="grid gap-4 md:grid-cols-3">
          {(about?.values || []).map((value) => (
            <div key={value.title} className="surface p-6">
              <h3 className="text-2xl">{value.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>
      {about?.stats?.length ? (
        <Section>
          <div className="grid gap-4 md:grid-cols-3">
            {about.stats.map((stat) => (
              <div key={stat.label} className="surface p-6">
                <p className="text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
      <Section>
        <SectionIntro kicker="People" heading="The studio." />
        <div className="grid gap-6 md:grid-cols-4">
          {team.map((member) => (
            <article key={String(member._id)}>
              {member.image ? (
                <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-3xl border border-border">
                  <Image src={member.image} alt={member.name} fill className="object-cover" sizes="25vw" />
                </div>
              ) : null}
              <h3 className="text-2xl">{member.name}</h3>
              <p className="text-xs font-semibold tracking-[0.16em] text-copper uppercase">{member.position}</p>
              <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section>
        <p className="kicker mb-6">Technologies</p>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span key={String(tech._id)} className="rounded-full border border-border bg-card px-3 py-2 text-xs font-medium">
              {tech.name}
            </span>
          ))}
        </div>
      </Section>
      <Section>
        <div className="surface px-8 py-12">
          <h2 className="text-4xl">{about?.ctaHeading}</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">{about?.ctaBody}</p>
          <div className="mt-8">
            <CtaButton href={about?.ctaHref || "/contact"}>{about?.ctaLabel || "Contact"}</CtaButton>
          </div>
        </div>
      </Section>
    </>
  );
}
