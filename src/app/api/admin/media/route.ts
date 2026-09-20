import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadMediaFile } from "@/lib/media";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  const media = await uploadMediaFile(file, { alt: String(form.get("alt") || "") });
  return NextResponse.json({ id: media._id, url: media.url });
}
