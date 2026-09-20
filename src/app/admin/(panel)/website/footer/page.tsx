import { connectDb } from "@/lib/db";
import { Footer } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { FooterEditor } from "@/components/admin/nav-footer-editor";
import { serialize } from "@/lib/format";
import type { FooterColumn } from "@/types";

export default async function FooterAdminPage() {
  await requirePermission("settings:manage");
  await connectDb();
  const footer = serialize(await Footer.findOne().lean());
  const columns: FooterColumn[] = (footer?.columns || []).map((column) => ({
    id: String(column.id || ""),
    title: String(column.title || ""),
    links: (column.links || []).map((link) => ({
      label: String(link.label || ""),
      href: String(link.href || ""),
      isExternal: Boolean(link.isExternal),
    })),
    order: Number(column.order || 0),
  }));
  return (
    <div>
      <AdminHeader title="Footer" description="Edit columns, links, and the newsletter block." />
      <FooterEditor
        columns={columns}
        newsletterHeading={footer?.newsletterHeading}
        newsletterBody={footer?.newsletterBody}
        copyright={footer?.copyright}
        newsletterEnabled={footer?.newsletterEnabled}
      />
    </div>
  );
}
