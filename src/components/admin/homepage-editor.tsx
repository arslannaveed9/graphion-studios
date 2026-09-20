"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { saveHomepageAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { HomepageSection } from "@/types";

const SECTION_TYPES = [
  "hero",
  "logos",
  "services",
  "why",
  "technologies",
  "process",
  "products",
  "portfolio",
  "testimonials",
  "stats",
  "cta",
] as const;

const SECTION_LABELS: Record<(typeof SECTION_TYPES)[number], string> = {
  hero: "Hero",
  logos: "Client names",
  services: "Services",
  why: "Why us",
  technologies: "Technologies",
  process: "Process",
  products: "Products",
  portfolio: "Portfolio",
  testimonials: "Testimonials",
  stats: "Stats",
  cta: "Call to action",
};

type Option = { id: string; name: string };
type Item = NonNullable<HomepageSection["items"]>[number];

function blankSection(type: HomepageSection["type"], order: number): HomepageSection {
  return {
    id: nanoid(),
    type,
    enabled: true,
    order,
    kicker: "",
    heading: "",
    subheading: "",
    body: "",
    primaryCta: { label: "", href: "" },
    secondaryCta: { label: "", href: "" },
    featuredIds: [],
    items: [],
  };
}

function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {multiline ? (
        <Textarea
          className="min-h-24 rounded-xl"
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          className="rounded-xl"
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function FeaturedPicker({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: Option[];
  selected?: string[];
  onChange: (ids: string[]) => void;
}) {
  const current = selected || [];
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="text-xs text-muted-foreground">
        Optional order. Selected items appear first; every other published item still shows on the homepage.
      </p>
      <div className="flex flex-wrap gap-2">
        {options.length ? (
          options.map((option) => {
            const on = current.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onChange(on ? current.filter((id) => id !== option.id) : [...current, option.id])
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  on
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {option.name}
              </button>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No published items yet.</p>
        )}
      </div>
    </div>
  );
}

function ItemsEditor({
  section,
  onChange,
}: {
  section: HomepageSection;
  onChange: (items: Item[]) => void;
}) {
  const items = section.items || [];
  const kind =
    section.type === "stats" ? "stats" : section.type === "logos" ? "logos" : "copy";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">
          {kind === "stats" ? "Stat items" : kind === "logos" ? "Client names" : "Cards"}
        </Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => onChange([...items, { title: "", description: "", label: "", value: "" }])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={`${section.id}-item-${index}`} className="grid gap-3 rounded-2xl border border-border/80 p-3 md:grid-cols-2">
          {kind === "stats" ? (
            <>
              <Field label="Value" value={item.value} onChange={(value) => onChange(items.map((row, i) => (i === index ? { ...row, value } : row)))} />
              <Field label="Label" value={item.label} onChange={(label) => onChange(items.map((row, i) => (i === index ? { ...row, label } : row)))} />
            </>
          ) : kind === "logos" ? (
            <Field
              label="Name"
              value={item.title}
              onChange={(title) => onChange(items.map((row, i) => (i === index ? { ...row, title } : row)))}
            />
          ) : (
            <>
              <Field label="Title" value={item.title} onChange={(title) => onChange(items.map((row, i) => (i === index ? { ...row, title } : row)))} />
              <Field
                label="Description"
                multiline
                value={item.description}
                onChange={(description) => onChange(items.map((row, i) => (i === index ? { ...row, description } : row)))}
              />
            </>
          )}
          <div className="md:col-span-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(items.filter((_, i) => i !== index))}>
              Remove item
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomepageEditor({
  sections,
  services,
  products,
  projects,
}: {
  sections: HomepageSection[];
  services: Option[];
  products: Option[];
  projects: Option[];
}) {
  const [list, setList] = useState(sections);
  const [openId, setOpenId] = useState<string | undefined>(sections[0]?.id);
  const [addType, setAddType] = useState<HomepageSection["type"]>("hero");

  function patch(id: string, next: Partial<HomepageSection>) {
    setList((current) => current.map((section) => (section.id === id ? { ...section, ...next } : section)));
  }

  function move(index: number, direction: -1 | 1) {
    setList((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((section, order) => ({ ...section, order: order + 1 }));
    });
  }

  return (
    <form action={saveHomepageAction} className="space-y-5">
      <input type="hidden" name="sections" value={JSON.stringify(list)} />
      <p className="text-sm text-muted-foreground">
        Turn sections on or off, reorder them, and edit the copy. Featured chips pick which published services, products, or projects appear.
      </p>

      <div className="space-y-3">
        {list.map((section, index) => {
          const open = openId === section.id;
          return (
            <article
              key={section.id}
              className={cn(
                "overflow-hidden rounded-2xl border bg-card",
                section.enabled ? "border-border" : "border-dashed border-border/70 opacity-80",
              )}
            >
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => setOpenId(open ? undefined : section.id)}
                >
                  <p className="text-sm font-semibold">
                    {SECTION_LABELS[section.type]}
                    {section.heading ? <span className="ml-2 font-normal text-muted-foreground">· {section.heading}</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{section.enabled ? "Visible on the homepage" : "Hidden"}</p>
                </button>
                <div className="flex items-center gap-1">
                  <Button type="button" size="icon" variant="ghost" onClick={() => move(index, -1)} aria-label="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => move(index, 1)} aria-label="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Switch checked={section.enabled} onCheckedChange={(enabled) => patch(section.id, { enabled })} />
                  <Button type="button" size="icon" variant="ghost" onClick={() => setList((current) => current.filter((row) => row.id !== section.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {open ? (
                <div className="grid gap-4 border-t border-border/70 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Kicker" value={section.kicker} onChange={(kicker) => patch(section.id, { kicker })} />
                    <Field label="Heading" value={section.heading} onChange={(heading) => patch(section.id, { heading })} />
                    <div className="md:col-span-2">
                      <Field
                        label="Subheading"
                        multiline
                        value={section.subheading}
                        onChange={(subheading) => patch(section.id, { subheading })}
                      />
                    </div>
                    {section.type === "cta" || section.type === "hero" ? (
                      <div className="md:col-span-2">
                        <Field label="Body" multiline value={section.body} onChange={(body) => patch(section.id, { body })} />
                      </div>
                    ) : null}
                  </div>

                  {section.type === "hero" || section.type === "cta" ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field
                        label="Primary button label"
                        value={section.primaryCta?.label}
                        onChange={(label) => patch(section.id, { primaryCta: { label, href: section.primaryCta?.href || "/contact" } })}
                      />
                      <Field
                        label="Primary button link"
                        value={section.primaryCta?.href}
                        onChange={(href) => patch(section.id, { primaryCta: { label: section.primaryCta?.label || "Start a project", href } })}
                      />
                      <Field
                        label="Secondary button label"
                        value={section.secondaryCta?.label}
                        onChange={(label) => patch(section.id, { secondaryCta: { label, href: section.secondaryCta?.href || "/services" } })}
                      />
                      <Field
                        label="Secondary button link"
                        value={section.secondaryCta?.href}
                        onChange={(href) => patch(section.id, { secondaryCta: { label: section.secondaryCta?.label || "See services", href } })}
                      />
                    </div>
                  ) : null}

                  {section.type === "hero" ? (
                    <Field label="Optional media URL" value={section.mediaUrl} onChange={(mediaUrl) => patch(section.id, { mediaUrl })} />
                  ) : null}

                  {section.type === "services" ? (
                    <FeaturedPicker label="Featured services" options={services} selected={section.featuredIds} onChange={(featuredIds) => patch(section.id, { featuredIds })} />
                  ) : null}
                  {section.type === "products" ? (
                    <FeaturedPicker label="Featured products" options={products} selected={section.featuredIds} onChange={(featuredIds) => patch(section.id, { featuredIds })} />
                  ) : null}
                  {section.type === "portfolio" ? (
                    <FeaturedPicker label="Featured projects" options={projects} selected={section.featuredIds} onChange={(featuredIds) => patch(section.id, { featuredIds })} />
                  ) : null}

                  {["logos", "why", "process", "stats"].includes(section.type) ? (
                    <ItemsEditor section={section} onChange={(items) => patch(section.id, { items })} />
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-border p-4">
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={addType}
          onChange={(e) => setAddType(e.target.value as HomepageSection["type"])}
        >
          {SECTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {SECTION_LABELS[type]}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => {
            const section = blankSection(addType, list.length + 1);
            setList((current) => [...current, section]);
            setOpenId(section.id);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add section
        </Button>
        <Button className="ml-auto rounded-full">Save homepage</Button>
      </div>
    </form>
  );
}
