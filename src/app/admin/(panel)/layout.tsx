import { AdminShell } from "@/components/admin/admin-shell";
import { requireSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();
  return <AdminShell user={user}>{children}</AdminShell>;
}
