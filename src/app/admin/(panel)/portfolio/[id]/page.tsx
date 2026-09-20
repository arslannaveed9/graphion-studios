import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { PortfolioProject } from "@/models";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProjectForm } from "@/components/admin/project-form";
import { requirePermission } from "@/lib/auth";
import { serialize } from "@/lib/format";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:write");
  const { id } = await params;
  await connectDb();
  const project = await PortfolioProject.findById(id).lean();
  if (!project) notFound();
  return (
    <div>
      <AdminHeader title={project.name} />
      <ProjectForm project={serialize(project) as unknown as Record<string, unknown>} />
    </div>
  );
}
