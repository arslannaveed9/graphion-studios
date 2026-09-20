import type { Metadata } from "next";
import { siteUrl } from "@/lib/env";
import type { SeoFields } from "@/types";

export function absoluteUrl(path = "/") {
  const origin = siteUrl();
  if (!path) return origin;
  if (path.startsWith("http")) return path;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata(input: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  seo?: SeoFields | Record<string, unknown> | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const seo = (input.seo || {}) as SeoFields;
  const title = seo.title || input.title;
  const description = seo.description || input.description || "";
  const canonical = seo.canonical || (input.path ? absoluteUrl(input.path) : undefined);
  const image = seo.ogImage || input.image;
  const noIndex = seo.noIndex || input.noIndex;

  return {
    title,
    description,
    keywords: seo.keywords?.length ? seo.keywords : input.keywords,
    alternates: canonical ? { canonical } : undefined,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonical,
      type: input.type || "website",
      images: image ? [{ url: image }] : undefined,
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
      authors: input.authors,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: seo.twitterTitle || seo.ogTitle || title,
      description: seo.twitterDescription || seo.ogDescription || description,
      images: seo.twitterImage || image ? [seo.twitterImage || image!] : undefined,
    },
  };
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
