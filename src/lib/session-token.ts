import { EncryptJWT, jwtDecrypt } from "jose";
import type { Role, SessionUser } from "@/types";

export const SESSION_COOKIE = process.env.AUTH_COOKIE_NAME || "gs_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret.slice(0, 32));
}

export async function encryptSession(user: SessionUser) {
  return new EncryptJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .encrypt(secretKey());
}

export async function readSessionToken(token?: string | null): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, secretKey());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      id: String(payload.sub),
      name: String(payload.name ?? ""),
      email: String(payload.email),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
