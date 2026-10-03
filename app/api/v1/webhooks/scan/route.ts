import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/security";
import { processScan } from "@/lib/scan";
export const dynamic = "force-dynamic";
const MAX_SKEW_SEC = 600;

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: any = {};
  try { body = JSON.parse(raw) ?? {}; } catch {}

  const signed = !!req.headers.get("x-strk-signature");
  if (signed || body.ts != null) {
    const ts = Number(body.ts);
    if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > MAX_SKEW_SEC)
      return NextResponse.json({ error: "stale_or_missing_ts" }, { status: 400 });
  }

  const v = body.member_id;
  const id = v != null ? String(v).trim() : "";
  if (!id) return NextResponse.json({ error: "member_id required" }, { status: 400 });
  const r = await processScan(id);
  return NextResponse.json(r.body, { status: r.status });
}