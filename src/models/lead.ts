import { Schema, type Types } from "mongoose";
import { getModel } from "@/models/shared";
import { leadStatuses } from "@/config/site";
import type { InquiryType, LeadStatus } from "@/types";

export interface LeadNote {
  body: string;
  authorName?: string;
  createdAt: Date;
}

export interface LeadDoc {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: Types.ObjectId;
  product?: Types.ObjectId;
  selectedPackage?: string;
  inquiryType: InquiryType;
  projectType?: string;
  budget?: string;
  timeline?: string;
  message: string;
  additionalInfo?: string;
  attachmentUrl?: string;
  status: LeadStatus;
  notes: LeadNote[];
  source?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<LeadDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    company: String,
    service: { type: Schema.Types.ObjectId, ref: "Service" },
    product: { type: Schema.Types.ObjectId, ref: "SaaSProduct" },
    selectedPackage: String,
    inquiryType: {
      type: String,
      enum: ["contact", "service", "quote", "custom_project", "product"],
      required: true,
      index: true,
    },
    projectType: String,
    budget: String,
    timeline: String,
    message: { type: String, required: true },
    additionalInfo: String,
    attachmentUrl: String,
    status: {
      type: String,
      enum: [...leadStatuses],
      default: "new",
      index: true,
    },
    notes: {
      type: [
        {
          body: String,
          authorName: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    source: String,
    ip: String,
  },
  { timestamps: true },
);

schema.index({ createdAt: -1 });
schema.index({ email: 1, createdAt: -1 });

export const Lead = getModel<LeadDoc>("Lead", schema);
