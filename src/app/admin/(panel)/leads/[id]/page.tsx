import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Lead } from "@/models";
import { requirePermission } from "@/lib/auth";
import { updateLeadAction } from "@/actions/admin";
import { AdminHeader } from "@/components/admin/admin-header";
import { LeadActions } from "@/components/admin/lead-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { leadStatuses } from "@/config/site";

function named(value: unknown) {
  if (value && typeof value === "object" && "name" in value) {
    return String((value as { name: string }).name);
  }
  return null;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("leads:manage");
  const { id } = await params;
  await connectDb();
  const lead = await Lead.findById(id).populate("service", "name slug").populate("product", "name slug").lean();
  if (!lead) notFound();

  const serviceName = named(lead.service);
  const productName = named(lead.product);

  return (
    <div>
      <AdminHeader title={lead.name} description={lead.email} />
      <dl className="grid gap-4 text-sm md:grid-cols-2">
        <div><dt className="kicker">Type</dt><dd>{lead.inquiryType.replace("_", " ")}</dd></div>
        <div><dt className="kicker">Status</dt><dd>{lead.status}</dd></div>
        <div><dt className="kicker">Service</dt><dd>{serviceName || "—"}</dd></div>
        <div><dt className="kicker">Product</dt><dd>{productName || "—"}</dd></div>
        <div><dt className="kicker">Package</dt><dd>{lead.selectedPackage || "—"}</dd></div>
        <div><dt className="kicker">Source</dt><dd>{lead.source || "—"}</dd></div>
        <div><dt className="kicker">Phone</dt><dd>{lead.phone || "—"}</dd></div>
        <div><dt className="kicker">Company</dt><dd>{lead.company || "—"}</dd></div>
        <div><dt className="kicker">Budget</dt><dd>{lead.budget || "—"}</dd></div>
        <div><dt className="kicker">Timeline</dt><dd>{lead.timeline || "—"}</dd></div>
        <div className="md:col-span-2"><dt className="kicker">Message</dt><dd className="mt-2">{lead.message}</dd></div>
        {lead.additionalInfo ? (
          <div className="md:col-span-2"><dt className="kicker">Additional info</dt><dd className="mt-2">{lead.additionalInfo}</dd></div>
        ) : null}
      </dl>
      <form action={updateLeadAction} className="mt-8 space-y-3">
        <input type="hidden" name="id" value={id} />
        <select name="status" defaultValue={lead.status} className="h-9 border border-input bg-background px-2 text-sm">
          {leadStatuses.map((status) => (
            <option key={status} value={status}>{status.replace("_", " ")}</option>
          ))}
        </select>
        <Textarea name="note" placeholder="Internal note" className="rounded-none" />
        <Button className="rounded-none">Update lead</Button>
      </form>
      <div className="mt-6">
        <LeadActions id={id} status={lead.status} redirectTo="/admin/leads" />
      </div>
      <div className="mt-8 space-y-3">
        {lead.notes?.map((note, i) => (
          <div key={i} className="border-t border-hairline pt-3 text-sm">
            <p>{note.body}</p>
            <p className="text-xs text-muted-foreground">{note.authorName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
