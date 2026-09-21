import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { connectDb } from "@/lib/db";
import { Media } from "@/models/media";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};
const MAX_BYTES = 8 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function localFilePath(url: string) {
  if (!url.startsWith("/uploads/")) return null;
  const filename = path.basename(url);
  if (!filename) return null;
  return path.join(UPLOAD_DIR, filename);
}

export async function uploadMediaFile(file: File, meta?: { alt?: string; caption?: string }) {
  const ext = ALLOWED[file.type];
  if (!ext) {
    throw new Error("Unsupported file type");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File exceeds 8MB limit");
  }

  await connectDb();
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${nanoid()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return Media.create({
    url: `/uploads/${filename}`,
    provider: "local",
    alt: meta?.alt || file.name,
    caption: meta?.caption,
    bytes: file.size,
    format: ext,
    folder: "uploads",
  });
}

export async function deleteMedia(id: string) {
  await connectDb();
  const media = await Media.findById(id);
  if (!media) return;
  const filePath = localFilePath(media.url);
  if (filePath) {
    await unlink(filePath).catch(() => undefined);
  }
  await media.deleteOne();
}
