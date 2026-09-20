import type { MetadataRoute } from "next";
import { connectDb } from "@/lib/db";
import { BlogPost, Page, PortfolioProject, SaaSProduct, Service, SiteSettings } from "@/models";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connectDb();
    const settings = await SiteSettings.findOne().lean();
    if (settings && settings.sitemapEnabled === false) return [];

    const [services, products, projects, posts, pages] = await Promise.all([
      Service.find({ status: "published" }).select("slug updatedAt").lean(),
      SaaSProduct.find({ status: "published" }).select("slug updatedAt").lean(),
      PortfolioProject.find({ status: "published" }).select("slug updatedAt").lean(),
      BlogPost.find({ status: "published" }).select("slug updatedAt").lean(),
      Page.find({ status: "published" }).select("slug kind updatedAt").lean(),
    ]);

    const staticRoutes = ["", "/services", "/products", "/portfolio", "/blog", "/about", "/contact", "/search"].map(
      (path) => ({
        url: absoluteUrl(path || "/"),
        lastModified: new Date(),
      }),
    );

    return [
      ...staticRoutes,
      ...services.map((item) => ({ url: absoluteUrl(`/services/${item.slug}`), lastModified: new Date() })),
      ...products.map((item) => ({ url: absoluteUrl(`/products/${item.slug}`), lastModified: new Date() })),
      ...projects.map((item) => ({ url: absoluteUrl(`/portfolio/${item.slug}`), lastModified: new Date() })),
      ...posts.map((item) => ({ url: absoluteUrl(`/blog/${item.slug}`), lastModified: new Date() })),
      ...pages.map((item) => ({
        url: absoluteUrl(item.kind === "legal" ? `/legal/${item.slug}` : `/${item.slug}`),
        lastModified: new Date(),
      })),
    ];
  } catch {
    return [{ url: absoluteUrl("/"), lastModified: new Date() }];
  }
}
