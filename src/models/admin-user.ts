import { Schema } from "mongoose";
import { getModel } from "@/models/shared";
import type { Role } from "@/types";

export interface AdminUserDoc {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<AdminUserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["super_admin", "admin", "editor", "viewer"],
      default: "admin",
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export const AdminUser = getModel<AdminUserDoc>("AdminUser", schema);
