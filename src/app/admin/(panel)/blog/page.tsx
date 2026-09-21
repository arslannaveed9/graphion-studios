import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Author, BlogCategory, BlogPost, BlogTag } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction, savePostAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SeoFields } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { serialize } from "@/lib/format";

export function PostForm({
  post,
  authors,
  categories,
}: {
  post?: Record<string, unknown>;
  authors: Array<{ _id: string; name: string }>;
  categories: Array<{ _id: string; name: string }>;
}) {
  return (
    <form action={savePostAction} className="space-y-4">
      {post?._id ? <input type="hidden" name="id" value={String(post._id)} /> : null}
      <Input name="title" required defaultValue={String(post?.title || "")} placeholder="Title" className="rounded-none" />
      <Input name="slug" defaultValue={String(post?.slug || "")} placeholder="Slug" className="rounded-none" />
      <Textarea name="excerpt" defaultValue={String(post?.excerpt || "")} placeholder="Excerpt" className="rounded-none" />
      <RichTextEditor name="content" value={String(post?.content || "")} />
      <ImageField name="featuredImage" label="Featured image" defaultValue={String(post?.featuredImage || "")} />
      <select name="author" defaultValue={String(post?.author || "")} className="h-9 border border-input bg-background px-2 text-sm">
        <option value="">Author</option>
        {authors.map((author) => (
          <option key={author._id} value={author._id}>{author.name}</option>
        ))}
      </select>
      <select name="category" defaultValue={String(post?.category || "")} className="h-9 border border-input bg-background px-2 text-sm">
        <option value="">Category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>{category.name}</option>
        ))}
      </select>
      <Input name="scheduledAt" type="datetime-local" className="rounded-none" />
      <select name="status" defaultValue={String(post?.status || "draft")} className="h-9 border border-input bg-background px-2 text-sm">
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <SeoFields seo={post?.seo as Record<string, unknown>} />
      <Button className="rounded-none">Save</Button>
    </form>
  );
}

export default async function BlogAdminPage() {
  await requirePermission("content:read");
  await connectDb();
  const posts = await BlogPost.find().sort({ updatedAt: -1 }).lean();
  return (
    <div>
      <AdminHeader title="Journal" actionHref="/admin/blog/new" actionLabel="New post" />
      <div className="divide-y divide-hairline border-y border-hairline">
        {posts.map((post) => (
          <div key={String(post._id)} className="flex items-center justify-between py-4">
            <Link href={`/admin/blog/${post._id}`} className="font-display text-xl">{post.title}</Link>
            <form action={deleteRecordAction}>
              <input type="hidden" name="collection" value="post" />
              <input type="hidden" name="id" value={String(post._id)} />
              <input type="hidden" name="redirectTo" value="/admin/blog" />
              <Button variant="ghost" className="text-destructive">Delete</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function blogFormData() {
  await connectDb();
  const [authors, categories] = await Promise.all([Author.find().lean(), BlogCategory.find().lean()]);
  return {
    authors: serialize(authors).map((a: { _id: unknown; name: string }) => ({ _id: String(a._id), name: a.name })),
    categories: serialize(categories).map((a: { _id: unknown; name: string }) => ({ _id: String(a._id), name: a.name })),
  };
}
