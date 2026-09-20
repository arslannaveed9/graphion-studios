import { connectDb } from "@/lib/db";
import { Page } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { saveSimpleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export default async function LegalAdminPage() {
  await requirePermission("content:write");
  await connectDb();
  const pages = await Page.find({ kind: "legal" }).lean();
  return (
    <div className="space-y-12">
      <AdminHeader title="Legal pages" />
      {pages.map((page) => (
        <form key={String(page._id)} action={saveSimpleAction} className="space-y-3 border-t border-hairline pt-6">
          <input type="hidden" name="collection" value="page" />
          <input type="hidden" name="id" value={String(page._id)} />
          <input type="hidden" name="redirectTo" value="/admin/legal" />
          <h2 className="font-display text-2xl">{page.title}</h2>
          <Input name="field_title" defaultValue={page.title} className="rounded-none" />
          <Input name="field_slug" defaultValue={page.slug} className="rounded-none" />
          <RichTextEditor name="field_content" value={page.content} />
          <input type="hidden" name="payload" value={JSON.stringify({ kind: "legal", status: "published" })} />
          <Button className="rounded-none">Save {page.title}</Button>
        </form>
      ))}
    </div>
  );
}
