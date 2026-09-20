import { connectDb } from "@/lib/db";
import { RateLimit } from "@/models/ops";

export async function enforceRateLimit(key: string, limit: number, windowMs: number) {
  await connectDb();
  const now = Date.now();
  const record = await RateLimit.findOne({ key });

  if (!record) {
    await RateLimit.create({ key, count: 1, windowStartedAt: new Date(now) });
    return { ok: true, remaining: limit - 1 };
  }

  const elapsed = now - record.windowStartedAt.getTime();
  if (elapsed > windowMs) {
    record.count = 1;
    record.windowStartedAt = new Date(now);
    await record.save();
    return { ok: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: windowMs - elapsed };
  }

  record.count += 1;
  await record.save();
  return { ok: true, remaining: limit - record.count };
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
