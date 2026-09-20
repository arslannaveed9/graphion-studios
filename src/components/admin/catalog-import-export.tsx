"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CatalogKind = "services" | "products";

type CatalogImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; slug?: string; message: string }>;
};

const instructions = [
  "One row or object is one service or product.",
  "Leave slug blank to generate it from the name. Matching slugs update existing records; new slugs create them.",
  "status must be draft, published, or archived.",
  "Lists such as technologies, gallery, screenshots, keywords: separate items with |",
  "features, benefits, process, useCases: JSON array, or Title :: Description separated by ||",
  "faqs: JSON array, or Question :: Answer separated by ||",
  "pricingPlans: JSON array of plans. Copy the example and edit it.",
  "Empty cells are skipped on update so you can change only some columns.",
];

export function CatalogImportExport({
  kind,
  canWrite,
}: {
  kind: CatalogKind;
  canWrite: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CatalogImportResult | null>(null);
  const noun = kind === "services" ? "service" : "product";
  const base = `/api/admin/catalog/${kind}`;

  async function onImport(file: File) {
    setBusy(true);
    setResult(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch(base, { method: "POST", body });
      const payload = (await response.json()) as CatalogImportResult & { error?: string };
      if (!response.ok) {
        toast.error(payload.error || "Import failed.");
        return;
      }
      setResult(payload);
      const summary = `${payload.created} created, ${payload.updated} updated`;
      if (payload.errors.length) toast.error(`${summary}. ${payload.errors.length} row(s) failed.`);
      else toast.success(summary);
      router.refresh();
    } catch {
      toast.error("Import failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mb-8 space-y-4 border border-hairline p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Bulk</p>
          <h2 className="mt-2 font-display text-2xl">Import and export</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Download the template, fill every column, then import the file. Matching slugs update
            existing {noun}s; new slugs create them.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-none">
            <a href={`${base}?mode=template&format=csv`}>
              <Download />
              Template CSV
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-none">
            <a href={`${base}?mode=template&format=json`}>
              <Download />
              Template JSON
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-none">
            <a href={`${base}?mode=export&format=csv`}>
              <FileDown />
              Export CSV
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-none">
            <a href={`${base}?mode=export&format=json`}>
              <FileDown />
              Export JSON
            </a>
          </Button>
          {canWrite ? (
            <>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.json,text/csv,application/json"
                aria-label={`Import ${noun} file`}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onImport(file);
                }}
              />
              <Button
                type="button"
                className="rounded-none"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
              >
                <Upload />
                {busy ? "Importing…" : "Import file"}
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <ul className="grid gap-1 text-sm text-muted-foreground md:grid-cols-2">
        {instructions.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
      {result ? (
        <p className="text-sm">
          {result.created} created · {result.updated} updated · {result.skipped} skipped
          {result.errors.length
            ? ` · ${result.errors
                .slice(0, 4)
                .map((error) => `row ${error.row}: ${error.message}`)
                .join(" · ")}`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
