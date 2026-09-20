import { Schema, type Types } from "mongoose";
import {
  ContentBlockSchema,
  FaqItemSchema,
  PricingPlanSchema,
  SeoSchema,
  getModel,
} from "@/models/shared";
import type { ContentStatus } from "@/types";

export interface ProductCategoryDoc {
  name: string;
  slug: string;
  description?: string;
  order: number;
}

const categorySchema = new Schema<ProductCategoryDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ProductCategory = getModel<ProductCategoryDoc>("ProductCategory", categorySchema);

export interface SaaSProductDoc {
  name: string;
  slug: string;
  logo?: string;
  heroImage?: string;
  shortDescription: string;
  fullDescription: string;
  screenshots: string[];
  features: Array<{ title: string; description?: string; icon?: string }>;
  benefits: Array<{ title: string; description?: string }>;
  targetAudience: string[];
  useCases: Array<{ title: string; description?: string }>;
  pricingPlans: Array<Record<string, unknown>>;
  integrations: string[];
  technologies: string[];
  faqs: Array<{ question: string; answer: string }>;
  ctaLabel?: string;
  ctaHref?: string;
  demoUrl?: string;
  websiteUrl?: string;
  documentationUrl?: string;
  status: ContentStatus;
  featured: boolean;
  category?: Types.ObjectId;
  order: number;
  seo: Record<string, unknown>;
  publishedAt?: Date;
}

const schema = new Schema<SaaSProductDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: String,
    heroImage: String,
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, default: "" },
    screenshots: { type: [String], default: [] },
    features: { type: [ContentBlockSchema], default: [] },
    benefits: { type: [ContentBlockSchema], default: [] },
    targetAudience: { type: [String], default: [] },
    useCases: { type: [ContentBlockSchema], default: [] },
    pricingPlans: { type: [PricingPlanSchema], default: [] },
    integrations: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    faqs: { type: [FaqItemSchema], default: [] },
    ctaLabel: String,
    ctaHref: String,
    demoUrl: String,
    websiteUrl: String,
    documentationUrl: String,
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    featured: { type: Boolean, default: false },
    category: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    order: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: {} },
    publishedAt: Date,
  },
  { timestamps: true },
);

schema.index({ name: "text", shortDescription: "text", fullDescription: "text" });
schema.index({ featured: 1, order: 1 });

export const SaaSProduct = getModel<SaaSProductDoc>("SaaSProduct", schema);
