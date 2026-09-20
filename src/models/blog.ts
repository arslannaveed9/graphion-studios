import { Schema, type Types } from "mongoose";
import { SeoSchema, getModel } from "@/models/shared";
import type { ContentStatus } from "@/types";

export interface BlogCategoryDoc {
  name: string;
  slug: string;
  description?: string;
}

export interface BlogTagDoc {
  name: string;
  slug: string;
}

export interface AuthorDoc {
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  role?: string;
}

const categorySchema = new Schema<BlogCategoryDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
  },
  { timestamps: true },
);

const tagSchema = new Schema<BlogTagDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

const authorSchema = new Schema<AuthorDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: String,
    avatar: String,
    role: String,
  },
  { timestamps: true },
);

export const BlogCategory = getModel<BlogCategoryDoc>("BlogCategory", categorySchema);
export const BlogTag = getModel<BlogTagDoc>("BlogTag", tagSchema);
export const Author = getModel<AuthorDoc>("Author", authorSchema);

export interface BlogPostDoc {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author?: Types.ObjectId;
  category?: Types.ObjectId;
  tags: Types.ObjectId[];
  status: ContentStatus;
  featured: boolean;
  scheduledAt?: Date;
  publishedAt?: Date;
  seo: Record<string, unknown>;
  readingMinutes?: number;
}

const postSchema = new Schema<BlogPostDoc>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    featuredImage: String,
    author: { type: Schema.Types.ObjectId, ref: "Author" },
    category: { type: Schema.Types.ObjectId, ref: "BlogCategory" },
    tags: [{ type: Schema.Types.ObjectId, ref: "BlogTag" }],
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    featured: { type: Boolean, default: false },
    scheduledAt: Date,
    publishedAt: Date,
    seo: { type: SeoSchema, default: {} },
    readingMinutes: Number,
  },
  { timestamps: true },
);

postSchema.index({ title: "text", excerpt: "text", content: "text" });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ tags: 1 });

export const BlogPost = getModel<BlogPostDoc>("BlogPost", postSchema);
