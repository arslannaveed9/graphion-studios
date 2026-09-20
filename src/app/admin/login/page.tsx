import { LoginForm } from "@/components/admin/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <LoginForm from={from} />
    </div>
  );
}
