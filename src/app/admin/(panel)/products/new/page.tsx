import { saveProductAction } from "@/actions/admin";
import { ProductForm } from "@/components/admin/product-form";
import { AdminHeader } from "@/components/admin/admin-header";
import { requirePermission } from "@/lib/auth";

export default async function NewProductPage() {
  await requirePermission("content:write");
  return (
    <div>
      <AdminHeader title="New product" />
      <ProductForm action={saveProductAction} />
    </div>
  );
}
