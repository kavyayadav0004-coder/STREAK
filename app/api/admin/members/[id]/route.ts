import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emit } from "@/lib/realtime";
import { dayKey } from "@/lib/streak";

const pick = (b: any) => {
  const d: any = {};
  for (const k of ["name", "cardId", "active", "frozenUntil", "showOnBoard"]) if (k in b) d[k] = b[k] === "" ? null : b[k];
  for (const k of ["currentStreak", "maxStreak"]) if (k in b) d[k] = Math.max(0, parseInt(b[k]) || 0);
  return d;
};
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const data = pick(await req.json());
  const cur = await prisma.member.findUnique({ where: { id }, select: { lastScanDay: true, maxStreak: true } });
  if (!cur) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if ("currentStreak" in data) {
    const y = dayKey(new Date(Date.now() - 864e5));
    if (!cur.lastScanDay || cur.lastScanDay < y) data.lastScanDay = y;
    const max = "maxStreak" in data ? data.maxStreak : cur.maxStreak;
    if (data.currentStreak > max) data.maxStreak = data.currentStreak;
  }
  const m = await prisma.member.update({ where: { id }, data });
  await emit("refresh");
  return NextResponse.json(m);
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.member.delete({ where: { id } });
  await emit("refresh");
  return NextResponse.json({ ok: true });
}