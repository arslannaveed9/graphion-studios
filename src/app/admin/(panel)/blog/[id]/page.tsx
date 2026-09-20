import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { BlogPost } from "@/models";
import { AdminHeader } from "@/components/admin/admin-header";
import { PostForm, blogFormData } from "@/app/admin/(panel)/blog/page";
import { requirePermission } from "@/lib/auth";
import { serialize } from "@/lib/format";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:write");
  const { id } = await params;
  await connectDb();
  const post = await BlogPost.findById(id).lean();
  if (!post) notFound();
  const data = await blogFormData();
  return (
    <div>
      <AdminHeader title={post.title} />
      <PostForm post={serialize(post) as unknown as Record<string, unknown>} authors={data.authors} categories={data.categories} />
    </div>
  );
}
