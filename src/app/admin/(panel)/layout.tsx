import { AdminShell } from "@/components/admin/admin-shell";
import { requireSession } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { safe } from "@/lib/safe";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([requireSession(), safe(getSettings, null)]);
  return (
    <AdminShell user={user} logoSrc={settings?.logo} companyName={settings?.companyName}>
      {children}
    </AdminShell>
  );
}
