import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { AdminUser } from "@/models/admin-user";
import { rolePermissions } from "@/config/site";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  encryptSession,
  readSessionToken,
} from "@/lib/session-token";
import type { Permission, Role, SessionUser } from "@/types";

export { readSessionToken };

export function hasPermission(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await encryptSession(user);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  if (!hasPermission(session.role, permission)) {
    redirect("/admin");
  }
  return session;
}

export async function authenticate(email: string, password: string) {
  await connectDb();
  const user = await AdminUser.findOne({ email: email.toLowerCase(), isActive: true }).select(
    "+passwordHash name email role isActive",
  );
  if (!user?.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  user.lastLoginAt = new Date();
  await user.save();
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  } satisfies SessionUser;
}
