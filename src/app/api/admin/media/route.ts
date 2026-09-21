import { NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/auth";
import { uploadMediaFile } from "@/lib/media";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !(hasPermission(session.role, "media:manage") || hasPermission(session.role, "content:write"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }
    const media = await uploadMediaFile(file, { alt: String(form.get("alt") || file.name) });
    return NextResponse.json({ id: String(media._id), url: media.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
