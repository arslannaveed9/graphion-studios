import Link from "next/link";
import { connectDb } from "@/lib/db";
import { BlogPost, Lead, PortfolioProject, SaaSProduct, Service } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminDashboard() {
  await requirePermission("dashboard:read");
  await connectDb();
  const [services, products, posts, projects, leads, newLeads, drafts] = await Promise.all([
    Service.countDocuments(),
    SaaSProduct.countDocuments(),
    BlogPost.countDocuments(),
    PortfolioProject.countDocuments(),
    Lead.countDocuments({ status: { $ne: "spam" } }),
    Lead.countDocuments({ status: "new" }),
    Promise.all([
      Service.countDocuments({ status: "draft" }),
      SaaSProduct.countDocuments({ status: "draft" }),
      BlogPost.countDocuments({ status: "draft" }),
    ]).then((n) => n.reduce((a, b) => a + b, 0)),
  ]);
  const recentLeads = await Lead.find({ status: { $ne: "spam" } })
    .populate("service", "name")
    .populate("product", "name")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  const recentPosts = await BlogPost.find().sort({ updatedAt: -1 }).limit(5).lean();

  const stats = [
    { label: "Inquiries", value: leads },
    { label: "New", value: newLeads },
    { label: "Services", value: services },
    { label: "Products", value: products },
    { label: "Journal", value: posts },
    { label: "Work", value: projects },
    { label: "Drafts", value: drafts },
  ];

  return (
    <div>
      <AdminHeader title="Dashboard" description="A snapshot of the studio platform." />
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-hairline p-5">
            <p className="font-display text-4xl">{stat.value}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">Recent inquiries</h2>
          <div className="mt-4 divide-y divide-hairline">
            {recentLeads.map((lead) => (
              <Link key={String(lead._id)} href={`/admin/leads/${lead._id}`} className="block py-3 text-sm">
                <span className="text-copper">{lead.status}</span> · {lead.name} ·{" "}
                {(lead.service && typeof lead.service === "object" && "name" in lead.service
                  ? String(lead.service.name)
                  : null) ||
                  (lead.product && typeof lead.product === "object" && "name" in lead.product
                    ? String(lead.product.name)
                    : lead.inquiryType)}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl">Recent journal</h2>
          <div className="mt-4 divide-y divide-hairline">
            {recentPosts.map((post) => (
              <Link key={String(post._id)} href={`/admin/blog/${post._id}`} className="block py-3 text-sm">
                {post.title} · {post.status}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
