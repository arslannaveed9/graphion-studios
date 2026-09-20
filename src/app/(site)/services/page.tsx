import type { Metadata } from "next";
import { Section } from "@/components/site/section";
import { CatalogDirectory } from "@/components/site/catalog-directory";
import { CatalogPageHeader } from "@/components/site/catalog";
import { getServices } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { safe } from "@/lib/safe";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description: "Platforms, product engineering, mobile, SaaS, cloud, and applied AI.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = await safe(() => getServices({ listing: true }), []);
  return (
    <Section className="pt-16 md:pt-24">
      <CatalogPageHeader
        kicker="Capabilities"
        heading="What we staff senior people against."
        subheading="Platforms, product engineering, mobile, SaaS, cloud, and applied AI — scoped as packages, not guesswork."
        count={services.length}
        noun="service"
      />
      <CatalogDirectory items={services} noun="service" hrefPrefix="/services" cta="Explore →" />
    </Section>
  );
}
