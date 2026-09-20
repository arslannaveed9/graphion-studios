import { Schema } from "mongoose";
import { getModel } from "@/models/shared";

export interface FaqDoc {
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
}

const schema = new Schema<FaqDoc>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const FAQ = getModel<FaqDoc>("FAQ", schema);
