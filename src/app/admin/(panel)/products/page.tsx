import Link from "next/link";
import { connectDb } from "@/lib/db";
import { SaaSProduct } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export default async function ProductsAdminPage() {
  await requirePermission("content:read");
  await connectDb();
  const products = await SaaSProduct.find().sort({ order: 1 }).lean();
  return (
    <div>
      <AdminHeader title="SaaS products" actionHref="/admin/products/new" actionLabel="New product" />
      <div className="divide-y divide-hairline border-y border-hairline">
        {products.map((product) => (
          <div key={String(product._id)} className="flex items-center justify-between py-4">
            <Link href={`/admin/products/${product._id}`} className="font-display text-2xl">
              {product.name}
            </Link>
            <form action={deleteRecordAction}>
              <input type="hidden" name="collection" value="product" />
              <input type="hidden" name="id" value={String(product._id)} />
              <input type="hidden" name="redirectTo" value="/admin/products" />
              <Button variant="ghost" className="text-destructive">Delete</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
