import type { Metadata } from "next";
import { Section, SectionIntro } from "@/components/site/section";
import { CatalogDirectory } from "@/components/site/catalog-directory";
import { getProducts } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { safe } from "@/lib/safe";

export const metadata: Metadata = buildMetadata({
  title: "Products",
  description: "SaaS products designed and operated by Graphion Studios.",
  path: "/products",
});

export default async function ProductsPage() {
  const products = await safe(getProducts, []);
  return (
    <Section className="pt-16 md:pt-24">
      <SectionIntro kicker="Our products" heading="Software we live with." />
      <CatalogDirectory items={products} noun="product" hrefPrefix="/products" cta="View product →" />
    </Section>
  );
}
