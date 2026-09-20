"use server";

import { revalidatePath } from "next/cache";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db";
import { requirePermission, requireSession, hashPassword } from "@/lib/auth";
import { sanitizeRichText } from "@/lib/sanitize";
import { toSlug, readingMinutes } from "@/lib/format";
import { parseKeywords } from "@/lib/validators";
import { upsertSearchDocument, removeSearchDocument } from "@/lib/search";
import { bustPublicSite } from "@/lib/cache";
import { deleteMedia, uploadMediaFile } from "@/lib/media";
import {
  AboutPage,
  AdminUser,
  Author,
  BlogCategory,
  BlogPost,
  BlogTag,
  EmailSettings,
  FAQ,
  Footer,
  Homepage,
  Lead,
  Media,
  Navigation,
  Page,
  PortfolioProject,
  ProductCategory,
  SaaSProduct,
  Service,
  ServiceCategory,
  SiteSettings,
  TeamMember,
  Technology,
  Testimonial,
} from "@/models";
import type { ContentStatus } from "@/types";

function json<T>(formData: FormData, key: string, fallback: T): T {
  const raw = formData.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(String(raw)) as T;
  } catch {
    return fallback;
  }
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function bool(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

function seoFrom(formData: FormData) {
  return {
    title: str(formData, "seoTitle") || undefined,
    description: str(formData, "seoDescription") || undefined,
    keywords: parseKeywords(str(formData, "seoKeywords")),
    canonical: str(formData, "seoCanonical") || undefined,
    ogTitle: str(formData, "ogTitle") || undefined,
    ogDescription: str(formData, "ogDescription") || undefined,
    ogImage: str(formData, "ogImage") || undefined,
    noIndex: bool(formData, "noIndex"),
  };
}

function statusOf(formData: FormData): ContentStatus {
  const value = str(formData, "status") as ContentStatus;
  return ["draft", "published", "archived"].includes(value) ? value : "draft";
}

async function afterSave(paths: string[]) {
  bustPublicSite();
  for (const path of paths) revalidatePath(path);
}

export async function saveServiceAction(formData: FormData) {
  await requirePermission("content:write");
  await connectDb();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const slug = toSlug(str(formData, "slug") || name);
  const status = statusOf(formData);
  const payload = {
    name,
    slug,
    shortDescription: str(formData, "shortDescription"),
    fullDescription: sanitizeRichText(str(formData, "fullDescription")),
    problem: str(formData, "problem"),
    solution: str(formData, "solution"),
    icon: str(formData, "icon"),
    heroImage: str(formData, "heroImage"),
    gallery: json<string[]>(formData, "gallery", []),
    features: json(formData, "features", []),
    technologies: json<string[]>(formData, "technologies", []),
    benefits: json(formData, "benefits", []),
    process: json(formData, "process", []),
    pricingNotes: str(formData, "pricingNotes"),
    pricingPlans: json(formData, "pricingPlans", []),
    included: json<string[]>(formData, "included", []),
    notIncluded: json<string[]>(formData, "notIncluded", []),
    enableCustomProject: bool(formData, "enableCustomProject"),
    customProjectHeading: str(formData, "customProjectHeading"),
    customProjectBody: str(formData, "customProjectBody"),
    customProjectCta: str(formData, "customProjectCta"),
    faqs: json(formData, "faqs", []),
    featured: bool(formData, "featured"),
    order: Number(str(formData, "order") || 0),
    status,
    seo: seoFrom(formData),
    publishedAt: status === "published" ? new Date() : undefined,
  };
  const doc = id
    ? await Service.findByIdAndUpdate(id, payload, { new: true })
    : await Service.create(payload);
  await upsertSearchDocument({
    type: "service",
    title: name,
    excerpt: payload.shortDescription,
    url: `/services/${slug}`,
    slug,
    published: status === "published",
  });
  await afterSave(["/", "/services", `/services/${slug}`, "/admin/services"]);
  redirect(`/admin/services/${doc?._id || id}`);
}

export async function saveProductAction(formData: FormData) {
  await requirePermission("content:write");
  await connectDb();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const slug = toSlug(str(formData, "slug") || name);
  const status = statusOf(formData);
  const payload = {
    name,
    slug,
    logo: str(formData, "logo"),
    heroImage: str(formData, "heroImage"),
    shortDescription: str(formData, "shortDescription"),
    fullDescription: sanitizeRichText(str(formData, "fullDescription")),
    screenshots: json<string[]>(formData, "screenshots", []),
    features: json(formData, "features", []),
    benefits: json(formData, "benefits", []),
    targetAudience: json<string[]>(formData, "targetAudience", []),
    useCases: json(formData, "useCases", []),
    pricingPlans: json(formData, "pricingPlans", []),
    integrations: json<string[]>(formData, "integrations", []),
    technologies: json<string[]>(formData, "technologies", []),
    faqs: json(formData, "faqs", []),
    ctaLabel: str(formData, "ctaLabel"),
    ctaHref: str(formData, "ctaHref"),
    demoUrl: str(formData, "demoUrl"),
    websiteUrl: str(formData, "websiteUrl"),
    documentationUrl: str(formData, "documentationUrl"),
    featured: bool(formData, "featured"),
    order: Number(str(formData, "order") || 0),
    status,
    seo: seoFrom(formData),
    publishedAt: status === "published" ? new Date() : undefined,
  };
  const doc = id
    ? await SaaSProduct.findByIdAndUpdate(id, payload, { new: true })
    : await SaaSProduct.create(payload);
  await upsertSearchDocument({
    type: "product",
    title: name,
    excerpt: payload.shortDescription,
    url: `/products/${slug}`,
    slug,
    published: status === "published",
  });
  await afterSave(["/", "/products", `/products/${slug}`, "/admin/products"]);
  redirect(`/admin/products/${doc?._id || id}`);
}

export async function saveProjectAction(formData: FormData) {
  await requirePermission("content:write");
  await connectDb();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const slug = toSlug(str(formData, "slug") || name);
  const status = statusOf(formData);
  const payload = {
    name,
    slug,
    client: str(formData, "client"),
    description: sanitizeRichText(str(formData, "description")),
    summary: str(formData, "summary"),
    industry: str(formData, "industry"),
    technologies: json<string[]>(formData, "technologies", []),
    images: json<string[]>(formData, "images", []),
    screenshots: json<string[]>(formData, "screenshots", []),
    heroImage: str(formData, "heroImage"),
    results: json(formData, "results", []),
    challenges: str(formData, "challenges"),
    solution: str(formData, "solution"),
    testimonialQuote: str(formData, "testimonialQuote"),
    testimonialAuthor: str(formData, "testimonialAuthor"),
    projectUrl: str(formData, "projectUrl"),
    featured: bool(formData, "featured"),
    order: Number(str(formData, "order") || 0),
    status,
    seo: seoFrom(formData),
    publishedAt: status === "published" ? new Date() : undefined,
  };
  const doc = id
    ? await PortfolioProject.findByIdAndUpdate(id, payload, { new: true })
    : await PortfolioProject.create(payload);
  await upsertSearchDocument({
    type: "portfolio",
    title: name,
    excerpt: payload.summary,
    url: `/portfolio/${slug}`,
    slug,
    published: status === "published",
  });
  await afterSave(["/", "/portfolio", `/portfolio/${slug}`, "/admin/portfolio"]);
  redirect(`/admin/portfolio/${doc?._id || id}`);
}

export async function savePostAction(formData: FormData) {
  await requirePermission("content:write");
  await connectDb();
  const id = str(formData, "id");
  const title = str(formData, "title");
  const slug = toSlug(str(formData, "slug") || title);
  const status = statusOf(formData);
  const content = sanitizeRichText(str(formData, "content"));
  const payload = {
    title,
    slug,
    excerpt: str(formData, "excerpt"),
    content,
    featuredImage: str(formData, "featuredImage"),
    author: str(formData, "author") || undefined,
    category: str(formData, "category") || undefined,
    tags: json<string[]>(formData, "tags", []),
    featured: bool(formData, "featured"),
    scheduledAt: str(formData, "scheduledAt") ? new Date(str(formData, "scheduledAt")) : undefined,
    status,
    seo: seoFrom(formData),
    readingMinutes: readingMinutes(content),
    publishedAt:
      status === "published"
        ? str(formData, "scheduledAt")
          ? new Date(str(formData, "scheduledAt"))
          : new Date()
        : undefined,
  };
  const doc = id
    ? await BlogPost.findByIdAndUpdate(id, payload, { new: true })
    : await BlogPost.create(payload);
  await upsertSearchDocument({
    type: "blog",
    title,
    excerpt: payload.excerpt,
    url: `/blog/${slug}`,
    slug,
    published: status === "published" && (!payload.scheduledAt || payload.scheduledAt <= new Date()),
  });
  await afterSave(["/blog", `/blog/${slug}`, "/admin/blog"]);
  redirect(`/admin/blog/${doc?._id || id}`);
}

export async function saveSimpleAction(formData: FormData) {
  await requirePermission("content:write");
  await connectDb();
  const collection = str(formData, "collection");
  const id = str(formData, "id");
  const redirectTo = str(formData, "redirectTo") || "/admin";
  const data = json<Record<string, unknown>>(formData, "payload", {});
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("field_") && value) {
      data[key.slice(6)] = String(value);
    }
  }
  const models = {
    faq: FAQ,
    testimonial: Testimonial,
    team: TeamMember,
    technology: Technology,
    page: Page,
    author: Author,
    "blog-category": BlogCategory,
    "blog-tag": BlogTag,
    "service-category": ServiceCategory,
    "product-category": ProductCategory,
  } as const;
  const Model = models[collection as keyof typeof models] as {
    findByIdAndUpdate: (id: string, data: object) => Promise<unknown>;
    create: (data: object) => Promise<unknown>;
  };
  if (!Model) throw new Error("Unknown collection");
  if (typeof data.slug === "string") data.slug = toSlug(data.slug);
  if (!data.slug && typeof data.name === "string") data.slug = toSlug(data.name);
  if (typeof data.content === "string") data.content = sanitizeRichText(data.content);
  if (typeof data.answer === "string") data.answer = sanitizeRichText(data.answer);
  if (id) await Model.findByIdAndUpdate(id, data);
  else await Model.create(data);
  await afterSave([redirectTo]);
  redirect(redirectTo);
}

export async function deleteRecordAction(formData: FormData) {
  await requirePermission("content:write");
  await connectDb();
  const collection = str(formData, "collection");
  const id = str(formData, "id");
  const redirectTo = str(formData, "redirectTo") || "/admin";
  const map = {
    service: Service,
    product: SaaSProduct,
    project: PortfolioProject,
    post: BlogPost,
    faq: FAQ,
    testimonial: Testimonial,
    team: TeamMember,
    technology: Technology,
    page: Page,
    media: Media,
    user: AdminUser,
    "blog-category": BlogCategory,
    "blog-tag": BlogTag,
    author: Author,
  } as const;
  const Model = map[collection as keyof typeof map] as {
    findById: (id: string) => Promise<{ slug?: string; name?: string } | null>;
    findByIdAndDelete: (id: string) => Promise<unknown>;
  };
  if (!Model) throw new Error("Unknown collection");
  if (collection === "user") {
    await requirePermission("users:manage");
  }
  const doc = await Model.findById(id);
  if (collection === "media") await deleteMedia(id);
  else await Model.findByIdAndDelete(id);
  if (doc && "slug" in doc && "name" in (doc as { name?: string })) {
    const slug = String((doc as { slug?: string }).slug || "");
    if (collection === "service") await removeSearchDocument("service", slug);
    if (collection === "product") await removeSearchDocument("product", slug);
    if (collection === "project") await removeSearchDocument("portfolio", slug);
    if (collection === "post") await removeSearchDocument("blog", slug);
  }
  await afterSave([redirectTo]);
  redirect(redirectTo);
}

export async function saveHomepageAction(formData: FormData) {
  await requirePermission("content:write");
  await connectDb();
  const sections = json(formData, "sections", []);
  await Homepage.findOneAndUpdate({}, { sections }, { upsert: true });
  await afterSave(["/", "/admin/website/homepage"]);
  redirect("/admin/website/homepage");
}

export async function saveNavigationAction(formData: FormData) {
  await requirePermission("settings:manage");
  await connectDb();
  const items = json(formData, "items", []);
  await Navigation.findOneAndUpdate({ location: "header" }, { items }, { upsert: true });
  await afterSave(["/", "/admin/website/navigation"]);
  redirect("/admin/website/navigation");
}

export async function saveFooterAction(formData: FormData) {
  await requirePermission("settings:manage");
  await connectDb();
  await Footer.findOneAndUpdate(
    {},
    {
      columns: json(formData, "columns", []),
      newsletterEnabled: bool(formData, "newsletterEnabled"),
      newsletterHeading: str(formData, "newsletterHeading"),
      newsletterBody: str(formData, "newsletterBody"),
      copyright: str(formData, "copyright"),
    },
    { upsert: true },
  );
  await afterSave(["/", "/admin/website/footer"]);
  redirect("/admin/website/footer");
}

export async function saveSettingsAction(formData: FormData) {
  await requirePermission("settings:manage");
  await connectDb();
  await SiteSettings.findOneAndUpdate(
    {},
    {
      companyName: str(formData, "companyName"),
      tagline: str(formData, "tagline"),
      logo: str(formData, "logo"),
      favicon: str(formData, "favicon"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      whatsapp: str(formData, "whatsapp"),
      address: str(formData, "address"),
      businessHours: str(formData, "businessHours"),
      socialLinks: json(formData, "socialLinks", []),
      copyright: str(formData, "copyright"),
      googleAnalyticsId: str(formData, "googleAnalyticsId"),
      googleSiteVerification: str(formData, "googleSiteVerification"),
      robotsExtra: str(formData, "robotsExtra"),
      sitemapEnabled: bool(formData, "sitemapEnabled"),
      contactMapEmbed: str(formData, "contactMapEmbed"),
      defaultSeo: seoFrom(formData),
    },
    { upsert: true },
  );
  await afterSave(["/", "/admin/settings"]);
  redirect("/admin/settings");
}

export async function saveAboutAction(formData: FormData) {
  await requirePermission("content:write");
  await connectDb();
  await AboutPage.findOneAndUpdate(
    {},
    {
      introductionHeading: str(formData, "introductionHeading"),
      introduction: str(formData, "introduction"),
      mission: str(formData, "mission"),
      vision: str(formData, "vision"),
      story: str(formData, "story"),
      values: json(formData, "values", []),
      whyUs: json(formData, "whyUs", []),
      stats: json(formData, "stats", []),
      ctaHeading: str(formData, "ctaHeading"),
      ctaBody: str(formData, "ctaBody"),
      ctaLabel: str(formData, "ctaLabel"),
      ctaHref: str(formData, "ctaHref"),
      heroImage: str(formData, "heroImage"),
    },
    { upsert: true },
  );
  await afterSave(["/about", "/admin/content/about"]);
  redirect("/admin/content/about");
}

export async function saveEmailSettingsAction(formData: FormData) {
  await requirePermission("settings:manage");
  await connectDb();
  await EmailSettings.findOneAndUpdate(
    {},
    {
      notifyOnContact: bool(formData, "notifyOnContact"),
      notifyOnInquiry: bool(formData, "notifyOnInquiry"),
      sendCustomerConfirmation: bool(formData, "sendCustomerConfirmation"),
      fromName: str(formData, "fromName"),
      fromEmail: str(formData, "fromEmail"),
      notifyEmail: str(formData, "notifyEmail"),
    },
    { upsert: true },
  );
  redirect("/admin/settings/email");
}

export async function updateLeadAction(formData: FormData) {
  await requirePermission("leads:manage");
  await connectDb();
  const id = str(formData, "id");
  const session = await requireSession();
  const note = str(formData, "note");
  const status = str(formData, "status");
  await Lead.findByIdAndUpdate(id, {
    $set: { status },
    ...(note
      ? { $push: { notes: { body: note, authorName: session.name, createdAt: new Date() } } }
      : {}),
  });
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
}

export async function saveUserAction(formData: FormData) {
  await requirePermission("users:manage");
  await connectDb();
  const id = str(formData, "id");
  const password = str(formData, "password");
  const payload: Record<string, unknown> = {
    name: str(formData, "name"),
    email: str(formData, "email").toLowerCase(),
    role: str(formData, "role"),
    isActive: bool(formData, "isActive"),
  };
  if (password) payload.passwordHash = await hashPassword(password);
  if (id) await AdminUser.findByIdAndUpdate(id, payload);
  else {
    if (!password) throw new Error("Password required");
    await AdminUser.create(payload);
  }
  redirect("/admin/settings/users");
}

export async function uploadMediaAction(formData: FormData) {
  await requirePermission("media:manage");
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) {
    throw new Error("Choose a file to upload.");
  }
  const media = await uploadMediaFile(file, {
    alt: str(formData, "alt"),
    caption: str(formData, "caption"),
  });
  revalidatePath("/admin/media");
  redirect("/admin/media");
}

export async function enablePreviewAction(formData: FormData) {
  await requirePermission("content:read");
  const path = str(formData, "path") || "/";
  const draft = await draftMode();
  draft.enable();
  redirect(path);
}

export async function disablePreviewAction() {
  const draft = await draftMode();
  draft.disable();
  redirect("/");
}
