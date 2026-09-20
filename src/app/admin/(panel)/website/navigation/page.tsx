import { connectDb } from "@/lib/db";
import { Navigation } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { NavigationEditor } from "@/components/admin/nav-footer-editor";
import { serialize } from "@/lib/format";
import type { NavItem } from "@/types";

export default async function NavigationAdminPage() {
  await requirePermission("settings:manage");
  await connectDb();
  const nav = serialize(await Navigation.findOne({ location: "header" }).lean());
  return (
    <div>
      <AdminHeader title="Navigation" description="Add pages, dropdowns, and hide items without deleting them." />
      <NavigationEditor items={(nav?.items as NavItem[]) || []} />
    </div>
  );
}
