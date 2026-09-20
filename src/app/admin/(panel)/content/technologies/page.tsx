import { connectDb } from "@/lib/db";
import { Technology } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction, saveSimpleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function TechnologiesPage() {
  await requirePermission("content:write");
  await connectDb();
  const items = await Technology.find().sort({ order: 1 }).lean();
  return (
    <div>
      <AdminHeader title="Technologies" />
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <form key={String(item._id)} action={deleteRecordAction} className="border border-hairline px-3 py-2">
            <span className="mr-3 font-mono text-xs uppercase">{item.name}</span>
            <input type="hidden" name="collection" value="technology" />
            <input type="hidden" name="id" value={String(item._id)} />
            <input type="hidden" name="redirectTo" value="/admin/content/technologies" />
            <button className="text-xs text-destructive">×</button>
          </form>
        ))}
      </div>
      <form action={saveSimpleAction} className="mt-8 flex gap-2">
        <input type="hidden" name="collection" value="technology" />
        <input type="hidden" name="redirectTo" value="/admin/content/technologies" />
        <Input name="field_name" placeholder="Name" className="rounded-none" required />
        <Input name="field_slug" placeholder="slug" className="rounded-none" />
        <input type="hidden" name="payload" value='{"isActive":true}' />
        <Button className="rounded-none">Add</Button>
      </form>
    </div>
  );
}
