export const brand = {
  name: "Graphion Studios",
  shortName: "Graphion",
  tagline: "Systems. Software. Scale.",
  description:
    "Graphion Studios designs, engineers, and operates the digital products ambitious companies run on — custom platforms, SaaS products, and long-term engineering partnerships.",
} as const;

export const routes = {
  home: "/",
  services: "/services",
  products: "/products",
  portfolio: "/portfolio",
  about: "/about",
  blog: "/blog",
  contact: "/contact",
  search: "/search",
  admin: "/admin",
  adminLogin: "/admin/login",
} as const;

export const pagination = {
  publicPageSize: 12,
  adminPageSize: 20,
  blogPageSize: 9,
} as const;

export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
  "archived",
  "spam",
] as const;

export const roles = ["super_admin", "admin", "editor", "viewer"] as const;

export const permissions = [
  "dashboard:read",
  "content:read",
  "content:write",
  "content:publish",
  "leads:read",
  "leads:manage",
  "media:manage",
  "settings:manage",
  "users:manage",
  "seo:manage",
] as const;

export const rolePermissions: Record<(typeof roles)[number], readonly (typeof permissions)[number][]> = {
  super_admin: permissions,
  admin: [
    "dashboard:read",
    "content:read",
    "content:write",
    "content:publish",
    "leads:read",
    "leads:manage",
    "media:manage",
    "settings:manage",
    "seo:manage",
  ],
  editor: [
    "dashboard:read",
    "content:read",
    "content:write",
    "content:publish",
    "media:manage",
  ],
  viewer: ["dashboard:read", "content:read", "leads:read"],
};

export const billingTypes = [
  "one_time",
  "monthly",
  "yearly",
  "custom",
  "contact",
  "free",
] as const;

export const contentStatuses = ["draft", "published", "archived"] as const;
