import { Schema } from "mongoose";
import { getModel } from "@/models/shared";
import type { HomepageSection, NavItem, FooterColumn } from "@/types";

export interface NavigationDoc {
  location: "header" | "footer";
  items: NavItem[];
}

const navItemSchema = new Schema(
  {
    id: String,
    label: String,
    href: String,
    isExternal: Boolean,
    isEnabled: { type: Boolean, default: true },
    order: Number,
    children: [
      {
        id: String,
        label: String,
        href: String,
        isExternal: Boolean,
        isEnabled: { type: Boolean, default: true },
        order: Number,
      },
    ],
  },
  { _id: false },
);

const navigationSchema = new Schema<NavigationDoc>(
  {
    location: { type: String, enum: ["header", "footer"], unique: true },
    items: { type: [navItemSchema], default: [] },
  },
  { timestamps: true },
);

export const Navigation = getModel<NavigationDoc>("Navigation", navigationSchema);

export interface FooterDoc {
  columns: FooterColumn[];
  newsletterEnabled: boolean;
  newsletterHeading?: string;
  newsletterBody?: string;
  copyright?: string;
}

const footerColumnSchema = new Schema(
  {
    id: String,
    title: String,
    links: [{ label: String, href: String, isExternal: Boolean, _id: false }],
    order: Number,
  },
  { _id: false },
);

const footerSchema = new Schema<FooterDoc>(
  {
    columns: { type: [footerColumnSchema], default: [] },
    newsletterEnabled: { type: Boolean, default: true },
    newsletterHeading: String,
    newsletterBody: String,
    copyright: String,
  },
  { timestamps: true },
);

export const Footer = getModel<FooterDoc>("Footer", footerSchema);

export interface HomepageDoc {
  sections: HomepageSection[];
}

const homepageSchema = new Schema(
  { sections: { type: Array, default: [] } },
  { timestamps: true, strict: false },
);

export const Homepage = getModel<HomepageDoc>("Homepage", homepageSchema as Schema<HomepageDoc>);

export interface AboutPageDoc {
  introductionHeading?: string;
  introduction?: string;
  mission?: string;
  vision?: string;
  story?: string;
  values: Array<{ title: string; description: string }>;
  whyUs: Array<{ title: string; description: string }>;
  stats: Array<{ label: string; value: string }>;
  ctaHeading?: string;
  ctaBody?: string;
  ctaLabel?: string;
  ctaHref?: string;
  heroImage?: string;
}

const aboutSchema = new Schema<AboutPageDoc>(
  {
    introductionHeading: String,
    introduction: String,
    mission: String,
    vision: String,
    story: String,
    values: { type: [{ title: String, description: String, _id: false }], default: [] },
    whyUs: { type: [{ title: String, description: String, _id: false }], default: [] },
    stats: { type: [{ label: String, value: String, _id: false }], default: [] },
    ctaHeading: String,
    ctaBody: String,
    ctaLabel: String,
    ctaHref: String,
    heroImage: String,
  },
  { timestamps: true },
);

export const AboutPage = getModel<AboutPageDoc>("AboutPage", aboutSchema);
