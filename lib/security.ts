import { createHmac, timingSafeEqual } from "crypto";
const eq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
// Accepts HMAC-SHA256 hex of the raw body in x-strk-signature, or a plain x-api-key for dumb scanners.
export function verifyWebhook(raw: string, headers: Headers) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return false;
  const sig = headers.get("x-strk-signature");
  if (sig) return eq(sig, createHmac("sha256", secret).update(raw).digest("hex"));
  const key = headers.get("x-api-key");
  return !!key && eq(key, secret);
}
export const validDisplayKey = (k: string | null) => !!k && !!process.env.DISPLAY_KEY && eq(k, process.env.DISPLAY_KEY);
