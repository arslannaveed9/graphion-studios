import { connectDb } from "@/lib/db";
import { Media } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { deleteRecordAction } from "@/actions/admin";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

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
      <AdminHeader title="Media library" description="Images are saved on this server and used across services, products, journal, and the site." />
      <MediaUploadForm />
      <form className="mb-6">
        <Input name="q" defaultValue={q} placeholder="Search" className="max-w-sm rounded-none" />
      </form>
      {items.length ? (
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
      ) : (
        <p className="text-sm text-muted-foreground">No images yet. Upload a file to get a URL you can use on services, products, and journal posts.</p>
      )}
    </div>
  );
}
