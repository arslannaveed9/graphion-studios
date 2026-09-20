import type { Metadata } from "next";
import { Section, SectionIntro } from "@/components/site/section";
import { CatalogDirectory } from "@/components/site/catalog-directory";
import { getServices } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { safe } from "@/lib/safe";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description: "Platforms, product engineering, mobile, SaaS, cloud, and applied AI.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = await safe(getServices, []);
  return (
    <Section className="pt-16 md:pt-24">
      <SectionIntro
        kicker="Capabilities"
        heading="What we staff senior people against."
        subheading="Unlimited services can be added from the admin. These are the ones currently published."
      />
      <CatalogDirectory items={services} noun="service" hrefPrefix="/services" cta="Explore →" />
    </Section>
  );
}
