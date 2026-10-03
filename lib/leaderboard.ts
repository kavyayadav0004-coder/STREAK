import { prisma } from "./db";
import { dayKey } from "./streak";
import { displayName } from "./format";

// Only members whose streak is still alive (scanned today/yesterday, or frozen) are ranked.
export async function top10() {
  const y = dayKey(new Date(Date.now() - 864e5));
  const rows = await prisma.member.findMany({
    where: { active: true, showOnBoard: true, OR: [{ lastScanDay: { gte: y } }, { frozenUntil: { gte: y } }] },
    orderBy: [{ currentStreak: "desc" }, { maxStreak: "desc" }, { name: "asc" }],
    take: 10,
    select: { id: true, name: true, currentStreak: true, maxStreak: true },
  });
  return rows.map((r: { id: string; name: string; currentStreak: number; maxStreak: number }) => ({ ...r, name: displayName(r.name) }));
}