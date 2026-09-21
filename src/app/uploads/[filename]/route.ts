import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolveUploadFile } from "@/lib/media";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const filePath = await resolveUploadFile(filename);
  if (!filePath) return new NextResponse("Not found", { status: 404 });
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const body = await readFile(filePath);
  return new NextResponse(body, {
    headers: {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
