import { connectDb } from "@/lib/db";
import { Testimonial } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction, saveSimpleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/admin/image-field";

export default async function TestimonialsPage() {
  await requirePermission("content:write");
  await connectDb();
  const items = await Testimonial.find().sort({ order: 1 }).lean();
  return (
    <div>
      <AdminHeader title="Testimonials" />
      {items.map((item) => (
        <div key={String(item._id)} className="border-b border-hairline py-4">
          <p className="font-display text-xl">“{item.quote}”</p>
          <p className="text-sm text-muted-foreground">{item.authorName}, {item.company}</p>
          <form action={deleteRecordAction} className="mt-2">
            <input type="hidden" name="collection" value="testimonial" />
            <input type="hidden" name="id" value={String(item._id)} />
            <input type="hidden" name="redirectTo" value="/admin/content/testimonials" />
            <Button variant="ghost" className="text-destructive">Delete</Button>
          </form>
        </div>
      ))}
      <form action={saveSimpleAction} className="mt-8 space-y-3">
        <input type="hidden" name="collection" value="testimonial" />
        <input type="hidden" name="redirectTo" value="/admin/content/testimonials" />
        <Textarea name="field_quote" placeholder="Quote" className="rounded-none" required />
        <Input name="field_authorName" placeholder="Name" className="rounded-none" required />
        <Input name="field_authorTitle" placeholder="Title" className="rounded-none" />
        <Input name="field_company" placeholder="Company" className="rounded-none" />
        <ImageField name="field_avatar" label="Photo" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="field_featured" value="true" /> Featured</label>
        <input type="hidden" name="payload" value='{"isActive":true,"featured":false}' />
        <Button className="rounded-none">Add</Button>
      </form>
    </div>
  );
}
