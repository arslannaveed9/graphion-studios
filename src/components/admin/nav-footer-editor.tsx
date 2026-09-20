"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { saveFooterAction, saveNavigationAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { FooterColumn, NavItem } from "@/types";

function blankNav(order: number, parent = false): NavItem {
  return {
    id: nanoid(),
    label: parent ? "Dropdown item" : "New page",
    href: "/",
    isEnabled: true,
    order,
    children: [],
  };
}

function blankColumn(order: number): FooterColumn {
  return { id: nanoid(), title: "New column", order, links: [{ label: "Link", href: "/" }] };
}

function NavRows({
  items,
  onChange,
  nested,
}: {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  nested?: boolean;
}) {
  function patch(index: number, next: Partial<NavItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...next } : item)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, order) => ({ ...item, order: order + 1 })));
  }

  return (
    <div className={nested ? "ml-4 space-y-3 border-l border-border pl-4" : "space-y-3"}>
      {items.map((item, index) => (
        <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input className="rounded-xl" value={item.label} onChange={(e) => patch(index, { label: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Link</Label>
              <Input className="rounded-xl" value={item.href} onChange={(e) => patch(index, { href: e.target.value })} />
            </div>
            <div className="flex items-end gap-1">
              <label className="mr-2 flex items-center gap-2 pb-2 text-sm">
                <Switch checked={item.isEnabled !== false} onCheckedChange={(isEnabled) => patch(index, { isEnabled })} />
                Show
              </label>
              <Button type="button" size="icon" variant="ghost" onClick={() => move(index, -1)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => move(index, 1)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => onChange(items.filter((_, i) => i !== index))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!nested ? (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-muted-foreground">Dropdown links</p>
              <NavRows
                nested
                items={item.children || []}
                onChange={(children) => patch(index, { children })}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => patch(index, { children: [...(item.children || []), blankNav((item.children || []).length + 1, true)] })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add dropdown item
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function NavigationEditor({ items }: { items: NavItem[] }) {
  const [list, setList] = useState(items || []);

  return (
    <form action={saveNavigationAction} className="space-y-5">
      <input type="hidden" name="items" value={JSON.stringify(list)} />
      <p className="text-sm text-muted-foreground">
        Add pages, nest dropdowns, and hide items without deleting them.
      </p>
      <NavRows items={list} onChange={setList} />
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" className="rounded-full" onClick={() => setList((current) => [...current, blankNav(current.length + 1)])}>
          <Plus className="mr-1 h-4 w-4" />
          Add page
        </Button>
        <Button className="rounded-full">Save navigation</Button>
      </div>
    </form>
  );
}

export function FooterEditor({
  columns,
  newsletterHeading,
  newsletterBody,
  copyright,
  newsletterEnabled,
}: {
  columns: FooterColumn[];
  newsletterHeading?: string;
  newsletterBody?: string;
  copyright?: string;
  newsletterEnabled?: boolean;
}) {
  const [list, setList] = useState(columns || []);
  const [enabled, setEnabled] = useState(Boolean(newsletterEnabled));

  function patchColumn(index: number, next: Partial<FooterColumn>) {
    setList((current) => current.map((column, i) => (i === index ? { ...column, ...next } : column)));
  }

  return (
    <form action={saveFooterAction} className="space-y-6">
      <input type="hidden" name="columns" value={JSON.stringify(list)} />
      <p className="text-sm text-muted-foreground">Manage footer columns, links, and the newsletter block.</p>

      <div className="space-y-4">
        {list.map((column, index) => (
          <article key={column.id} className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Column title</Label>
                <Input className="rounded-xl" value={column.title} onChange={(e) => patchColumn(index, { title: e.target.value })} />
              </div>
              <Button type="button" variant="ghost" className="mt-5" onClick={() => setList((current) => current.filter((_, i) => i !== index))}>
                Remove column
              </Button>
            </div>
            <div className="space-y-3">
              {(column.links || []).map((link, linkIndex) => (
                <div key={`${column.id}-${linkIndex}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <Input
                    className="rounded-xl"
                    placeholder="Label"
                    value={link.label}
                    onChange={(e) =>
                      patchColumn(index, {
                        links: column.links.map((row, i) => (i === linkIndex ? { ...row, label: e.target.value } : row)),
                      })
                    }
                  />
                  <Input
                    className="rounded-xl"
                    placeholder="/path or URL"
                    value={link.href}
                    onChange={(e) =>
                      patchColumn(index, {
                        links: column.links.map((row, i) => (i === linkIndex ? { ...row, href: e.target.value } : row)),
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => patchColumn(index, { links: column.links.filter((_, i) => i !== linkIndex) })}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => patchColumn(index, { links: [...column.links, { label: "New link", href: "/" }] })}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add link
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Button type="button" variant="outline" className="rounded-full" onClick={() => setList((current) => [...current, blankColumn(current.length + 1)])}>
        <Plus className="mr-1 h-4 w-4" />
        Add column
      </Button>

      <div className="grid max-w-2xl gap-4 rounded-2xl border border-border bg-card p-4">
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          Show newsletter
        </label>
        <input type="hidden" name="newsletterEnabled" value={enabled ? "on" : ""} />
        <div className="space-y-1.5">
          <Label>Newsletter heading</Label>
          <Input name="newsletterHeading" defaultValue={newsletterHeading} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label>Newsletter body</Label>
          <Input name="newsletterBody" defaultValue={newsletterBody} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label>Copyright</Label>
          <Input name="copyright" defaultValue={copyright} className="rounded-xl" />
        </div>
      </div>

      <Button className="rounded-full">Save footer</Button>
    </form>
  );
}
