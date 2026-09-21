import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { connectDb } from "@/lib/db";
import { Media } from "@/models/media";

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

export function getUploadDirs() {
  const primary = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  const publicDir = path.join(process.cwd(), "public", "uploads");
  return { primary, publicDir };
}

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

export async function resolveUploadFile(filename: string) {
  const safe = path.basename(filename);
  if (!safe || safe !== filename || safe.includes("..")) return null;
  const { primary, publicDir } = getUploadDirs();
  for (const dir of [primary, publicDir]) {
    const full = path.join(dir, safe);
    try {
      await access(full);
      return full;
    } catch {
      /* try next */
    }
  }
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
  const { primary, publicDir } = getUploadDirs();
  const filename = `${nanoid()}.${ext}`;

  try {
    await mkdir(primary, { recursive: true });
    await writeFile(path.join(primary, filename), buffer);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "EACCES" || code === "EPERM") {
      throw new Error(`Uploads folder is not writable (${primary}). Give the app user write access, or set UPLOAD_DIR.`);
    }
    throw new Error(error instanceof Error ? error.message : "Could not save the file.");
  }

  await mkdir(publicDir, { recursive: true }).catch(() => undefined);
  await writeFile(path.join(publicDir, filename), buffer).catch(() => undefined);

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
    const { primary, publicDir } = getUploadDirs();
    await unlink(path.join(primary, filename)).catch(() => undefined);
    await unlink(path.join(publicDir, filename)).catch(() => undefined);
  }
  await media.deleteOne();
}
