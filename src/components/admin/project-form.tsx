import { saveProjectAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SeoFields, StringListField, JsonListField } from "@/components/admin/fields";
import { ImageField, ImageListField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export function ProjectForm({ project }: { project?: Record<string, unknown> }) {
  return (
    <form action={saveProjectAction} className="space-y-4">
      {project?._id ? <input type="hidden" name="id" value={String(project._id)} /> : null}
      <Input name="name" required defaultValue={String(project?.name || "")} placeholder="Name" className="rounded-none" />
      <Input name="slug" defaultValue={String(project?.slug || "")} placeholder="Slug" className="rounded-none" />
      <Input name="client" defaultValue={String(project?.client || "")} placeholder="Client" className="rounded-none" />
      <Input name="industry" defaultValue={String(project?.industry || "")} placeholder="Industry" className="rounded-none" />
      <Textarea name="summary" defaultValue={String(project?.summary || "")} placeholder="Summary" className="rounded-none" />
      <RichTextEditor name="description" value={String(project?.description || "")} />
      <Textarea name="challenges" defaultValue={String(project?.challenges || "")} placeholder="Challenges" className="rounded-none" />
      <Textarea name="solution" defaultValue={String(project?.solution || "")} placeholder="Solution" className="rounded-none" />
      <ImageField name="heroImage" label="Hero image" defaultValue={String(project?.heroImage || "")} />
      <StringListField name="technologies" label="Technologies" value={project?.technologies as string[]} />
      <ImageListField name="images" label="Images" value={project?.images as string[]} />
      <JsonListField name="results" label="Results" value={(project?.results as Array<Record<string, string>>) || []} keys={[{ key: "label", label: "Label" }, { key: "value", label: "Value" }]} />
      <Input name="testimonialQuote" defaultValue={String(project?.testimonialQuote || "")} placeholder="Testimonial" className="rounded-none" />
      <Input name="testimonialAuthor" defaultValue={String(project?.testimonialAuthor || "")} placeholder="Testimonial author" className="rounded-none" />
      <Input name="projectUrl" defaultValue={String(project?.projectUrl || "")} placeholder="Live URL" className="rounded-none" />
      <select name="status" defaultValue={String(project?.status || "draft")} className="h-9 border border-input bg-background px-2 text-sm">
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={Boolean(project?.featured)} /> Featured</label>
      <SeoFields seo={project?.seo as Record<string, unknown>} />
      <Button className="rounded-none">Save</Button>
    </form>
  );
}
