import { connectDb } from "@/lib/db";
import { SearchDocument } from "@/models/ops";

export async function upsertSearchDocument(doc: {
  type: "service" | "product" | "blog" | "portfolio";
  title: string;
  excerpt: string;
  url: string;
  slug: string;
  published: boolean;
}) {
  await connectDb();
  await SearchDocument.findOneAndUpdate(
    { type: doc.type, slug: doc.slug },
    doc,
    { upsert: true, new: true },
  );
}

export async function removeSearchDocument(
  type: "service" | "product" | "blog" | "portfolio",
  slug: string,
) {
  await connectDb();
  await SearchDocument.deleteOne({ type, slug });
}

export async function searchSite(query: string, limit = 12) {
  await connectDb();
  const q = query.trim();
  if (!q) return [];

  const textHits = await SearchDocument.find(
    { $text: { $search: q }, published: true },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();

  if (textHits.length) return textHits;

  return SearchDocument.find({
    published: true,
    $or: [
      { title: { $regex: q, $options: "i" } },
      { excerpt: { $regex: q, $options: "i" } },
    ],
  })
    .limit(limit)
    .lean();
}
