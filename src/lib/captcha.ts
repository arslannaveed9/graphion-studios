import { createHmac, timingSafeEqual } from "node:crypto";

export type CaptchaChallenge = {
  token: string;
  prompt: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function equal(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createCaptchaChallenge(): CaptchaChallenge {
  const a = 2 + Math.floor(Math.random() * 10);
  const b = 2 + Math.floor(Math.random() * 10);
  const exp = Date.now() + 30 * 60 * 1000;
  const payload = `${a}.${b}.${exp}`;
  return {
    prompt: `What is ${a} + ${b}?`,
    token: `${payload}.${sign(payload)}`,
  };
}

export function verifyCaptcha(token: string, answer: string) {
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [aRaw, bRaw, expRaw, signature] = parts;
  const payload = `${aRaw}.${bRaw}.${expRaw}`;
  if (!equal(sign(payload), signature)) return false;
  const a = Number(aRaw);
  const b = Number(bRaw);
  const exp = Number(expRaw);
  if (![a, b, exp].every(Number.isFinite) || Date.now() > exp) return false;
  const value = Number(String(answer).trim());
  return Number.isFinite(value) && value === a + b;
}
