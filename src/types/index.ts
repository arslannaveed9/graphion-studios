import type {
  billingTypes,
  contentStatuses,
  leadStatuses,
  permissions,
  roles,
} from "@/config/site";

export type Role = (typeof roles)[number];
export type Permission = (typeof permissions)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type BillingType = (typeof billingTypes)[number];
export type ContentStatus = (typeof contentStatuses)[number];

export type InquiryType =
  | "contact"
  | "service"
  | "quote"
  | "custom_project"
  | "product";

export interface SeoFields {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
}

export interface CtaFields {
  label: string;
  href: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number | null;
  currency: string;
  billingType: BillingType;
  customPriceLabel?: string;
  isCustom?: boolean;
  isRecommended?: boolean;
  isEnabled?: boolean;
  features: string[];
  notIncluded: string[];
  ctaText?: string;
  ctaHref?: string;
  notes?: string;
  order: number;
}

export interface ContentBlock {
  title: string;
  description?: string;
  icon?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
  isEnabled?: boolean;
  order: number;
  children?: NavItem[];
}

export interface FooterColumn {
  id: string;
  title: string;
  links: { label: string; href: string; isExternal?: boolean }[];
  order: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface HomepageSection {
  id: string;
  type:
    | "hero"
    | "logos"
    | "services"
    | "why"
    | "technologies"
    | "process"
    | "products"
    | "portfolio"
    | "testimonials"
    | "stats"
    | "cta";
  enabled: boolean;
  order: number;
  kicker?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  primaryCta?: CtaFields;
  secondaryCta?: CtaFields;
  mediaUrl?: string;
  featuredIds?: string[];
  items?: Array<{
    title: string;
    description?: string;
    value?: string;
    label?: string;
    icon?: string;
    image?: string;
  }>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
