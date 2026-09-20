import { Schema, type Types } from "mongoose";
import { SeoSchema, getModel } from "@/models/shared";
import type { ContentStatus } from "@/types";

export interface PortfolioProjectDoc {
  name: string;
  slug: string;
  client?: string;
  description: string;
  summary?: string;
  industry?: string;
  services: Types.ObjectId[];
  technologies: string[];
  images: string[];
  screenshots: string[];
  heroImage?: string;
  results: Array<{ label: string; value: string }>;
  challenges?: string;
  solution?: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  projectUrl?: string;
  featured: boolean;
  status: ContentStatus;
  order: number;
  seo: Record<string, unknown>;
  publishedAt?: Date;
}

const schema = new Schema<PortfolioProjectDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    client: String,
    description: { type: String, required: true },
    summary: String,
    industry: String,
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    technologies: { type: [String], default: [] },
    images: { type: [String], default: [] },
    screenshots: { type: [String], default: [] },
    heroImage: String,
    results: {
      type: [{ label: String, value: String, _id: false }],
      default: [],
    },
    challenges: String,
    solution: String,
    testimonialQuote: String,
    testimonialAuthor: String,
    projectUrl: String,
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    order: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: {} },
    publishedAt: Date,
  },
  { timestamps: true },
);

schema.index({ name: "text", description: "text", summary: "text" });

export const PortfolioProject = getModel<PortfolioProjectDoc>("PortfolioProject", schema);
