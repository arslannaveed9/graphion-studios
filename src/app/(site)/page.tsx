import { HomepageView } from "@/components/site/homepage";
import {
  getHomepage,
  getProducts,
  getProjects,
  getServices,
  getTechnologies,
  getTestimonials,
} from "@/lib/queries";
import { safe } from "@/lib/safe";
import type { HomepageSection } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [homepage, services, products, projects, testimonials, technologies] = await Promise.all([
    safe(getHomepage, null),
    safe(getServices, []),
    safe(getProducts, []),
    safe(getProjects, []),
    safe(getTestimonials, []),
    safe(getTechnologies, []),
  ]);

  const sections = (homepage?.sections as HomepageSection[]) || [];

  if (!sections.length) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32">
        <p className="kicker">Setup</p>
        <h1 className="mt-4 font-display text-5xl">The CMS is ready.</h1>
        <p className="mt-4 text-muted-foreground">
          Start MongoDB, copy <code>.env.example</code> to <code>.env.local</code>, then run{" "}
          <code>npm run seed</code>.
        </p>
      </div>
    );
  }

  return (
    <HomepageView
      sections={sections}
      services={services as unknown as Array<Record<string, unknown>>}
      products={products as unknown as Array<Record<string, unknown>>}
      projects={projects as unknown as Array<Record<string, unknown>>}
      testimonials={testimonials as unknown as Array<Record<string, unknown>>}
      technologies={technologies as unknown as Array<Record<string, unknown>>}
    />
  );
}
