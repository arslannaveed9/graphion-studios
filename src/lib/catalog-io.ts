import type { BillingType, ContentStatus } from "@/types";
import { billingTypes, contentStatuses } from "@/config/site";
import { sanitizeRichText } from "@/lib/sanitize";
import { toSlug } from "@/lib/format";

export type CatalogKind = "services" | "products";

type FieldType =
  | "string"
  | "text"
  | "boolean"
  | "number"
  | "status"
  | "stringList"
  | "blocks"
  | "faqs"
  | "plans";

type CatalogField = {
  column: string;
  path: string;
  type: FieldType;
  required?: boolean;
};

export type CatalogRowError = { row: number; slug?: string; message: string };

export type CatalogImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: CatalogRowError[];
};

const SERVICE_FIELDS: CatalogField[] = [
  { column: "name", path: "name", type: "string", required: true },
  { column: "slug", path: "slug", type: "string" },
  { column: "shortDescription", path: "shortDescription", type: "text", required: true },
  { column: "fullDescription", path: "fullDescription", type: "text" },
  { column: "problem", path: "problem", type: "text" },
  { column: "solution", path: "solution", type: "text" },
  { column: "icon", path: "icon", type: "string" },
  { column: "heroImage", path: "heroImage", type: "string" },
  { column: "gallery", path: "gallery", type: "stringList" },
  { column: "features", path: "features", type: "blocks" },
  { column: "benefits", path: "benefits", type: "blocks" },
  { column: "process", path: "process", type: "blocks" },
  { column: "technologies", path: "technologies", type: "stringList" },
  { column: "pricingNotes", path: "pricingNotes", type: "text" },
  { column: "pricingPlans", path: "pricingPlans", type: "plans" },
  { column: "included", path: "included", type: "stringList" },
  { column: "notIncluded", path: "notIncluded", type: "stringList" },
  { column: "enableCustomProject", path: "enableCustomProject", type: "boolean" },
  { column: "customProjectHeading", path: "customProjectHeading", type: "string" },
  { column: "customProjectBody", path: "customProjectBody", type: "text" },
  { column: "customProjectCta", path: "customProjectCta", type: "string" },
  { column: "faqs", path: "faqs", type: "faqs" },
  { column: "status", path: "status", type: "status" },
  { column: "featured", path: "featured", type: "boolean" },
  { column: "order", path: "order", type: "number" },
  { column: "seoTitle", path: "seo.title", type: "string" },
  { column: "seoDescription", path: "seo.description", type: "text" },
  { column: "seoKeywords", path: "seo.keywords", type: "stringList" },
  { column: "seoCanonical", path: "seo.canonical", type: "string" },
  { column: "seoOgTitle", path: "seo.ogTitle", type: "string" },
  { column: "seoOgDescription", path: "seo.ogDescription", type: "text" },
  { column: "seoOgImage", path: "seo.ogImage", type: "string" },
  { column: "seoNoIndex", path: "seo.noIndex", type: "boolean" },
];

const PRODUCT_FIELDS: CatalogField[] = [
  { column: "name", path: "name", type: "string", required: true },
  { column: "slug", path: "slug", type: "string" },
  { column: "shortDescription", path: "shortDescription", type: "text", required: true },
  { column: "fullDescription", path: "fullDescription", type: "text" },
  { column: "logo", path: "logo", type: "string" },
  { column: "heroImage", path: "heroImage", type: "string" },
  { column: "screenshots", path: "screenshots", type: "stringList" },
  { column: "features", path: "features", type: "blocks" },
  { column: "benefits", path: "benefits", type: "blocks" },
  { column: "useCases", path: "useCases", type: "blocks" },
  { column: "targetAudience", path: "targetAudience", type: "stringList" },
  { column: "integrations", path: "integrations", type: "stringList" },
  { column: "technologies", path: "technologies", type: "stringList" },
  { column: "pricingPlans", path: "pricingPlans", type: "plans" },
  { column: "faqs", path: "faqs", type: "faqs" },
  { column: "ctaLabel", path: "ctaLabel", type: "string" },
  { column: "ctaHref", path: "ctaHref", type: "string" },
  { column: "demoUrl", path: "demoUrl", type: "string" },
  { column: "websiteUrl", path: "websiteUrl", type: "string" },
  { column: "documentationUrl", path: "documentationUrl", type: "string" },
  { column: "status", path: "status", type: "status" },
  { column: "featured", path: "featured", type: "boolean" },
  { column: "order", path: "order", type: "number" },
  { column: "seoTitle", path: "seo.title", type: "string" },
  { column: "seoDescription", path: "seo.description", type: "text" },
  { column: "seoKeywords", path: "seo.keywords", type: "stringList" },
  { column: "seoCanonical", path: "seo.canonical", type: "string" },
  { column: "seoOgTitle", path: "seo.ogTitle", type: "string" },
  { column: "seoOgDescription", path: "seo.ogDescription", type: "text" },
  { column: "seoOgImage", path: "seo.ogImage", type: "string" },
  { column: "seoNoIndex", path: "seo.noIndex", type: "boolean" },
];

export const catalogMeta: Record<
  CatalogKind,
  { noun: string; fields: CatalogField[]; publicPath: string }
> = {
  services: { noun: "service", fields: SERVICE_FIELDS, publicPath: "/services" },
  products: { noun: "product", fields: PRODUCT_FIELDS, publicPath: "/products" },
};

const EXAMPLE_PLAN = {
  name: "Starter",
  price: 4900,
  currency: "USD",
  billingType: "one_time" as BillingType,
  customPriceLabel: "",
  isCustom: false,
  isRecommended: true,
  isEnabled: true,
  features: ["Discovery workshop", "Launch support"],
  notIncluded: ["Ongoing retainer"],
  ctaText: "Start this package",
  ctaHref: "",
  notes: "",
  order: 1,
};

export const catalogInstructions = [
  "One row or object is one service or product.",
  "Leave slug blank to generate it from the name. Matching slugs update existing records; new slugs create them.",
  "status must be draft, published, or archived.",
  "Lists such as technologies, gallery, screenshots, keywords: separate items with |",
  "features, benefits, process, useCases: JSON array, or Title :: Description separated by ||",
  "faqs: JSON array, or Question :: Answer separated by ||",
  "pricingPlans: JSON array of plans. Copy the example and edit it.",
  "Empty cells are skipped on update so you can change only some columns.",
];

export function exampleCatalogItem(kind: CatalogKind): Record<string, unknown> {
  if (kind === "products") {
    return {
      name: "Example product",
      slug: "example-product",
      shortDescription: "Replace this with a one-sentence product summary.",
      fullDescription: "<p>Longer product description. HTML is allowed.</p>",
      logo: "https://example.com/logo.svg",
      heroImage: "https://example.com/hero.jpg",
      screenshots: ["https://example.com/shot-1.jpg"],
      features: [{ title: "Core workflow", description: "What the product does every week." }],
      benefits: [{ title: "Time saved", description: "Why a buyer cares." }],
      useCases: [{ title: "Ops team", description: "Who uses it and for what." }],
      targetAudience: ["Agencies", "Operators"],
      integrations: ["Slack", "Stripe"],
      technologies: ["Next.js", "MongoDB"],
      pricingPlans: [EXAMPLE_PLAN],
      faqs: [{ question: "Is this generally available?", answer: "Replace with a real answer." }],
      ctaLabel: "Request a demo",
      ctaHref: "/contact",
      demoUrl: "/contact",
      websiteUrl: "",
      documentationUrl: "",
      status: "draft",
      featured: false,
      order: 0,
      seo: {
        title: "Example product",
        description: "SEO description",
        keywords: ["example"],
        canonical: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        noIndex: false,
      },
    };
  }

  return {
    name: "Example service",
    slug: "example-service",
    shortDescription: "Replace this with a one-sentence service summary.",
    fullDescription: "<p>Longer service description. HTML is allowed.</p>",
    problem: "The operational problem this service solves.",
    solution: "How the engagement is delivered.",
    icon: "LayoutDashboard",
    heroImage: "https://example.com/hero.jpg",
    gallery: ["https://example.com/gallery-1.jpg"],
    features: [{ title: "Discovery", description: "Map users, constraints, and the first release." }],
    benefits: [{ title: "Ownership", description: "You own the codebase and the roadmap." }],
    process: [
      { title: "Discover", description: "Frame the problem." },
      { title: "Build", description: "Ship a useful slice." },
    ],
    technologies: ["Next.js", "TypeScript"],
    pricingNotes: "Packages can be mixed for a custom scope.",
    pricingPlans: [EXAMPLE_PLAN],
    included: ["Kickoff workshop", "Launch support"],
    notIncluded: ["Paid media"],
    enableCustomProject: true,
    customProjectHeading: "Need a different shape of work?",
    customProjectBody: "Tell us the constraint and we will propose a first release.",
    customProjectCta: "Request a custom quote",
    faqs: [{ question: "Do you work in our repos?", answer: "Yes. We prefer your Git and your cloud." }],
    status: "draft",
    featured: false,
    order: 0,
    seo: {
      title: "Example service",
      description: "SEO description",
      keywords: ["example"],
      canonical: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      noIndex: false,
    },
  };
}

export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim()));
}

export function stringifyCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell ?? "";
          if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
          return value;
        })
        .join(","),
    )
    .join("\r\n");
}

export function recordsToCsv(kind: CatalogKind, records: Array<Record<string, unknown>>): string {
  const fields = catalogMeta[kind].fields;
  const header = fields.map((field) => field.column);
  const body = records.map((record) =>
    fields.map((field) => encodeCell(getPath(record, field.path), field.type)),
  );
  return `\uFEFF${stringifyCsv([header, ...body])}`;
}

export function csvToRecords(kind: CatalogKind, csv: string): Array<Record<string, unknown>> {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];
  const [header, ...body] = rows;
  const index = new Map(header.map((column, i) => [column.trim(), i]));
  return body.map((row) => recordFromRow(kind, (column) => row[index.get(column) ?? -1] ?? ""));
}

export function jsonTemplate(kind: CatalogKind) {
  return {
    kind,
    instructions: catalogInstructions,
    items: [exampleCatalogItem(kind)],
  };
}

export function parseImportFile(kind: CatalogKind, filename: string, text: string): Array<Record<string, unknown>> {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const isJson = filename.toLowerCase().endsWith(".json") || trimmed.startsWith("{") || trimmed.startsWith("[");
  if (isJson) {
    const parsed = JSON.parse(trimmed) as unknown;
    const items = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { items?: unknown }).items)
        ? (parsed as { items: unknown[] }).items
        : null;
    if (!items) throw new Error("JSON must be an array, or an object with an items array.");
    return items.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
  }
  return csvToRecords(kind, text);
}

export function normalizeCatalogPayload(
  kind: CatalogKind,
  raw: Record<string, unknown>,
  mode: "create" | "update",
): Record<string, unknown> {
  const fields = catalogMeta[kind].fields;
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const present = hasPath(raw, field.path);
    const value = present ? getPath(raw, field.path) : undefined;
    const empty = isEmptyValue(value);
    if (mode === "update" && (!present || empty)) continue;

    if (field.required && empty) {
      throw new Error(`${field.column} is required.`);
    }
    if (empty) continue;

    const decoded = coerceValue(value, field.type);
    if (decoded === undefined) continue;
    if (field.path === "fullDescription" && typeof decoded === "string") {
      setPath(payload, field.path, sanitizeRichText(decoded));
      continue;
    }
    setPath(payload, field.path, decoded);
  }

  const name = String(payload.name || raw.name || "").trim();
  const slugSource = String(payload.slug || raw.slug || name).trim();
  if (name) payload.name = name;
  if (slugSource) payload.slug = toSlug(slugSource);
  if (!payload.slug) throw new Error("A name or slug is required.");

  if (kind === "services" && mode === "create" && payload.enableCustomProject === undefined) {
    payload.enableCustomProject = true;
  }

  return payload;
}

function recordFromRow(kind: CatalogKind, get: (column: string) => string): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const field of catalogMeta[kind].fields) {
    const raw = get(field.column).trim();
    if (!raw) continue;
    const value = decodeCell(raw, field.type);
    if (value === undefined) continue;
    setPath(record, field.path, value);
  }
  return record;
}

function encodeCell(value: unknown, type: FieldType): string {
  if (value == null || value === "") return "";
  if (type === "boolean") return value === true || value === "true" ? "true" : "false";
  if (type === "number") return String(value);
  if (type === "stringList") return Array.isArray(value) ? value.map(String).join(" | ") : String(value);
  if (type === "blocks" || type === "faqs" || type === "plans") {
    return JSON.stringify(cleanNested(value));
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function decodeCell(raw: string, type: FieldType): unknown {
  return coerceValue(raw, type);
}

function coerceValue(value: unknown, type: FieldType): unknown {
  if (type === "string" || type === "text") return String(value ?? "").trim();
  if (type === "boolean") return parseBoolean(value);
  if (type === "number") {
    const number = typeof value === "number" ? value : Number(String(value).trim());
    if (!Number.isFinite(number)) throw new Error("Expected a number.");
    return number;
  }
  if (type === "status") {
    const status = String(value).trim().toLowerCase() as ContentStatus;
    if (!contentStatuses.includes(status)) throw new Error("status must be draft, published, or archived.");
    return status;
  }
  if (type === "stringList") return parseStringList(value);
  if (type === "blocks") return parseBlocks(value);
  if (type === "faqs") return parseFaqs(value);
  if (type === "plans") return parsePlans(value);
  return value;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  throw new Error("Expected true or false.");
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBlocks(value: unknown): Array<{ title: string; description?: string; icon?: string }> {
  const items = parseObjectList(value);
  return items.map((item) => {
    const title = String(item.title || item.question || "").trim();
    if (!title) throw new Error("Each feature/benefit needs a title.");
    return {
      title,
      description: item.description ? String(item.description) : undefined,
      icon: item.icon ? String(item.icon) : undefined,
    };
  });
}

function parseFaqs(value: unknown): Array<{ question: string; answer: string }> {
  const items = parseObjectList(value, "question");
  return items.map((item) => {
    const question = String(item.question || item.title || "").trim();
    const answer = String(item.answer || item.description || "").trim();
    if (!question || !answer) throw new Error("Each FAQ needs a question and answer.");
    return { question, answer };
  });
}

function parsePlans(value: unknown): Array<Record<string, unknown>> {
  const items = Array.isArray(value) ? value : parseJsonArray(String(value));
  if (!Array.isArray(items) || !items.length) return [];
  return items.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error("Each pricing plan must be an object.");
    const plan = item as Record<string, unknown>;
    const name = String(plan.name || "").trim();
    if (!name) throw new Error("Each pricing plan needs a name.");
    const billingType = String(plan.billingType || "one_time") as BillingType;
    if (!billingTypes.includes(billingType)) {
      throw new Error(`billingType must be one of: ${billingTypes.join(", ")}.`);
    }
    const priceRaw = plan.price;
    const price =
      priceRaw === "" || priceRaw == null || plan.isCustom === true ? null : Number(priceRaw);
    if (price !== null && !Number.isFinite(price)) throw new Error(`Plan "${name}" has an invalid price.`);
    return {
      name,
      price,
      currency: String(plan.currency || "USD"),
      billingType,
      customPriceLabel: plan.customPriceLabel ? String(plan.customPriceLabel) : undefined,
      isCustom: Boolean(plan.isCustom) || price === null,
      isRecommended: Boolean(plan.isRecommended),
      isEnabled: plan.isEnabled === false ? false : true,
      features: parseStringList(plan.features || []),
      notIncluded: parseStringList(plan.notIncluded || []),
      ctaText: plan.ctaText ? String(plan.ctaText) : undefined,
      ctaHref: plan.ctaHref ? String(plan.ctaHref) : undefined,
      notes: plan.notes ? String(plan.notes) : undefined,
      order: Number.isFinite(Number(plan.order)) ? Number(plan.order) : index + 1,
    };
  });
}

function parseObjectList(value: unknown, titleKey = "title"): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
  }
  const raw = String(value).trim();
  if (!raw) return [];
  if (raw.startsWith("[")) {
    const parsed = parseJsonArray(raw);
    return parsed.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
  }
  return raw
    .split("||")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [left, ...rest] = chunk.split("::");
      const title = left.trim();
      const description = rest.join("::").trim();
      return titleKey === "question"
        ? { question: title, answer: description }
        : { title, description };
    });
}

function parseJsonArray(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Expected a JSON array.");
    return parsed;
  } catch {
    throw new Error("Could not parse JSON. Check quotes in nested cells, or download the template again.");
  }
}

function cleanNested(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cleanNested);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(record)) {
    if (key === "_id" || key === "id" || key === "__v") continue;
    next[key] = cleanNested(nested);
  }
  return next;
}

function getPath(record: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, record);
}

function hasPath(record: Record<string, unknown>, path: string): boolean {
  const keys = path.split(".");
  let current: unknown = record;
  for (const key of keys) {
    if (!current || typeof current !== "object" || !(key in current)) return false;
    current = (current as Record<string, unknown>)[key];
  }
  return true;
}

function setPath(record: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let current = record;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const next = current[key];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

function isEmptyValue(value: unknown) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}
