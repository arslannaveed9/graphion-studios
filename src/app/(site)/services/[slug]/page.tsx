import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Price } from "@/components/site/homepage";
import { RichText } from "@/components/site/rich-text";
import { Section, SectionIntro } from "@/components/site/section";
import { CtaButton } from "@/components/site/cta-button";
import { TechCarousel } from "@/components/motion/tech-carousel";
import { CatalogBreadcrumb, CatalogHero, FaqList, FeatureGrid, ScreenshotStrip, visiblePlans } from "@/components/site/catalog";
import { getServiceBySlug, getTestimonials } from "@/lib/queries";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { createCaptchaChallenge } from "@/lib/captcha";
import { enabledPlanNames, firstImage, planPriceRange } from "@/lib/format";
import { safe } from "@/lib/safe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await safe(() => getServiceBySlug(slug), null);
  if (!service) return { title: "Service" };
  const cover = firstImage(service.heroImage, service.gallery);
  return buildMetadata({
    title: service.name,
    description: service.shortDescription,
    path: `/services/${slug}`,
    image: cover,
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
    safe(() => getTestimonials({ limit: 8 }), []),
  ]);
  if (!service) notFound();

  const plans = visiblePlans(service.pricingPlans);
  const packages = enabledPlanNames(plans);
  const range = planPriceRange(plans);
  const cover = firstImage(service.heroImage, service.gallery);
  const gallery = (service.gallery || []).filter(Boolean);
  const relatedIds = (service.relatedTestimonialIds || []).map((id) => String(id));
  const quotes = relatedIds.length
    ? testimonials.filter((item) => relatedIds.includes(String(item._id))).slice(0, 2)
    : testimonials.slice(0, 2);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.shortDescription,
    image: cover,
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price ?? undefined,
      priceCurrency: plan.currency || "USD",
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <CatalogHero
        breadcrumb={<CatalogBreadcrumb href="/services" label="Services" current={service.name} />}
        kicker="Service"
        title={service.name}
        description={service.shortDescription}
        image={cover}
        imageAlt={service.name}
        chips={(service.technologies || []).slice(0, 5)}
        meta={range ? <p className="text-sm font-medium">{range}</p> : null}
        actions={
          <>
            <CtaButton href="#enquire">{service.customProjectCta || "Start this engagement"}</CtaButton>
            {plans.length ? (
              <CtaButton href="#pricing" variant="secondary">
                View packages
              </CtaButton>
            ) : null}
          </>
        }
      />

      {gallery.length ? (
        <Section>
          <SectionIntro kicker="Gallery" heading="From this engagement." compact />
          <ScreenshotStrip images={gallery} alt={service.name} />
        </Section>
      ) : null}

      {service.fullDescription || service.problem || service.solution ? (
        <Section>
          {service.problem || service.solution ? (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
              <div className="min-w-0">
                <RichText html={service.fullDescription} />
              </div>
              <div className="grid gap-4 self-start">
                {service.problem ? (
                  <div className="surface p-5">
                    <p className="kicker">Problem</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.problem}</p>
                  </div>
                ) : null}
                {service.solution ? (
                  <div className="surface p-5">
                    <p className="kicker">Solution</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.solution}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <RichText html={service.fullDescription} />
          )}
        </Section>
      ) : null}

      {service.features?.length ? (
        <Section>
          <SectionIntro kicker="Features" heading="What the engagement includes." compact />
          <FeatureGrid items={service.features} />
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

      {service.process?.length ? (
        <Section>
          <SectionIntro kicker="Process" heading="How the work moves." compact />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, i) => (
              <li key={step.title} className="surface p-5">
                <p className="text-xs font-semibold tracking-[0.16em] text-copper">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl md:text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {service.technologies?.length ? (
        <Section>
          <TechCarousel
            kicker="Stack"
            heading="The tools this engagement actually runs on."
            technologies={service.technologies.map((name) => ({ name }))}
          />
        </Section>
      ) : null}

      {service.included?.length || service.notIncluded?.length ? (
        <Section>
          <div className="grid gap-4 md:grid-cols-2">
            {service.included?.length ? (
              <div className="surface p-5">
                <p className="kicker">Included</p>
                <ul className="mt-4 space-y-2 text-sm leading-6">
                  {service.included.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {service.notIncluded?.length ? (
              <div className="surface p-5">
                <p className="kicker">Not included</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                  {service.notIncluded.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {plans.length ? (
        <Section id="pricing" className="scroll-mt-24">
          <SectionIntro kicker="Pricing" heading="Packages, not guesswork." subheading={service.pricingNotes} compact />
          <div className="grid items-stretch gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Price key={String(plan._id || plan.name)} plan={plan} />
            ))}
          </div>
        </Section>
      ) : null}

      {service.faqs?.length ? (
        <Section>
          <SectionIntro kicker="FAQ" heading="Straight answers." compact />
          <FaqList items={service.faqs} />
        </Section>
      ) : null}

      {quotes.length ? (
        <Section>
          <SectionIntro kicker="Clients" heading="In their words." compact />
          <div className="grid gap-4 md:grid-cols-2">
            {quotes.map((item) => (
              <blockquote key={String(item._id)} className="surface p-6">
                <p className="text-xl leading-snug md:text-2xl">“{item.quote}”</p>
                <footer className="mt-3 text-sm text-muted-foreground">
                  {item.authorName}
                  {item.company ? `, ${item.company}` : ""}
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
