import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Price } from "@/components/site/homepage";
import { RichText } from "@/components/site/rich-text";
import { Section, SectionIntro } from "@/components/site/section";
import { CtaButton } from "@/components/site/cta-button";
import { TechCarousel } from "@/components/motion/tech-carousel";
import {
  CatalogBreadcrumb,
  CatalogHero,
  ChipList,
  FaqList,
  FeatureGrid,
  ScreenshotStrip,
  visiblePlans,
} from "@/components/site/catalog";
import { getProductBySlug } from "@/lib/queries";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { createCaptchaChallenge } from "@/lib/captcha";
import { enabledPlanNames, planPriceRange } from "@/lib/format";
import { safe } from "@/lib/safe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await safe(() => getProductBySlug(slug), null);
  if (!product) return { title: "Product" };
  return buildMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/products/${slug}`,
    image: product.heroImage || product.logo,
    seo: product.seo as never,
  });
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ package?: string }>;
}) {
  const { slug } = await params;
  const { package: selectedPackage } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const plans = visiblePlans(product.pricingPlans as Array<{ isEnabled?: boolean; order?: number; name?: string }>);
  const packages = enabledPlanNames(plans);
  const range = planPriceRange(product.pricingPlans);
  const primaryHref = !product.ctaHref || product.ctaHref === "/contact" ? "#enquire" : product.ctaHref;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: product.name,
            description: product.shortDescription,
            image: product.heroImage,
            applicationCategory: "BusinessApplication",
            url: product.websiteUrl,
            offers: plans.map((plan) => ({
              "@type": "Offer",
              name: (plan as { name?: string }).name,
              price: (plan as { price?: number | null }).price ?? undefined,
              priceCurrency: (plan as { currency?: string }).currency || "USD",
            })),
          }),
        }}
      />
      <CatalogHero
        breadcrumb={<CatalogBreadcrumb href="/products" label="Products" current={product.name} />}
        kicker="SaaS product"
        title={product.name}
        description={product.shortDescription}
        image={product.heroImage}
        imageAlt={product.name}
        logo={product.logo}
        chips={
          product.technologies?.length
            ? product.technologies.slice(0, 5)
            : product.targetAudience
        }
        meta={
          <>
            {range ? <p className="text-sm font-medium">{range}</p> : null}
            {product.technologies?.length && product.targetAudience?.length ? (
              <p className={range ? "mt-2 text-sm text-muted-foreground" : "text-sm text-muted-foreground"}>
                {product.targetAudience.join(" · ")}
              </p>
            ) : null}
          </>
        }
        actions={
          <>
            <CtaButton href={primaryHref}>{product.ctaLabel || "Request a demo"}</CtaButton>
            {product.demoUrl && product.demoUrl !== primaryHref && product.demoUrl !== "/contact" ? (
              <CtaButton href={product.demoUrl} variant="secondary">
                Demo
              </CtaButton>
            ) : null}
            {product.websiteUrl ? (
              <CtaButton href={product.websiteUrl} variant="secondary">
                Website
              </CtaButton>
            ) : null}
            {product.documentationUrl ? (
              <CtaButton href={product.documentationUrl} variant="secondary">
                Docs
              </CtaButton>
            ) : null}
            {plans.length ? (
              <CtaButton href="#pricing" variant="secondary">
                View plans
              </CtaButton>
            ) : null}
          </>
        }
      />

      {product.fullDescription ? (
        <Section>
          <RichText html={product.fullDescription} />
        </Section>
      ) : null}

      {product.screenshots?.length ? (
        <Section>
          <SectionIntro kicker="Product" heading="Inside the product." compact />
          <ScreenshotStrip images={product.screenshots} alt={`${product.name} screenshot`} />
        </Section>
      ) : null}

      {product.features?.length ? (
        <Section>
          <SectionIntro kicker="Product" heading="What it does." compact />
          <FeatureGrid items={product.features} />
        </Section>
      ) : null}

      {product.benefits?.length ? (
        <Section>
          <SectionIntro kicker="Benefits" heading="Why teams switch." />
          <div className="grid gap-6 md:grid-cols-2">
            {product.benefits.map((item) => (
              <div key={item.title}>
                <h3 className="font-display text-2xl">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {product.useCases?.length ? (
        <Section>
          <SectionIntro kicker="Use cases" heading="Where it earns its keep." compact />
          <FeatureGrid items={product.useCases} columns={2} />
        </Section>
      ) : null}

      {product.integrations?.length ? (
        <Section>
          <SectionIntro kicker="Integrations" heading="What it connects to." />
          <ChipList items={product.integrations} />
        </Section>
      ) : null}

      {product.technologies?.length ? (
        <Section>
          <TechCarousel
            kicker="Stack"
            heading="Built with tools we trust in production."
            technologies={product.technologies.map((name) => ({ name }))}
          />
        </Section>
      ) : null}

      {plans.length ? (
        <Section id="pricing" className="scroll-mt-24">
          <SectionIntro kicker="Pricing" heading="Plans that match how teams buy." compact />
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <Price key={String((plan as { name: string }).name)} plan={plan as never} />
            ))}
          </div>
        </Section>
      ) : null}

      {product.faqs?.length ? (
        <Section>
          <SectionIntro kicker="FAQ" heading="Straight answers." compact />
          <FaqList items={product.faqs} />
        </Section>
      ) : null}

      <Section id="enquire" className="scroll-mt-24">
        <SectionIntro
          kicker="Talk to product"
          heading={`Request a demo of ${product.name}.`}
          subheading={`This enquiry is recorded against ${product.name}, so the product team sees it with the right package.`}
        />
        <InquiryForm
          productSlug={product.slug}
          subjectName={product.name}
          inquiryType="product"
          packages={packages}
          selectedPackage={selectedPackage}
          captcha={createCaptchaChallenge()}
        />
      </Section>
    </>
  );
}
