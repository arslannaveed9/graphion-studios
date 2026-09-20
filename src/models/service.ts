import { Schema, type Types } from "mongoose";
import {
  ContentBlockSchema,
  FaqItemSchema,
  PricingPlanSchema,
  SeoSchema,
  getModel,
} from "@/models/shared";
import type { ContentStatus } from "@/types";

export interface ServiceDoc {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  problem?: string;
  solution?: string;
  icon?: string;
  heroImage?: string;
  gallery: string[];
  features: Array<{ title: string; description?: string; icon?: string }>;
  technologies: string[];
  benefits: Array<{ title: string; description?: string }>;
  process: Array<{ title: string; description?: string }>;
  pricingNotes?: string;
  pricingPlans: Array<{
    _id: Types.ObjectId;
    name: string;
    price: number | null;
    currency: string;
    billingType: string;
    customPriceLabel?: string;
    isCustom?: boolean;
    isRecommended?: boolean;
    isEnabled?: boolean;
    features: string[];
    notIncluded: string[];
    ctaText?: string;
    ctaHref?: string;
    notes?: string;
    order: number;
  }>;
  included?: string[];
  notIncluded?: string[];
  enableCustomProject: boolean;
  customProjectHeading?: string;
  customProjectBody?: string;
  customProjectCta?: string;
  faqs: Array<{ question: string; answer: string }>;
  category?: Types.ObjectId;
  relatedProjectIds: Types.ObjectId[];
  relatedTestimonialIds: Types.ObjectId[];
  status: ContentStatus;
  featured: boolean;
  order: number;
  seo: Record<string, unknown>;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ServiceDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, default: "" },
    problem: String,
    solution: String,
    icon: String,
    heroImage: String,
    gallery: { type: [String], default: [] },
    features: { type: [ContentBlockSchema], default: [] },
    technologies: { type: [String], default: [] },
    benefits: { type: [ContentBlockSchema], default: [] },
    process: { type: [ContentBlockSchema], default: [] },
    pricingNotes: String,
    pricingPlans: { type: [PricingPlanSchema], default: [] },
    included: { type: [String], default: [] },
    notIncluded: { type: [String], default: [] },
    enableCustomProject: { type: Boolean, default: true },
    customProjectHeading: String,
    customProjectBody: String,
    customProjectCta: String,
    faqs: { type: [FaqItemSchema], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "ServiceCategory" },
    relatedProjectIds: [{ type: Schema.Types.ObjectId, ref: "PortfolioProject" }],
    relatedTestimonialIds: [{ type: Schema.Types.ObjectId, ref: "Testimonial" }],
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: {} },
    publishedAt: Date,
  },
  { timestamps: true },
);

schema.index({ name: "text", shortDescription: "text", fullDescription: "text" });
schema.index({ featured: 1, order: 1 });
schema.index({ status: 1, slug: 1 });

export const Service = getModel<ServiceDoc>("Service", schema);
