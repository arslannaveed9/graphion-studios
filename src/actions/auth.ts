"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate, createSession, destroySession } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const ip = clientIp(await headers());
  const limit = await enforceRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    return { error: "Invalid credentials." };
  }

  await createSession(user);
  const from = String(formData.get("from") || "/admin");
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
