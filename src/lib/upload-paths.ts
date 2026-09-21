import { access } from "node:fs/promises";
import path from "node:path";

export function primaryUploadDir() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
}

export function publicUploadDir() {
  return path.join(process.cwd(), "public", "uploads");
}

export function primaryUploadPath(filename: string) {
  if (process.env.UPLOAD_DIR) {
    return path.join(/* turbopackIgnore: true */ process.env.UPLOAD_DIR, filename);
  }
  return path.join(process.cwd(), "uploads", filename);
}

export function publicUploadPath(filename: string) {
  return path.join(process.cwd(), "public", "uploads", filename);
}

export async function resolveUploadFile(filename: string) {
  const safe = path.basename(filename);
  if (!safe || safe !== filename || safe.includes("..")) return null;
  for (const full of [primaryUploadPath(safe), publicUploadPath(safe)]) {
    try {
      await access(full);
      return full;
    } catch {
      /* try next */
    }
  }
  return null;
}
