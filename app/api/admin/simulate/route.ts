import { NextRequest, NextResponse } from "next/server";
import { processScan } from "@/lib/scan";
export async function POST(req: NextRequest) {
  const { cardId } = await req.json();
  const r = await processScan(cardId);
  return NextResponse.json(r.body, { status: r.status });
}
