import { LoginForm } from "@/components/admin/login-form";
import { getSettings } from "@/lib/queries";
import { safe } from "@/lib/safe";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const settings = await safe(getSettings, null);
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <LoginForm
        from={from}
        logoSrc={settings?.logo}
        logoSrcLight={settings?.logoLight}
        companyName={settings?.companyName}
      />
    </div>
  );
}
