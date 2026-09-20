import { Schema } from "mongoose";
import { getModel } from "@/models/shared";

export interface NewsletterSubscriberDoc {
  email: string;
  name?: string;
  status: "subscribed" | "unsubscribed";
  subscribedAt: Date;
}

const newsletterSchema = new Schema<NewsletterSubscriberDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: String,
    status: { type: String, enum: ["subscribed", "unsubscribed"], default: "subscribed" },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const NewsletterSubscriber = getModel<NewsletterSubscriberDoc>(
  "NewsletterSubscriber",
  newsletterSchema,
);

export interface RateLimitDoc {
  key: string;
  count: number;
  windowStartedAt: Date;
}

const rateSchema = new Schema<RateLimitDoc>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  windowStartedAt: { type: Date, default: Date.now },
});

rateSchema.index({ windowStartedAt: 1 }, { expireAfterSeconds: 60 * 60 });

export const RateLimit = getModel<RateLimitDoc>("RateLimit", rateSchema);

export interface SearchDocumentDoc {
  type: "service" | "product" | "blog" | "portfolio";
  title: string;
  excerpt: string;
  url: string;
  slug: string;
  published: boolean;
}

const searchSchema = new Schema<SearchDocumentDoc>(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: "" },
    url: { type: String, required: true },
    slug: { type: String, required: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

searchSchema.index({ title: "text", excerpt: "text" });
searchSchema.index({ type: 1, published: 1 });

export const SearchDocument = getModel<SearchDocumentDoc>("SearchDocument", searchSchema);
