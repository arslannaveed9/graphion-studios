import { connectDb } from "@/lib/db";
import { Media } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction, uploadMediaAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePermission("media:manage");
  const { q } = await searchParams;
  await connectDb();
  const filter = q
    ? { $or: [{ alt: { $regex: q, $options: "i" } }, { url: { $regex: q, $options: "i" } }] }
    : {};
  const items = await Media.find(filter).sort({ createdAt: -1 }).limit(60).lean();

  return (
    <div>
      <AdminHeader title="Media library" />
      <form action={uploadMediaAction} className="mb-8 flex flex-wrap gap-2">
        <Input type="file" name="file" required className="max-w-xs rounded-none" />
        <Input name="alt" placeholder="Alt text" className="max-w-xs rounded-none" />
        <Button className="rounded-none">Upload</Button>
      </form>
      <form className="mb-6">
        <Input name="q" defaultValue={q} placeholder="Search" className="max-w-sm rounded-none" />
      </form>
      <div className="grid gap-4 md:grid-cols-4">
        {items.map((item) => (
          <figure key={String(item._id)} className="border border-hairline p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt || ""} className="aspect-square w-full object-cover" />
            <figcaption className="mt-2 truncate font-mono text-[10px]">{item.url}</figcaption>
            <form action={deleteRecordAction}>
              <input type="hidden" name="collection" value="media" />
              <input type="hidden" name="id" value={String(item._id)} />
              <input type="hidden" name="redirectTo" value="/admin/media" />
              <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
            </form>
          </figure>
        ))}
      </div>
    </div>
  );
}
