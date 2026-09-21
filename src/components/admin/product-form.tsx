"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { JsonListField, PricingField, SeoFields, StringListField } from "@/components/admin/fields";
import { ImageField, ImageListField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { enablePreviewAction } from "@/actions/admin";

export function ProductForm({
  action,
  product,
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: Record<string, unknown>;
}) {
  return (
    <form action={action} className="space-y-6">
      {product?._id ? <input type="hidden" name="id" value={String(product._id)} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input name="name" required defaultValue={String(product?.name || "")} className="rounded-none" />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input name="slug" defaultValue={String(product?.slug || "")} className="rounded-none" />
        </div>
      </div>
      <Textarea name="shortDescription" required defaultValue={String(product?.shortDescription || "")} className="rounded-none" />
      <RichTextEditor name="fullDescription" value={String(product?.fullDescription || "")} />
      <ImageField name="heroImage" label="Hero image" defaultValue={String(product?.heroImage || "")} />
      <ImageField name="logo" label="Logo" defaultValue={String(product?.logo || "")} />
      <JsonListField name="features" label="Features" value={(product?.features as Array<Record<string, string>>) || []} keys={[{ key: "title", label: "Title" }, { key: "description", label: "Description" }]} />
      <JsonListField name="benefits" label="Benefits" value={(product?.benefits as Array<Record<string, string>>) || []} keys={[{ key: "title", label: "Title" }, { key: "description", label: "Description" }]} />
      <JsonListField name="useCases" label="Use cases" value={(product?.useCases as Array<Record<string, string>>) || []} keys={[{ key: "title", label: "Title" }, { key: "description", label: "Description" }]} />
      <JsonListField name="faqs" label="FAQs" value={(product?.faqs as Array<Record<string, string>>) || []} keys={[{ key: "question", label: "Question" }, { key: "answer", label: "Answer" }]} />
      <StringListField name="targetAudience" label="Target audience" value={product?.targetAudience as string[]} />
      <StringListField name="integrations" label="Integrations" value={product?.integrations as string[]} />
      <StringListField name="technologies" label="Technologies" value={product?.technologies as string[]} />
      <ImageListField name="screenshots" label="Screenshots" value={product?.screenshots as string[]} />
      <PricingField name="pricingPlans" value={(product?.pricingPlans as Array<Record<string, unknown>>) || []} />
      <Input name="ctaLabel" defaultValue={String(product?.ctaLabel || "")} placeholder="CTA label" className="rounded-none" />
      <Input name="ctaHref" defaultValue={String(product?.ctaHref || "")} placeholder="CTA href" className="rounded-none" />
      <Input name="demoUrl" defaultValue={String(product?.demoUrl || "")} placeholder="Demo URL" className="rounded-none" />
      <Input name="websiteUrl" defaultValue={String(product?.websiteUrl || "")} placeholder="Website URL" className="rounded-none" />
      <Input name="documentationUrl" defaultValue={String(product?.documentationUrl || "")} placeholder="Docs URL" className="rounded-none" />
      <div className="flex gap-4">
        <select name="status" defaultValue={String(product?.status || "draft")} className="h-9 border border-input bg-background px-2 text-sm">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={Boolean(product?.featured)} /> Featured
        </label>
      </div>
      <SeoFields seo={product?.seo as Record<string, unknown>} />
      <div className="flex gap-3">
        <Button className="rounded-none">Save</Button>
        {product?.slug ? (
          <Button formAction={enablePreviewAction} name="path" value={`/products/${product.slug}`} variant="outline" className="rounded-none">
            Preview
          </Button>
        ) : null}
      </div>
    </form>
  );
}
