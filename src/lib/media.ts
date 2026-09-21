import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { connectDb } from "@/lib/db";
import { Media } from "@/models/media";
import { primaryUploadDir, primaryUploadPath, publicUploadDir, publicUploadPath } from "@/lib/upload-paths";

export { resolveUploadFile } from "@/lib/upload-paths";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/x-png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const EXT_BY_NAME: Record<string, string> = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
  svg: "svg",
};

const MAX_BYTES = 8 * 1024 * 1024;

function sniffExt(file: File, buffer: Buffer) {
  const fromType = EXT_BY_TYPE[(file.type || "").toLowerCase()];
  if (fromType) return fromType;
  const nameExt = file.name.split(".").pop()?.toLowerCase() || "";
  if (EXT_BY_NAME[nameExt]) return EXT_BY_NAME[nameExt];
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "png";
  if (buffer.slice(0, 4).toString("ascii") === "RIFF" && buffer.slice(8, 12).toString("ascii") === "WEBP") return "webp";
  if (buffer.slice(0, 3).toString("ascii") === "GIF") return "gif";
  const head = buffer.slice(0, 256).toString("utf8").toLowerCase();
  if (head.includes("<svg") || head.includes("<!doctype svg")) return "svg";
  return null;
}

export async function uploadMediaFile(file: File, meta?: { alt?: string; caption?: string }) {
  if (file.size > MAX_BYTES) {
    throw new Error("File exceeds 8MB limit");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = sniffExt(file, buffer);
  if (!ext) {
    throw new Error("Use a JPG, PNG, WebP, GIF, or SVG image.");
  }

  await connectDb();
  const filename = `${nanoid()}.${ext}`;
  const primaryDir = primaryUploadDir();

  try {
    await mkdir(primaryDir, { recursive: true });
    await writeFile(primaryUploadPath(filename), buffer);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "EACCES" || code === "EPERM") {
      throw new Error(`Uploads folder is not writable (${primaryDir}). Give the app user write access, or set UPLOAD_DIR.`);
    }
    throw new Error(error instanceof Error ? error.message : "Could not save the file.");
  }

  await mkdir(publicUploadDir(), { recursive: true }).catch(() => undefined);
  await writeFile(publicUploadPath(filename), buffer).catch(() => undefined);

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
  const filename = path.basename(media.url || "");
  if (filename) {
    await unlink(primaryUploadPath(filename)).catch(() => undefined);
    await unlink(publicUploadPath(filename)).catch(() => undefined);
  }
  await media.deleteOne();
}
