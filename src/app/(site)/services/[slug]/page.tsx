import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Price } from "@/components/site/homepage";
import { RichText } from "@/components/site/rich-text";
import { Section, SectionIntro } from "@/components/site/section";
import { CtaButton } from "@/components/site/cta-button";
import { getServiceBySlug, getTestimonials } from "@/lib/queries";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { createCaptchaChallenge } from "@/lib/captcha";
import { enabledPlanNames } from "@/lib/format";
import { safe } from "@/lib/safe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await safe(() => getServiceBySlug(slug), null);
  if (!service) return { title: "Service" };
  return buildMetadata({
    title: service.name,
    description: service.shortDescription,
    path: `/services/${slug}`,
    image: service.heroImage,
    seo: service.seo as never,
  });
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ package?: string }>;
}) {
  const { slug } = await params;
  const { package: selectedPackage } = await searchParams;
  const [service, testimonials] = await Promise.all([
    getServiceBySlug(slug),
    safe(getTestimonials, []),
  ]);
  if (!service) notFound();
  const packages = enabledPlanNames(service.pricingPlans);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.shortDescription,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <section className="border-b border-border/80">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
          <p className="kicker">Service</p>
          <h1 className="mt-4 max-w-3xl text-6xl">{service.name}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{service.shortDescription}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaButton href="#enquire">{service.customProjectCta || "Start this engagement"}</CtaButton>
          </div>
        </div>
      </section>
      {service.heroImage ? (
        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <div className="relative aspect-[16/8] overflow-hidden rounded-3xl border border-border">
            <Image src={service.heroImage} alt="" fill className="object-cover" sizes="100vw" priority />
          </div>
        </div>
      ) : null}

      <Section>
        <RichText html={service.fullDescription} />
        {(service.problem || service.solution) && (
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="surface p-6">
              <p className="kicker">Problem</p>
              <p className="mt-3 text-muted-foreground">{service.problem}</p>
            </div>
            <div className="surface p-6">
              <p className="kicker">Solution</p>
              <p className="mt-3 text-muted-foreground">{service.solution}</p>
            </div>
          </div>
        )}
      </Section>

      {service.features?.length ? (
        <Section>
          <SectionIntro kicker="Features" heading="What the engagement includes." />
          <div className="grid gap-8 md:grid-cols-3">
            {service.features.map((item) => (
              <div key={item.title} className="surface p-6">
                <h3 className="text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {service.benefits?.length ? (
        <Section>
          <SectionIntro kicker="Benefits" heading="Why clients staff this." />
          <div className="grid gap-6 md:grid-cols-2">
            {service.benefits.map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-2xl">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {service.technologies?.length ? (
        <Section>
          <p className="kicker mb-6">Technologies</p>
          <div className="flex flex-wrap gap-2">
            {service.technologies.map((tech) => (
              <span key={tech} className="rounded-full border border-border bg-card px-3 py-2 text-xs font-medium">
                {tech}
              </span>
            ))}
          </div>
        </Section>
      ) : null}

      {service.process?.length ? (
        <Section>
          <SectionIntro kicker="Process" heading="How the work moves." />
          <ol className="grid gap-6 md:grid-cols-4">
            {service.process.map((step, i) => (
              <li key={step.title} className="surface p-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-copper">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {service.pricingPlans?.filter((p) => p.isEnabled !== false).length ? (
        <Section>
          <SectionIntro kicker="Pricing" heading="Packages, not guesswork." subheading={service.pricingNotes} />
          <div className="grid gap-4 md:grid-cols-3">
            {service.pricingPlans
              .filter((p) => p.isEnabled !== false)
              .sort((a, b) => a.order - b.order)
              .map((plan) => (
                <Price key={String(plan._id || plan.name)} plan={plan} />
              ))}
          </div>
        </Section>
      ) : null}

      {service.faqs?.length ? (
        <Section>
          <SectionIntro kicker="FAQ" heading="Straight answers." />
          {service.faqs.map((faq) => (
            <details key={faq.question} className="surface mb-3 px-5 py-4">
              <summary className="cursor-pointer text-xl">{faq.question}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </Section>
      ) : null}

      {testimonials.length ? (
        <Section>
          <SectionIntro kicker="Clients" heading="In their words." />
          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.slice(0, 2).map((item) => (
              <blockquote key={String(item._id)} className="surface p-6">
                <p className="text-2xl">“{item.quote}”</p>
                <footer className="mt-3 text-sm text-muted-foreground">
                  {item.authorName}, {item.company}
                </footer>
              </blockquote>
            ))}
          </div>
        </Section>
      ) : null}

      <Section id="enquire" className="scroll-mt-24">
        <SectionIntro
          kicker={service.enableCustomProject ? "Custom project" : "Enquire"}
          heading={
            service.enableCustomProject
              ? service.customProjectHeading || "Need something different?"
              : `Start ${service.name}`
          }
          subheading={
            service.enableCustomProject
              ? service.customProjectBody ||
                "Tell us what you need and we’ll create a custom solution."
              : `This enquiry is recorded against ${service.name}, so the right producer sees it.`
          }
        />
        <InquiryForm
          serviceSlug={service.slug}
          subjectName={service.name}
          inquiryType={service.enableCustomProject ? "custom_project" : "service"}
          packages={packages}
          selectedPackage={selectedPackage}
          captcha={createCaptchaChallenge()}
        />
      </Section>
    </>
  );
}
