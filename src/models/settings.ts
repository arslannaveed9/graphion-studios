import { Schema } from "mongoose";
import { SeoSchema, SocialLinkSchema, getModel } from "@/models/shared";

export interface SiteSettingsDoc {
  companyName: string;
  tagline?: string;
  logo?: string;
  logoLight?: string;
  favicon?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  businessHours?: string;
  socialLinks: Array<{ platform?: string; url?: string }>;
  copyright?: string;
  defaultSeo: Record<string, unknown>;
  googleAnalyticsId?: string;
  googleSiteVerification?: string;
  robotsExtra?: string;
  sitemapEnabled: boolean;
  contactMapEmbed?: string;
}

const schema = new Schema<SiteSettingsDoc>(
  {
    companyName: { type: String, required: true },
    tagline: String,
    logo: String,
    logoLight: String,
    favicon: String,
    email: String,
    phone: String,
    whatsapp: String,
    address: String,
    businessHours: String,
    socialLinks: { type: [SocialLinkSchema], default: [] },
    copyright: String,
    defaultSeo: { type: SeoSchema, default: {} },
    googleAnalyticsId: String,
    googleSiteVerification: String,
    robotsExtra: String,
    sitemapEnabled: { type: Boolean, default: true },
    contactMapEmbed: String,
  },
  { timestamps: true },
);

export const SiteSettings = getModel<SiteSettingsDoc>("SiteSettings", schema);

export type EmailProviderMode = "auto" | "smtp" | "resend";

export interface EmailTemplateFields {
  contactAdminSubject?: string;
  contactAdminHtml?: string;
  contactCustomerSubject?: string;
  contactCustomerHtml?: string;
  inquiryAdminSubject?: string;
  inquiryAdminHtml?: string;
  inquiryCustomerSubject?: string;
  inquiryCustomerHtml?: string;
}

export interface EmailSettingsDoc extends EmailTemplateFields {
  notifyOnContact: boolean;
  notifyOnInquiry: boolean;
  sendCustomerConfirmation: boolean;
  fromName?: string;
  fromEmail?: string;
  notifyEmail?: string;
  provider: EmailProviderMode;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure: boolean;
}

const emailSchema = new Schema<EmailSettingsDoc>(
  {
    notifyOnContact: { type: Boolean, default: true },
    notifyOnInquiry: { type: Boolean, default: true },
    sendCustomerConfirmation: { type: Boolean, default: true },
    fromName: String,
    fromEmail: String,
    notifyEmail: String,
    provider: { type: String, enum: ["auto", "smtp", "resend"], default: "auto" },
    smtpHost: String,
    smtpPort: { type: Number, default: 587 },
    smtpUser: String,
    smtpPassword: { type: String, select: false },
    smtpSecure: { type: Boolean, default: false },
    contactAdminSubject: String,
    contactAdminHtml: String,
    contactCustomerSubject: String,
    contactCustomerHtml: String,
    inquiryAdminSubject: String,
    inquiryAdminHtml: String,
    inquiryCustomerSubject: String,
    inquiryCustomerHtml: String,
  },
  { timestamps: true },
);

export const EmailSettings = getModel<EmailSettingsDoc>("EmailSettings", emailSchema);
