import { connectDb } from "@/lib/db";
import { EmailSettings } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { saveEmailSettingsAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function EmailSettingsPage() {
  await requirePermission("settings:manage");
  await connectDb();
  const settings = await EmailSettings.findOne().lean();
  return (
    <div>
      <AdminHeader title="Email" description="Provider keys stay in environment variables. These control who is notified." />
      <form action={saveEmailSettingsAction} className="grid max-w-xl gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="notifyOnContact" defaultChecked={settings?.notifyOnContact !== false} /> Notify on contact</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="notifyOnInquiry" defaultChecked={settings?.notifyOnInquiry !== false} /> Notify on inquiry</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sendCustomerConfirmation" defaultChecked={settings?.sendCustomerConfirmation !== false} /> Customer confirmation</label>
        <Input name="fromName" defaultValue={settings?.fromName} placeholder="From name" className="rounded-none" />
        <Input name="fromEmail" defaultValue={settings?.fromEmail} placeholder="From email" className="rounded-none" />
        <Input name="notifyEmail" defaultValue={settings?.notifyEmail} placeholder="Notify email" className="rounded-none" />
        <Button className="rounded-none">Save</Button>
      </form>
    </div>
  );
}
