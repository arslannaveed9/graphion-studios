import { Schema } from "mongoose";
import { SeoSchema, getModel } from "@/models/shared";
import type { ContentStatus } from "@/types";

export interface PageDoc {
  title: string;
  slug: string;
  kind: "legal" | "page";
  excerpt?: string;
  content: string;
  status: ContentStatus;
  seo: Record<string, unknown>;
  updatedAt: Date;
}

const schema = new Schema<PageDoc>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["legal", "page"], default: "page" },
    excerpt: String,
    content: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    seo: { type: SeoSchema, default: {} },
  },
  { timestamps: true },
);

schema.index({ slug: 1, kind: 1 });

export const Page = getModel<PageDoc>("Page", schema);
