import { NextRequest, NextResponse } from "next/server";
import { validDisplayKey } from "@/lib/security";
import { top10 } from "@/lib/leaderboard";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  if (!validDisplayKey(req.nextUrl.searchParams.get("key"))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ rows: await top10() });
}
