import { connectDb } from "@/lib/db";
import { Author, BlogCategory, BlogTag } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { saveSimpleAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function TaxonomiesPage() {
  await requirePermission("content:write");
  await connectDb();
  const [categories, tags, authors] = await Promise.all([
    BlogCategory.find().lean(),
    BlogTag.find().lean(),
    Author.find().lean(),
  ]);

  return (
    <div className="space-y-10">
      <AdminHeader title="Categories, tags, authors" />
      <SimpleCreate collection="blog-category" title="Category" items={categories as unknown as Array<Record<string, unknown>>} fields={["name", "slug"]} />
      <SimpleCreate collection="blog-tag" title="Tag" items={tags as unknown as Array<Record<string, unknown>>} fields={["name", "slug"]} />
      <SimpleCreate collection="author" title="Author" items={authors as unknown as Array<Record<string, unknown>>} fields={["name", "slug", "role"]} />
    </div>
  );
}

function SimpleCreate({
  collection,
  title,
  items,
  fields,
}: {
  collection: string;
  title: string;
  items: Array<Record<string, unknown>>;
  fields: string[];
}) {
  return (
    <section>
      <h2 className="font-display text-2xl">{title}</h2>
      <ul className="mt-3 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={String(item._id)}>{String(item.name)}</li>
        ))}
      </ul>
      <form action={saveSimpleAction} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="collection" value={collection} />
        <input type="hidden" name="redirectTo" value="/admin/blog/taxonomies" />
        {fields.map((field) => (
          <Input key={field} name={`field_${field}`} placeholder={field} className="w-40 rounded-none" />
        ))}
        <input
          type="hidden"
          name="payload"
          id={`${collection}-payload`}
        />
        <Button className="rounded-none">Add {title}</Button>
      </form>
    </section>
  );
}
