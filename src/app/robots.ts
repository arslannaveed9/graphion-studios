import type { MetadataRoute } from "next";
import { connectDb } from "@/lib/db";
import { SiteSettings } from "@/models";
import { siteUrl } from "@/lib/env";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let extra = "";
  try {
    await connectDb();
    const settings = await SiteSettings.findOne().lean();
    extra = settings?.robotsExtra || "";
  } catch {
    extra = "";
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
    ...(extra ? {} : {}),
  };
}
