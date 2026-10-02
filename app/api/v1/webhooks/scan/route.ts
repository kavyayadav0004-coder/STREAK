import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/security";
import { processScan } from "@/lib/scan";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let id: string | undefined;
  try { const v = JSON.parse(raw).member_id; if (v != null) id = String(v).trim(); } catch {}
  if (!id) return NextResponse.json({ error: "member_id required" }, { status: 400 });
  const r = await processScan(id);
  return NextResponse.json(r.body, { status: r.status });
}
