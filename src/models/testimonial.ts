import { Schema, type Types } from "mongoose";
import { getModel } from "@/models/shared";

export interface TestimonialDoc {
  quote: string;
  authorName: string;
  authorTitle?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  service?: Types.ObjectId;
  featured: boolean;
  isActive: boolean;
  order: number;
}

const schema = new Schema<TestimonialDoc>(
  {
    quote: { type: String, required: true },
    authorName: { type: String, required: true },
    authorTitle: String,
    company: String,
    avatar: String,
    rating: { type: Number, min: 1, max: 5 },
    service: { type: Schema.Types.ObjectId, ref: "Service" },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Testimonial = getModel<TestimonialDoc>("Testimonial", schema);
