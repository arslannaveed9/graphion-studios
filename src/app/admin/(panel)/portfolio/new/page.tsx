import { AdminHeader } from "@/components/admin/admin-header";
import { ProjectForm } from "@/components/admin/project-form";
import { requirePermission } from "@/lib/auth";

export default async function NewProjectPage() {
  await requirePermission("content:write");
  return (
    <div>
      <AdminHeader title="New project" />
      <ProjectForm />
    </div>
  );
}
