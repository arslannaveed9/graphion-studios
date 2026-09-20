import { AdminHeader } from "@/components/admin/admin-header";
import { PostForm, blogFormData } from "@/app/admin/(panel)/blog/page";
import { requirePermission } from "@/lib/auth";

export default async function NewPostPage() {
  await requirePermission("content:write");
  const data = await blogFormData();
  return (
    <div>
      <AdminHeader title="New post" />
      <PostForm authors={data.authors} categories={data.categories} />
    </div>
  );
}
