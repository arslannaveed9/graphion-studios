import { connectDb } from "@/lib/db";
import { FAQ, TeamMember, Technology, Testimonial } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction, saveSimpleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function FaqsPage() {
  await requirePermission("content:write");
  await connectDb();
  const items = await FAQ.find().sort({ order: 1 }).lean();
  return (
    <div>
      <AdminHeader title="FAQs" />
      {items.map((item) => (
        <div key={String(item._id)} className="flex items-start justify-between gap-4 border-b border-hairline py-4">
          <div>
            <p className="font-display text-xl">{item.question}</p>
            <p className="text-sm text-muted-foreground">{item.answer}</p>
          </div>
          <form action={deleteRecordAction}>
            <input type="hidden" name="collection" value="faq" />
            <input type="hidden" name="id" value={String(item._id)} />
            <input type="hidden" name="redirectTo" value="/admin/content/faqs" />
            <Button variant="ghost" className="text-destructive">Delete</Button>
          </form>
        </div>
      ))}
      <form action={saveSimpleAction} className="mt-8 space-y-3">
        <input type="hidden" name="collection" value="faq" />
        <input type="hidden" name="redirectTo" value="/admin/content/faqs" />
        <Input name="field_question" placeholder="Question" className="rounded-none" required />
        <Textarea name="field_answer" placeholder="Answer" className="rounded-none" required />
        <Button className="rounded-none">Add FAQ</Button>
      </form>
    </div>
  );
}
