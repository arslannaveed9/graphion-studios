import { Schema } from "mongoose";
import { getModel } from "@/models/shared";

export interface ServiceCategoryDoc {
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
}

const schema = new Schema<ServiceCategoryDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ServiceCategory = getModel<ServiceCategoryDoc>("ServiceCategory", schema);
