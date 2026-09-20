import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Service } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export default async function ServicesAdminPage() {
  await requirePermission("content:read");
  await connectDb();
  const services = await Service.find().sort({ order: 1 }).lean();
  return (
    <div>
      <AdminHeader title="Services" actionHref="/admin/services/new" actionLabel="New service" />
      <div className="divide-y divide-hairline border-y border-hairline">
        {services.map((service) => (
          <div key={String(service._id)} className="flex items-center justify-between gap-4 py-4">
            <div>
              <Link href={`/admin/services/${service._id}`} className="font-display text-2xl">
                {service.name}
              </Link>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {service.status} · /{service.slug}
              </p>
            </div>
            <form action={deleteRecordAction}>
              <input type="hidden" name="collection" value="service" />
              <input type="hidden" name="id" value={String(service._id)} />
              <input type="hidden" name="redirectTo" value="/admin/services" />
              <Button variant="ghost" className="rounded-none text-destructive">
                Delete
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
