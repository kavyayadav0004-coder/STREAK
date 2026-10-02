import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emit } from "@/lib/realtime";
const pick = (b: any) => {
  const d: any = {};
  for (const k of ["name", "cardId", "active", "frozenUntil"]) if (k in b) d[k] = b[k] === "" ? null : b[k];
  for (const k of ["currentStreak", "maxStreak"]) if (k in b) d[k] = Math.max(0, parseInt(b[k]) || 0);
  return d;
};
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const m = await prisma.member.update({ where: { id: params.id }, data: pick(await req.json()) });
  await emit("refresh");
  return NextResponse.json(m);
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.member.delete({ where: { id: params.id } });
  await emit("refresh");
  return NextResponse.json({ ok: true });
}
