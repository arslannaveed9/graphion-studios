import mongoose, { Schema } from "mongoose";
import type { BillingType } from "@/types";

export const SeoSchema = new Schema(
  {
    title: String,
    description: String,
    keywords: [String],
    canonical: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterTitle: String,
    twitterDescription: String,
    twitterImage: String,
    noIndex: { type: Boolean, default: false },
  },
  { _id: false },
);

export const CtaSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
  },
  { _id: false },
);

export const ContentBlockSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    icon: String,
  },
  { _id: false },
);

export const PricingPlanSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, default: null },
    currency: { type: String, default: "USD" },
    billingType: {
      type: String,
      enum: ["one_time", "monthly", "yearly", "custom", "contact", "free"],
      default: "one_time",
    } satisfies { type: StringConstructor; enum: BillingType[]; default: BillingType },
    customPriceLabel: String,
    isCustom: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: true },
    features: { type: [String], default: [] },
    notIncluded: { type: [String], default: [] },
    ctaText: String,
    ctaHref: String,
    notes: String,
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

export const FaqItemSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: true },
);

export const SocialLinkSchema = new Schema(
  {
    platform: String,
    url: String,
  },
  { _id: false },
);

export function getModel<T>(name: string, schema: Schema<T>) {
  return (mongoose.models[name] as mongoose.Model<T>) || mongoose.model<T>(name, schema);
}
