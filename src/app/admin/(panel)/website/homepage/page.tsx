import { connectDb } from "@/lib/db";
import { Homepage, PortfolioProject, SaaSProduct, Service } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { HomepageEditor } from "@/components/admin/homepage-editor";
import { serialize } from "@/lib/format";
import type { HomepageSection } from "@/types";

function options(docs: Array<{ _id: unknown; name: string }>) {
  return docs.map((doc) => ({ id: String(doc._id), name: doc.name }));
}

export default async function HomepageAdminPage() {
  await requirePermission("content:write");
  await connectDb();
  const [homepage, services, products, projects] = await Promise.all([
    Homepage.findOne().lean(),
    Service.find({ status: "published" }).select("name").sort({ order: 1 }).lean(),
    SaaSProduct.find({ status: "published" }).select("name").sort({ order: 1 }).lean(),
    PortfolioProject.find({ status: "published" }).select("name").sort({ order: 1 }).lean(),
  ]);

  return (
    <div>
      <AdminHeader
        title="Homepage builder"
        description="Enable, disable, and reorder sections. Pick featured services, products, and projects without editing JSON."
      />
      <HomepageEditor
        sections={(serialize(homepage)?.sections as HomepageSection[]) || []}
        services={options(services)}
        products={options(products)}
        projects={options(projects)}
      />
    </div>
  );
}
