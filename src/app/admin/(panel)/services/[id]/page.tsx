import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Service } from "@/models";
import { saveServiceAction } from "@/actions/admin";
import { ServiceForm } from "@/components/admin/service-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { requirePermission } from "@/lib/auth";
import { serialize } from "@/lib/format";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:write");
  const { id } = await params;
  await connectDb();
  const service = await Service.findById(id).lean();
  if (!service) notFound();
  return (
    <div>
      <AdminHeader title={service.name} description="Edit and publish this capability." />
      <ServiceForm action={saveServiceAction} service={serialize(service) as never} />
    </div>
  );
}
