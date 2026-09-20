import { connectDb } from "@/lib/db";
import { TeamMember } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction, saveSimpleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function TeamPage() {
  await requirePermission("content:write");
  await connectDb();
  const items = await TeamMember.find().sort({ order: 1 }).lean();
  return (
    <div>
      <AdminHeader title="Team" />
      {items.map((item) => (
        <div key={String(item._id)} className="flex justify-between border-b border-hairline py-4">
          <div>
            <p className="font-display text-xl">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.position}</p>
          </div>
          <form action={deleteRecordAction}>
            <input type="hidden" name="collection" value="team" />
            <input type="hidden" name="id" value={String(item._id)} />
            <input type="hidden" name="redirectTo" value="/admin/content/team" />
            <Button variant="ghost" className="text-destructive">Delete</Button>
          </form>
        </div>
      ))}
      <form action={saveSimpleAction} className="mt-8 space-y-3">
        <input type="hidden" name="collection" value="team" />
        <input type="hidden" name="redirectTo" value="/admin/content/team" />
        <Input name="field_name" placeholder="Name" className="rounded-none" required />
        <Input name="field_position" placeholder="Position" className="rounded-none" required />
        <Input name="field_image" placeholder="Image URL" className="rounded-none" />
        <Textarea name="field_bio" placeholder="Bio" className="rounded-none" />
        <input type="hidden" name="payload" value='{"isActive":true,"skills":[],"socialLinks":[]}' />
        <Button className="rounded-none">Add member</Button>
      </form>
    </div>
  );
}
