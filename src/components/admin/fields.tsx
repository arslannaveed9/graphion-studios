"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageField } from "@/components/admin/image-field";

export function JsonListField({
  name,
  label,
  value,
  keys,
}: {
  name: string;
  label: string;
  value: Array<Record<string, string>>;
  keys: { key: string; label: string; textarea?: boolean }[];
}) {
  const [items, setItems] = useState(value?.length ? value : []);

  function update(index: number, key: string, next: string) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [key]: next } : item)));
  }

  return (
    <fieldset className="space-y-3 rounded-2xl border border-border p-4">
      <legend className="px-2 text-sm font-semibold">{label}</legend>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-2xl border border-border/70 bg-card p-3 md:grid-cols-2">
          {keys.map((field) =>
            field.textarea ? (
              <div key={field.key} className="space-y-1.5 md:col-span-2">
                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                <Textarea
                  className="rounded-xl"
                  placeholder={field.label}
                  value={item[field.key] || ""}
                  onChange={(e) => update(index, field.key, e.target.value)}
                />
              </div>
            ) : (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                <Input
                  className="rounded-xl"
                  placeholder={field.label}
                  value={item[field.key] || ""}
                  onChange={(e) => update(index, field.key, e.target.value)}
                />
              </div>
            ),
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => setItems((c) => c.filter((_, i) => i !== index))}>
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() => setItems((c) => [...c, Object.fromEntries(keys.map((k) => [k.key, ""]))])}
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add {label.toLowerCase()}
      </Button>
    </fieldset>
  );
}

export function StringListField({ name, label, value }: { name: string; label: string; value?: string[] }) {
  const [items, setItems] = useState((value || []).join("\n"));
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items.split("\n").map((s) => s.trim()).filter(Boolean))}
      />
      <Textarea className="rounded-xl" value={items} onChange={(e) => setItems(e.target.value)} />
      <p className="text-xs text-muted-foreground">One item per line.</p>
    </div>
  );
}

export function PricingField({
  name,
  value,
}: {
  name: string;
  value: Array<Record<string, unknown>>;
}) {
  const [plans, setPlans] = useState(
    value?.length
      ? value
      : [
          {
            name: "Basic",
            price: 0,
            currency: "USD",
            billingType: "one_time",
            features: [],
            notIncluded: [],
            isEnabled: true,
            order: 1,
          },
        ],
  );

  return (
    <fieldset className="space-y-4 rounded-2xl border border-border p-4">
      <legend className="px-2 text-sm font-semibold">Pricing plans</legend>
      <input type="hidden" name={name} value={JSON.stringify(plans)} />
      {plans.map((plan, index) => (
        <div key={index} className="grid gap-3 rounded-2xl border border-border/70 bg-card p-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Plan name</Label>
            <Input
              className="rounded-xl"
              value={String(plan.name || "")}
              onChange={(e) => setPlans((c) => c.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Price (empty = custom)</Label>
            <Input
              className="rounded-xl"
              value={plan.price === null || plan.price === undefined ? "" : String(plan.price)}
              onChange={(e) =>
                setPlans((c) =>
                  c.map((p, i) => (i === index ? { ...p, price: e.target.value === "" ? null : Number(e.target.value) } : p)),
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Currency</Label>
            <Input
              className="rounded-xl"
              value={String(plan.currency || "USD")}
              onChange={(e) => setPlans((c) => c.map((p, i) => (i === index ? { ...p, currency: e.target.value } : p)))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Billing</Label>
            <select
              className="h-9 w-full rounded-xl border border-input bg-background px-2 text-sm"
              value={String(plan.billingType || "one_time")}
              onChange={(e) => setPlans((c) => c.map((p, i) => (i === index ? { ...p, billingType: e.target.value } : p)))}
            >
              {["one_time", "monthly", "yearly", "custom", "contact", "free"].map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Custom price label</Label>
            <Input
              className="rounded-xl"
              placeholder="Contact sales"
              value={String(plan.customPriceLabel || "")}
              onChange={(e) =>
                setPlans((c) => c.map((p, i) => (i === index ? { ...p, customPriceLabel: e.target.value } : p)))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Button text</Label>
            <Input
              className="rounded-xl"
              value={String(plan.ctaText || "")}
              onChange={(e) => setPlans((c) => c.map((p, i) => (i === index ? { ...p, ctaText: e.target.value } : p)))}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs text-muted-foreground">Features, one per line</Label>
            <Textarea
              className="rounded-xl"
              value={Array.isArray(plan.features) ? plan.features.join("\n") : ""}
              onChange={(e) =>
                setPlans((c) =>
                  c.map((p, i) =>
                    i === index ? { ...p, features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) } : p,
                  ),
                )
              }
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs text-muted-foreground">Not included, one per line</Label>
            <Textarea
              className="rounded-xl"
              value={Array.isArray(plan.notIncluded) ? plan.notIncluded.join("\n") : ""}
              onChange={(e) =>
                setPlans((c) =>
                  c.map((p, i) =>
                    i === index ? { ...p, notIncluded: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) } : p,
                  ),
                )
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(plan.isRecommended)}
              onChange={(e) =>
                setPlans((c) => c.map((p, i) => (i === index ? { ...p, isRecommended: e.target.checked } : p)))
              }
            />
            Recommended
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={plan.isEnabled !== false}
              onChange={(e) =>
                setPlans((c) => c.map((p, i) => (i === index ? { ...p, isEnabled: e.target.checked } : p)))
              }
            />
            Enabled
          </label>
          <Button type="button" variant="ghost" onClick={() => setPlans((c) => c.filter((_, i) => i !== index))}>
            Delete plan
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() =>
          setPlans((c) => [
            ...c,
            {
              name: "New plan",
              price: null,
              currency: "USD",
              billingType: "custom",
              features: [],
              notIncluded: [],
              isEnabled: true,
              order: c.length + 1,
            },
          ])
        }
      >
        Add plan
      </Button>
    </fieldset>
  );
}

export function SeoFields({ seo }: { seo?: Record<string, unknown> }) {
  return (
    <fieldset className="grid gap-3 rounded-2xl border border-border p-4 md:grid-cols-2">
      <legend className="px-2 text-sm font-semibold">SEO</legend>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">SEO title</Label>
        <Input name="seoTitle" defaultValue={String(seo?.title || "")} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Canonical URL</Label>
        <Input name="seoCanonical" defaultValue={String(seo?.canonical || "")} className="rounded-xl" />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label className="text-xs text-muted-foreground">Meta description</Label>
        <Textarea name="seoDescription" defaultValue={String(seo?.description || "")} className="rounded-xl" />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label className="text-xs text-muted-foreground">Keywords, comma separated</Label>
        <Input name="seoKeywords" defaultValue={Array.isArray(seo?.keywords) ? seo.keywords.join(", ") : ""} className="rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">OG title</Label>
        <Input name="ogTitle" defaultValue={String(seo?.ogTitle || "")} className="rounded-xl" />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <ImageField name="ogImage" label="OG image" defaultValue={String(seo?.ogImage || "")} />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label className="text-xs text-muted-foreground">OG description</Label>
        <Textarea name="ogDescription" defaultValue={String(seo?.ogDescription || "")} className="rounded-xl" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="noIndex" defaultChecked={Boolean(seo?.noIndex)} />
        No-index
      </label>
    </fieldset>
  );
}
