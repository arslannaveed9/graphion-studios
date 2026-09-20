"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { JsonListField, PricingField, SeoFields, StringListField } from "@/components/admin/fields";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { enablePreviewAction } from "@/actions/admin";
import type { ServiceDoc } from "@/models/service";

export function ServiceForm({
  action,
  service,
}: {
  action: (formData: FormData) => void | Promise<void>;
  service?: Partial<ServiceDoc> & { _id?: string };
}) {
  return (
    <form action={action} className="space-y-6">
      {service?._id ? <input type="hidden" name="id" value={String(service._id)} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input name="name" required defaultValue={service?.name} className="rounded-none" />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input name="slug" defaultValue={service?.slug} className="rounded-none" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Short description</Label>
        <Textarea name="shortDescription" required defaultValue={service?.shortDescription} className="rounded-none" />
      </div>
      <div className="space-y-2">
        <Label>Full description</Label>
        <RichTextEditor name="fullDescription" value={service?.fullDescription} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Problem</Label>
          <Textarea name="problem" defaultValue={service?.problem} className="rounded-none" />
        </div>
        <div className="space-y-2">
          <Label>Solution</Label>
          <Textarea name="solution" defaultValue={service?.solution} className="rounded-none" />
        </div>
        <div className="space-y-2">
          <Label>Icon (Lucide name)</Label>
          <Input name="icon" defaultValue={service?.icon} className="rounded-none" />
        </div>
        <div className="space-y-2">
          <Label>Hero image URL</Label>
          <Input name="heroImage" defaultValue={service?.heroImage} className="rounded-none" />
        </div>
      </div>
      <JsonListField name="features" label="Features" value={service?.features || []} keys={[{ key: "title", label: "Title" }, { key: "description", label: "Description", textarea: true }]} />
      <JsonListField name="benefits" label="Benefits" value={service?.benefits || []} keys={[{ key: "title", label: "Title" }, { key: "description", label: "Description", textarea: true }]} />
      <JsonListField name="process" label="Process" value={service?.process || []} keys={[{ key: "title", label: "Title" }, { key: "description", label: "Description", textarea: true }]} />
      <JsonListField name="faqs" label="FAQs" value={service?.faqs || []} keys={[{ key: "question", label: "Question" }, { key: "answer", label: "Answer", textarea: true }]} />
      <StringListField name="technologies" label="Technologies" value={service?.technologies} />
      <StringListField name="gallery" label="Gallery image URLs" value={service?.gallery} />
      <PricingField name="pricingPlans" value={(service?.pricingPlans || []) as Array<Record<string, unknown>>} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="enableCustomProject" defaultChecked={service?.enableCustomProject !== false} />
        Enable custom project
      </label>
      <Input name="customProjectHeading" defaultValue={service?.customProjectHeading} placeholder="Custom project heading" className="rounded-none" />
      <Textarea name="customProjectBody" defaultValue={service?.customProjectBody} placeholder="Custom project body" className="rounded-none" />
      <div className="grid gap-4 md:grid-cols-3">
        <select name="status" defaultValue={service?.status || "draft"} className="h-9 border border-input bg-background px-2 text-sm">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={service?.featured} /> Featured
        </label>
        <Input name="order" type="number" defaultValue={service?.order || 0} className="rounded-none" />
      </div>
      <SeoFields seo={service?.seo as Record<string, unknown>} />
      <div className="flex gap-3">
        <Button type="submit" className="rounded-none">Save</Button>
        {service?.slug ? (
          <Button formAction={enablePreviewAction} name="path" value={`/services/${service.slug}`} variant="outline" className="rounded-none">
            Preview
          </Button>
        ) : null}
      </div>
    </form>
  );
}
