"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMAGE_ACCEPT } from "@/lib/media-accept";
import { uploadImage } from "@/components/admin/image-field";

export function MediaUploadForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = (form.elements.namedItem("file") as HTMLInputElement | null)?.files?.[0];
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await uploadImage(file);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-8 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input type="file" name="file" accept={IMAGE_ACCEPT} required className="max-w-xs rounded-none" />
        <Button className="rounded-none" disabled={pending}>
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF, or SVG. Max 8MB. Files are saved on this server.</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
