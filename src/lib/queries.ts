import { cache } from "react";
import { draftMode } from "next/headers";
import { connectDb } from "@/lib/db";
import {
  AboutPage,
  Author,
  BlogCategory,
  BlogPost,
  BlogTag,
  FAQ,
  Footer,
  Homepage,
  Navigation,
  Page,
  PortfolioProject,
  SaaSProduct,
  Service,
  SiteSettings,
  TeamMember,
  Technology,
  Testimonial,
} from "@/models";
import { serialize } from "@/lib/format";
import { pagination } from "@/config/site";

export const getSettings = cache(async () => {
  await connectDb();
  const settings = await SiteSettings.findOne().lean();
  return settings ? serialize(settings) : null;
});

export const getNavigation = cache(async () => {
  await connectDb();
  const nav = await Navigation.findOne({ location: "header" }).lean();
  return nav ? serialize(nav) : null;
});

export const getFooter = cache(async () => {
  await connectDb();
  const footer = await Footer.findOne().lean();
  return footer ? serialize(footer) : null;
});

export const getHomepage = cache(async () => {
  await connectDb();
  const homepage = await Homepage.findOne().lean();
  return homepage ? serialize(homepage) : null;
});

export const getAbout = cache(async () => {
  await connectDb();
  const about = await AboutPage.findOne().lean();
  return about ? serialize(about) : null;
});

async function publishedFilter(): Promise<Record<string, unknown>> {
  const { isEnabled } = await draftMode();
  return isEnabled ? {} : { status: "published" };
}

export const getServices = cache(async (options?: { featured?: boolean; limit?: number; listing?: boolean }) => {
  await connectDb();
  const filter: Record<string, unknown> = await publishedFilter();
  if (options?.featured) filter.featured = true;
  const query = Service.find(filter as never)
    .sort({ order: 1, name: 1 })
    .limit(options?.limit || 100);
  if (options?.listing) {
    query.select("name slug shortDescription heroImage gallery icon technologies pricingPlans featured order");
  }
  return serialize(await query.lean());
});

export const getServiceBySlug = cache(async (slug: string) => {
  await connectDb();
  const item = await Service.findOne({ slug, ...(await publishedFilter()) } as never).lean();
  return item ? serialize(item) : null;
});

export const getProducts = cache(async (options?: { featured?: boolean; limit?: number; listing?: boolean }) => {
  await connectDb();
  const filter: Record<string, unknown> = await publishedFilter();
  if (options?.featured) filter.featured = true;
  const query = SaaSProduct.find(filter as never)
    .sort({ order: 1, name: 1 })
    .limit(options?.limit || 100);
  if (options?.listing) {
    query.select("name slug shortDescription heroImage logo screenshots technologies targetAudience pricingPlans featured order");
  }
  return serialize(await query.lean());
});

export const getProductBySlug = cache(async (slug: string) => {
  await connectDb();
  const item = await SaaSProduct.findOne({ slug, ...(await publishedFilter()) } as never).lean();
  return item ? serialize(item) : null;
});

export const getProjects = cache(async (options?: { featured?: boolean; limit?: number }) => {
  await connectDb();
  const filter: Record<string, unknown> = await publishedFilter();
  if (options?.featured) filter.featured = true;
  const items = await PortfolioProject.find(filter as never)
    .sort({ order: 1, name: 1 })
    .limit(options?.limit || 100)
    .populate("services", "name slug")
    .lean();
  return serialize(items);
});

export const getProjectBySlug = cache(async (slug: string) => {
  await connectDb();
  const item = await PortfolioProject.findOne({ slug, ...(await publishedFilter()) } as never)
    .populate("services", "name slug")
    .lean();
  return item ? serialize(item) : null;
});

export const getBlogPosts = cache(async (options?: { page?: number; category?: string; tag?: string }) => {
  await connectDb();
  const filter: Record<string, unknown> = await publishedFilter();
  if (options?.category) {
    const category = await BlogCategory.findOne({ slug: options.category }).lean();
    if (!category) return { items: [], total: 0, page: 1, pageSize: pagination.blogPageSize, pageCount: 0 };
    filter.category = category._id;
  }
  if (options?.tag) {
    const tag = await BlogTag.findOne({ slug: options.tag }).lean();
    if (!tag) return { items: [], total: 0, page: 1, pageSize: pagination.blogPageSize, pageCount: 0 };
    filter.tags = tag._id;
  }
  const page = options?.page || 1;
  const pageSize = pagination.blogPageSize;
  const [items, total] = await Promise.all([
    BlogPost.find(filter as never)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("author")
      .populate("category")
      .populate("tags")
      .lean(),
    BlogPost.countDocuments(filter as never),
  ]);
  return {
    items: serialize(items),
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
});

export const getPostBySlug = cache(async (slug: string) => {
  await connectDb();
  const item = await BlogPost.findOne({ slug, ...(await publishedFilter()) } as never)
    .populate("author")
    .populate("category")
    .populate("tags")
    .lean();
  return item ? serialize(item) : null;
});

export const getTeam = cache(async () => {
  await connectDb();
  const items = await TeamMember.find({ isActive: true }).sort({ order: 1 }).lean();
  return serialize(items);
});

export const getTestimonials = cache(async (options?: { featured?: boolean; limit?: number }) => {
  await connectDb();
  const filter: Record<string, unknown> = { isActive: true };
  if (options?.featured) filter.featured = true;
  const items = await Testimonial.find(filter)
    .sort({ order: 1 })
    .limit(options?.limit || 20)
    .lean();
  return serialize(items);
});

export const getFaqs = cache(async () => {
  await connectDb();
  const items = await FAQ.find({ isActive: true }).sort({ order: 1 }).lean();
  return serialize(items);
});

export const getTechnologies = cache(async () => {
  await connectDb();
  const items = await Technology.find({ isActive: true }).sort({ order: 1 }).lean();
  return serialize(items);
});

export const getLegalPage = cache(async (slug: string) => {
  await connectDb();
  const item = await Page.findOne({ slug, kind: "legal", ...(await publishedFilter()) } as never).lean();
  return item ? serialize(item) : null;
});

export const getAuthors = cache(async () => {
  await connectDb();
  return serialize(await Author.find().lean());
});
