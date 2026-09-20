import { connectDb } from "@/lib/db";
import { AdminUser } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { saveUserAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { roles } from "@/config/site";

export default async function UsersPage() {
  await requirePermission("users:manage");
  await connectDb();
  const users = await AdminUser.find().lean();
  return (
    <div>
      <AdminHeader title="Admin users" />
      <div className="mb-8 divide-y divide-hairline">
        {users.map((user) => (
          <p key={String(user._id)} className="py-3 text-sm">
            {user.name} · {user.email} · {user.role}
          </p>
        ))}
      </div>
      <form action={saveUserAction} className="grid max-w-md gap-3">
        <Input name="name" placeholder="Name" className="rounded-none" required />
        <Input name="email" type="email" placeholder="Email" className="rounded-none" required />
        <Input name="password" type="password" placeholder="Password" className="rounded-none" required />
        <select name="role" className="h-9 border border-input bg-background px-2 text-sm">
          {roles.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
        <Button className="rounded-none">Create user</Button>
      </form>
    </div>
  );
}
