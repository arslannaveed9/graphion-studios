import { Schema } from "mongoose";
import { SocialLinkSchema, getModel } from "@/models/shared";

export interface TeamMemberDoc {
  name: string;
  position: string;
  image?: string;
  bio?: string;
  skills: string[];
  socialLinks: Array<{ platform?: string; url?: string }>;
  order: number;
  isActive: boolean;
}

const schema = new Schema<TeamMemberDoc>(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    image: String,
    bio: String,
    skills: { type: [String], default: [] },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

schema.index({ order: 1, isActive: 1 });

export const TeamMember = getModel<TeamMemberDoc>("TeamMember", schema);
