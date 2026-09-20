import { connectDb } from "@/lib/db";
import { AboutPage } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { saveAboutAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JsonListField } from "@/components/admin/fields";
import { serialize } from "@/lib/format";

export default async function AboutAdminPage() {
  await requirePermission("content:write");
  await connectDb();
  const about = serialize(await AboutPage.findOne().lean());
  return (
    <div>
      <AdminHeader title="About" />
      <form action={saveAboutAction} className="space-y-4">
        <Input name="introductionHeading" defaultValue={about?.introductionHeading} className="rounded-none" />
        <Textarea name="introduction" defaultValue={about?.introduction} className="rounded-none" />
        <Textarea name="mission" defaultValue={about?.mission} className="rounded-none" />
        <Textarea name="vision" defaultValue={about?.vision} className="rounded-none" />
        <Textarea name="story" defaultValue={about?.story} className="rounded-none" />
        <JsonListField name="values" label="Values" value={about?.values || []} keys={[{ key: "title", label: "Title" }, { key: "description", label: "Description" }]} />
        <JsonListField name="whyUs" label="Why us" value={about?.whyUs || []} keys={[{ key: "title", label: "Title" }, { key: "description", label: "Description" }]} />
        <JsonListField name="stats" label="Stats" value={about?.stats || []} keys={[{ key: "label", label: "Label" }, { key: "value", label: "Value" }]} />
        <Input name="heroImage" defaultValue={about?.heroImage} placeholder="Hero image" className="rounded-none" />
        <Input name="ctaHeading" defaultValue={about?.ctaHeading} className="rounded-none" />
        <Textarea name="ctaBody" defaultValue={about?.ctaBody} className="rounded-none" />
        <Input name="ctaLabel" defaultValue={about?.ctaLabel} className="rounded-none" />
        <Input name="ctaHref" defaultValue={about?.ctaHref} className="rounded-none" />
        <Button className="rounded-none">Save about</Button>
      </form>
    </div>
  );
}
