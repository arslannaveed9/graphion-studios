import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { SaaSProduct } from "@/models";
import { saveProductAction } from "@/actions/admin";
import { ProductForm } from "@/components/admin/product-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { requirePermission } from "@/lib/auth";
import { serialize } from "@/lib/format";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:write");
  const { id } = await params;
  await connectDb();
  const product = await SaaSProduct.findById(id).lean();
  if (!product) notFound();
  return (
    <div>
      <AdminHeader title={product.name} />
      <ProductForm action={saveProductAction} product={serialize(product) as unknown as Record<string, unknown>} />
    </div>
  );
}
