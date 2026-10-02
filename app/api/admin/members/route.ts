import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emit } from "@/lib/realtime";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(await prisma.member.findMany({ orderBy: { createdAt: "desc" } }));
}
export async function POST(req: NextRequest) {
  const { name, cardId } = await req.json();
  if (!name?.trim() || !cardId?.trim()) return NextResponse.json({ error: "name and cardId required" }, { status: 400 });
  try {
    const m = await prisma.member.create({ data: { name: name.trim(), cardId: cardId.trim() } });
    return NextResponse.json(m);
  } catch { return NextResponse.json({ error: "cardId already exists" }, { status: 409 }); }
}
