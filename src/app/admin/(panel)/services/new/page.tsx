import { saveServiceAction } from "@/actions/admin";
import { ServiceForm } from "@/components/admin/service-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { requirePermission } from "@/lib/auth";

export default async function NewServicePage() {
  await requirePermission("content:write");
  return (
    <div>
      <AdminHeader title="New service" />
      <ServiceForm action={saveServiceAction} />
    </div>
  );
}
