import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const optionalText = z.preprocess(
  (value) => (value == null || String(value).trim() === "" ? undefined : String(value).trim()),
  z.string().max(200).optional(),
);

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10).max(5000),
  website: z.string().optional(),
});

export const inquirySchema = contactSchema.extend({
  serviceSlug: optionalText,
  productSlug: optionalText,
  selectedPackage: optionalText,
  projectType: optionalText,
  budget: optionalText,
  timeline: optionalText,
  additionalInfo: z.string().max(5000).optional().or(z.literal("")),
  inquiryType: z.enum(["contact", "service", "quote", "custom_project", "product"]),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().max(80).optional().or(z.literal("")),
  website: z.string().optional(),
});

export const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  canonical: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  noIndex: z.coerce.boolean().optional(),
});

export const pricingPlanSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().nullable().optional(),
  currency: z.string().default("USD"),
  billingType: z.enum(["one_time", "monthly", "yearly", "custom", "contact", "free"]),
  customPriceLabel: z.string().optional(),
  isCustom: z.coerce.boolean().optional(),
  isRecommended: z.coerce.boolean().optional(),
  isEnabled: z.coerce.boolean().optional(),
  features: z.array(z.string()).default([]),
  notIncluded: z.array(z.string()).default([]),
  ctaText: z.string().optional(),
  ctaHref: z.string().optional(),
  notes: z.string().optional(),
  order: z.coerce.number().default(0),
});

export function parseKeywords(value?: string | string[]) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseList(value?: FormDataEntryValue | FormDataEntryValue[] | null) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join("\n") : String(value);
  return raw
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
