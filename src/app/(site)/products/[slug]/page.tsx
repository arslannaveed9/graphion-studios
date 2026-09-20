import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Price } from "@/components/site/homepage";
import { RichText } from "@/components/site/rich-text";
import { Section, SectionIntro } from "@/components/site/section";
import { CtaButton } from "@/components/site/cta-button";
import { getProductBySlug } from "@/lib/queries";
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
  const product = await safe(() => getProductBySlug(slug), null);
  if (!product) return { title: "Product" };
  return buildMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/products/${slug}`,
    image: product.heroImage,
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
  const packages = enabledPlanNames(
    product.pricingPlans as Array<{ name?: string; isEnabled?: boolean; order?: number }>,
  );

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
          }),
        }}
      />
      <section className="border-b border-border/80">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-8">
          <p className="kicker">SaaS product</p>
          <h1 className="mt-4 max-w-3xl text-6xl">{product.name}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{product.shortDescription}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaButton href={!product.ctaHref || product.ctaHref === "/contact" ? "#enquire" : product.ctaHref}>
              {product.ctaLabel || "Request a demo"}
            </CtaButton>
            {product.documentationUrl ? (
              <CtaButton href={product.documentationUrl} variant="secondary">
                Docs
              </CtaButton>
            ) : null}
          </div>
        </div>
      </section>
      {product.heroImage ? (
        <div className="relative mx-auto max-w-6xl px-6 md:px-8">
          <div className="relative aspect-[16/8] overflow-hidden rounded-3xl border border-border">
            <Image src={product.heroImage} alt="" fill className="object-cover" sizes="100vw" priority />
          </div>
        </div>
      ) : null}
      <Section>
        <RichText html={product.fullDescription} />
      </Section>
      {product.features?.length ? (
        <Section>
          <SectionIntro kicker="Product" heading="What it does." />
          <div className="grid gap-8 md:grid-cols-3">
            {product.features.map((item) => (
              <div key={item.title} className="surface p-6">
                <h3 className="text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
      {product.useCases?.length ? (
        <Section>
          <SectionIntro kicker="Use cases" heading="Where it earns its keep." />
          <div className="grid gap-6 md:grid-cols-2">
            {product.useCases.map((item) => (
              <div key={item.title} className="surface p-6">
                <h3 className="text-2xl">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
      {product.targetAudience?.length ? (
        <Section>
          <p className="kicker mb-4">Built for</p>
          <p className="text-3xl">{product.targetAudience.join(" · ")}</p>
        </Section>
      ) : null}
      {product.pricingPlans?.length ? (
        <Section>
          <SectionIntro kicker="Pricing" heading="Plans that match how teams buy." />
          <div className="grid gap-4 md:grid-cols-3">
            {product.pricingPlans
              .filter((p) => (p as { isEnabled?: boolean }).isEnabled !== false)
              .map((plan) => (
                <Price key={String((plan as { name: string }).name)} plan={plan as never} />
              ))}
          </div>
        </Section>
      ) : null}
      {product.faqs?.length ? (
        <Section>
          {product.faqs.map((faq) => (
            <details key={faq.question} className="surface mb-3 px-5 py-4">
              <summary className="cursor-pointer text-xl">{faq.question}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
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
