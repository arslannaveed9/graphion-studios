import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { connectDb } from "@/lib/db";
import { Media } from "@/models/media";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_BYTES = 8 * 1024 * 1024;

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadMediaFile(file: File, meta?: { alt?: string; caption?: string }) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Unsupported file type");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File exceeds 8MB limit");
  }

  await connectDb();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (cloudinaryConfigured()) {
    configureCloudinary();
    const uploaded = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER || "graphion",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) reject(error || new Error("Upload failed"));
            else resolve(result as never);
          },
        )
        .end(buffer);
    });

    return Media.create({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      provider: "cloudinary",
      alt: meta?.alt || file.name,
      caption: meta?.caption,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
      folder: process.env.CLOUDINARY_FOLDER || "graphion",
    });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Cloudinary is not configured");
  }

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${nanoid()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return Media.create({
    url: `/uploads/${filename}`,
    provider: "local",
    alt: meta?.alt || file.name,
    caption: meta?.caption,
    bytes: file.size,
    format: ext,
  });
}

export async function deleteMedia(id: string) {
  await connectDb();
  const media = await Media.findById(id);
  if (!media) return;
  if (media.provider === "cloudinary" && media.publicId && cloudinaryConfigured()) {
    configureCloudinary();
    await cloudinary.uploader.destroy(media.publicId);
  }
  await media.deleteOne();
}
