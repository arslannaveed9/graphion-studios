"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IMAGE_ACCEPT } from "@/lib/media-accept";

export async function uploadImage(file: File) {
  const body = new FormData();
  body.set("file", file);
  body.set("alt", file.name);
  const response = await fetch("/api/admin/media", { method: "POST", body });
  const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !data.url) {
    if (response.status === 413) {
      throw new Error("This file is too large for the web server. Raise Nginx client_max_body_size to 12m and reload Nginx.");
    }
    throw new Error(data.error || `Upload failed (${response.status})`);
  }
  return data.url;
}

export function ImageField({
  name,
  label,
  defaultValue,
  value,
  onChange,
  contain,
}: {
  name?: string;
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (url: string) => void;
  contain?: boolean;
}) {
  const [inner, setInner] = useState(defaultValue || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const url = value ?? inner;

  function setUrl(next: string) {
    onChange?.(next);
    if (value === undefined) setInner(next);
  }

  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}
      {name ? <input type="hidden" name={name} value={url} /> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={url}
          onChange={(event) => {
            setError("");
            setUrl(event.target.value);
          }}
          placeholder="Upload a file or paste a URL"
          className="rounded-none"
        />
        <label className="inline-flex h-9 cursor-pointer items-center justify-center border border-border px-3 text-sm whitespace-nowrap hover:bg-muted">
          {busy ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept={IMAGE_ACCEPT}
            className="sr-only"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setBusy(true);
              setError("");
              try {
                setUrl(await uploadImage(file));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed.");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </div>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className={`mt-1 h-24 w-auto max-w-full border border-hairline ${contain ? "object-contain bg-muted/40 p-2" : "object-cover"}`} />
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function ImageListField({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value?: string[];
}) {
  const [items, setItems] = useState(value?.length ? value : [""]);
  const [error, setError] = useState("");
  const [busyIndex, setBusyIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={JSON.stringify(items.map((item) => item.trim()).filter(Boolean))} />
      {items.map((item, index) => (
        <div key={index} className="space-y-2 border border-hairline p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={item}
              onChange={(event) =>
                setItems((current) => current.map((entry, i) => (i === index ? event.target.value : entry)))
              }
              placeholder="Upload a file or paste a URL"
              className="rounded-none"
            />
            <label className="inline-flex h-9 cursor-pointer items-center justify-center border border-border px-3 text-sm whitespace-nowrap hover:bg-muted">
              {busyIndex === index ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept={IMAGE_ACCEPT}
                className="sr-only"
                disabled={busyIndex !== null}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  setBusyIndex(index);
                  setError("");
                  try {
                    const url = await uploadImage(file);
                    setItems((current) => current.map((entry, i) => (i === index ? url : entry)));
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Upload failed.");
                  } finally {
                    setBusyIndex(null);
                  }
                }}
              />
            </label>
            <button
              type="button"
              className="h-9 px-3 text-sm text-destructive"
              onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
          {item ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item} alt="" className="h-20 w-auto border border-hairline object-cover" />
          ) : null}
        </div>
      ))}
      <button
        type="button"
        className="text-sm font-semibold text-copper"
        onClick={() => setItems((current) => [...current, ""])}
      >
        Add image
      </button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
