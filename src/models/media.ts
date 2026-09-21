import { Schema } from "mongoose";
import { getModel } from "@/models/shared";

export interface MediaDoc {
  url: string;
  publicId?: string;
  provider: "local" | "cloudinary";
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  folder?: string;
  createdAt: Date;
}

const schema = new Schema<MediaDoc>(
  {
    url: { type: String, required: true },
    publicId: String,
    provider: { type: String, enum: ["local", "cloudinary"], default: "local" },
    alt: String,
    caption: String,
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
    folder: String,
  },
  { timestamps: true },
);

schema.index({ createdAt: -1 });
schema.index({ alt: "text", caption: "text", url: "text" });

export const Media = getModel<MediaDoc>("Media", schema);
