import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Lead } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";

function named(value: unknown) {
  if (value && typeof value === "object" && "name" in value) {
    return String((value as { name: string }).name);
  }
  return null;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  await requirePermission("leads:read");
  const { status, type } = await searchParams;
  await connectDb();
  const filter: Record<string, string> = {};
  if (status) filter.status = status;
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
        {["new", "contacted", "qualified", "proposal_sent", "won", "lost"].map((item) => (
          <Link key={item} href={`/admin/leads?status=${item}`} className="border border-hairline px-2 py-1">
            {item.replace("_", " ")}
          </Link>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
        {["contact", "service", "product", "custom_project"].map((item) => (
          <Link key={item} href={`/admin/leads?type=${item}`} className="border border-hairline px-2 py-1">
            {item.replace("_", " ")}
          </Link>
        ))}
      </div>
      <div className="divide-y divide-hairline border-y border-hairline">
        {leads.map((lead) => {
          const subject = named(lead.service) || named(lead.product);
          return (
            <Link key={String(lead._id)} href={`/admin/leads/${lead._id}`} className="grid gap-2 py-4 md:grid-cols-[140px_1fr_200px]">
              <span className="text-copper">{lead.status}</span>
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
          );
        })}
      </div>
    </div>
  );
}
