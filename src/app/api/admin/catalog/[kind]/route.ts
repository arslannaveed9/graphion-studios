import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession, hasPermission } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { SaaSProduct, Service } from "@/models";
import { serialize, toSlug } from "@/lib/format";
import { upsertSearchDocument } from "@/lib/search";
import { bustPublicSite } from "@/lib/cache";
import {
  catalogMeta,
  exampleCatalogItem,
  jsonTemplate,
  normalizeCatalogPayload,
  parseImportFile,
  recordsToCsv,
  type CatalogImportResult,
  type CatalogKind,
} from "@/lib/catalog-io";

const kinds = ["services", "products"] as const;

type CatalogDoc = {
  _id: mongoose.Types.ObjectId;
  slug: string;
  name: string;
  shortDescription?: string;
  status?: string;
  publishedAt?: Date;
};

function isKind(value: string): value is CatalogKind {
  return kinds.includes(value as CatalogKind);
}

function modelFor(kind: CatalogKind) {
  return (kind === "services" ? Service : SaaSProduct) as unknown as mongoose.Model<CatalogDoc>;
}

function searchType(kind: CatalogKind) {
  return kind === "services" ? "service" : "product";
}

async function authorize(permission: "content:read" | "content:write") {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!hasPermission(session.role, permission)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

function download(body: string, filename: string, type: string) {
  return new NextResponse(body, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const auth = await authorize("content:read");
  if (auth.error) return auth.error;

  const { kind: rawKind } = await params;
  if (!isKind(rawKind)) return NextResponse.json({ error: "Unknown catalog" }, { status: 404 });

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "template" ? "template" : "export";
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const noun = catalogMeta[rawKind].noun;

  if (mode === "template") {
    const item = exampleCatalogItem(rawKind);
    if (format === "json") {
      return download(
        `${JSON.stringify(jsonTemplate(rawKind), null, 2)}\n`,
        `${noun}-template.json`,
        "application/json; charset=utf-8",
      );
    }
    return download(recordsToCsv(rawKind, [item]), `${noun}-template.csv`, "text/csv; charset=utf-8");
  }

  await connectDb();
  const docs = serialize(await modelFor(rawKind).find().sort({ order: 1, name: 1 }).lean()) as Array<
    Record<string, unknown>
  >;
  if (format === "json") {
    return download(
      `${JSON.stringify({ kind: rawKind, items: docs.map(stripRecord) }, null, 2)}\n`,
      `${noun}-export-${stamp()}.json`,
      "application/json; charset=utf-8",
    );
  }
  return download(
    recordsToCsv(rawKind, docs),
    `${noun}-export-${stamp()}.csv`,
    "text/csv; charset=utf-8",
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const auth = await authorize("content:write");
  if (auth.error) return auth.error;

  const { kind: rawKind } = await params;
  if (!isKind(rawKind)) return NextResponse.json({ error: "Unknown catalog" }, { status: 404 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a CSV or JSON file." }, { status: 400 });
  }

  const text = await file.text();
  let records: Array<Record<string, unknown>>;
  try {
    records = parseImportFile(rawKind, file.name, text);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not parse the file." },
      { status: 400 },
    );
  }

  await connectDb();
  const Model = modelFor(rawKind);
  const result: CatalogImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
  const paths = new Set<string>([catalogMeta[rawKind].publicPath, `/admin/${rawKind}`]);

  for (const [index, raw] of records.entries()) {
    const row = index + 2;
    const name = String(raw.name || "").trim();
    const slugHint = toSlug(String(raw.slug || name).trim());
    if (!name && !slugHint) {
      result.skipped += 1;
      continue;
    }
    try {
      const existing = slugHint
        ? await Model.findOne({ slug: slugHint }).select("_id slug status publishedAt").lean()
        : null;
      const payload = normalizeCatalogPayload(rawKind, raw, existing ? "update" : "create");
      if (!existing && !String(payload.shortDescription || "").trim()) {
        throw new Error("shortDescription is required for new records.");
      }
      if (payload.status === "published" && !existing?.publishedAt) {
        payload.publishedAt = new Date();
      }

      const doc = existing
        ? await Model.findByIdAndUpdate(existing._id, payload, { new: true })
        : await Model.create(payload);

      if (!doc) throw new Error("Save failed.");
      if (existing) result.updated += 1;
      else result.created += 1;

      const slug = String(doc.slug);
      await upsertSearchDocument({
        type: searchType(rawKind),
        title: String(doc.name),
        excerpt: String(doc.shortDescription || ""),
        url: `${catalogMeta[rawKind].publicPath}/${slug}`,
        slug,
        published: doc.status === "published",
      });
      paths.add(`${catalogMeta[rawKind].publicPath}/${slug}`);
    } catch (error) {
      result.errors.push({
        row,
        slug: slugHint || undefined,
        message: error instanceof Error ? error.message : "Could not import this row.",
      });
    }
  }

  bustPublicSite();
  for (const path of paths) revalidatePath(path);

  return NextResponse.json(result);
}

function stripRecord(record: Record<string, unknown>) {
  const omit = new Set(["_id", "__v", "createdAt", "updatedAt", "id"]);
  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !omit.has(key))
        .map(([key, nested]) => [key, walk(nested)]),
    );
  };
  return walk(record) as Record<string, unknown>;
}
