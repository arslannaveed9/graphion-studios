import Link from "next/link";
import { connectDb } from "@/lib/db";
import { PortfolioProject } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export default async function PortfolioAdminPage() {
  await requirePermission("content:read");
  await connectDb();
  const projects = await PortfolioProject.find().sort({ order: 1 }).lean();
  return (
    <div>
      <AdminHeader title="Portfolio" actionHref="/admin/portfolio/new" actionLabel="New project" />
      <div className="divide-y divide-hairline border-y border-hairline">
        {projects.map((project) => (
          <div key={String(project._id)} className="flex items-center justify-between py-4">
            <Link href={`/admin/portfolio/${project._id}`} className="font-display text-2xl">{project.name}</Link>
            <form action={deleteRecordAction}>
              <input type="hidden" name="collection" value="project" />
              <input type="hidden" name="id" value={String(project._id)} />
              <input type="hidden" name="redirectTo" value="/admin/portfolio" />
              <Button variant="ghost" className="text-destructive">Delete</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
