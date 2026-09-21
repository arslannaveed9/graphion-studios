import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Lead } from "@/models";
import { hasPermission, requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { LeadActions } from "@/components/admin/lead-actions";
import { cn } from "@/lib/utils";

function named(value: unknown) {
  if (value && typeof value === "object" && "name" in value) {
    return String((value as { name: string }).name);
  }
  return null;
}

const STATUS_FILTERS = ["new", "contacted", "qualified", "proposal_sent", "won", "lost", "spam"] as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const user = await requirePermission("leads:read");
  const canManage = hasPermission(user.role, "leads:manage");
  const { status, type } = await searchParams;
  await connectDb();
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  else filter.status = { $ne: "spam" };
  if (type) filter.inquiryType = type;
  const leads = await Lead.find(filter)
    .populate("service", "name slug")
    .populate("product", "name slug")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return (
    <div>
      <AdminHeader title="Leads" description="Contact, service, product, and custom project enquiries." />
      <div className="mb-4 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
        <Link
          href="/admin/leads"
          className={cn("border border-hairline px-2 py-1", !status ? "border-copper text-copper" : "")}
        >
          Inbox
        </Link>
        {STATUS_FILTERS.map((item) => (
          <Link
            key={item}
            href={`/admin/leads?status=${item}`}
            className={cn("border border-hairline px-2 py-1", status === item ? "border-copper text-copper" : "")}
          >
            {item.replace("_", " ")}
          </Link>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
        {["contact", "service", "product", "custom_project"].map((item) => (
          <Link
            key={item}
            href={`/admin/leads?type=${item}`}
            className={cn("border border-hairline px-2 py-1", type === item ? "border-copper text-copper" : "")}
          >
            {item.replace("_", " ")}
          </Link>
        ))}
      </div>
      <div className="divide-y divide-hairline border-y border-hairline">
        {leads.length ? (
          leads.map((lead) => {
            const subject = named(lead.service) || named(lead.product);
            const id = String(lead._id);
            return (
              <div key={id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <Link href={`/admin/leads/${id}`} className="grid min-w-0 flex-1 gap-2 md:grid-cols-[140px_1fr_200px]">
                  <span className={lead.status === "spam" ? "text-destructive" : "text-copper"}>{lead.status}</span>
                  <span>
                    {lead.name} · {lead.email}
                    <span className="block text-sm text-muted-foreground">{lead.message.slice(0, 140)}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {subject || "General contact"}
                    {lead.selectedPackage ? ` · ${lead.selectedPackage}` : ""}
                    <span className="block">{lead.inquiryType.replace("_", " ")}</span>
                  </span>
                </Link>
                {canManage ? <LeadActions id={id} status={lead.status} redirectTo="/admin/leads" /> : null}
              </div>
            );
          })
        ) : (
          <p className="py-8 text-sm text-muted-foreground">No leads in this view.</p>
        )}
      </div>
    </div>
  );
}
