import { Schema } from "mongoose";
import { getModel } from "@/models/shared";

export interface TechnologyDoc {
  name: string;
  slug: string;
  icon?: string;
  category?: string;
  description?: string;
  order: number;
  isActive: boolean;
}

const schema = new Schema<TechnologyDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    category: String,
    description: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Technology = getModel<TechnologyDoc>("Technology", schema);
