import { prisma } from "./db";
import { dayKey, nextStreak } from "./streak";
import { emit } from "./realtime";
import { displayName } from "./format";

export async function processScan(cardId: string) {
  const m = await prisma.member.findUnique({ where: { cardId } });
  if (!m || !m.active) return { status: 404 as const, body: { error: "unknown_member" } };

  const now = new Date();
  const today = dayKey(now);
  const r = nextStreak(m, today);

  if (r.duplicate) {
    await prisma.scanLog.create({ data: { memberId: m.id, day: today, counted: false, streakAfter: m.currentStreak } });
    return { status: 200 as const, body: { counted: false, streak: m.currentStreak } };
  }

  // optimistic lock: only the first concurrent scan of the day wins
  const won = await prisma.member.updateMany({
    where: { id: m.id, lastScanDay: m.lastScanDay },
    data: { currentStreak: r.currentStreak, maxStreak: r.maxStreak, lastScanDay: today, lastScanAt: now },
  });
  if (won.count === 0) return { status: 200 as const, body: { counted: false, streak: m.currentStreak } };

  await prisma.scanLog.create({ data: { memberId: m.id, day: today, counted: true, streakAfter: r.currentStreak } });
  const isRecord = r.currentStreak > m.maxStreak && r.currentStreak > 1;
  if (m.showOnBoard) await emit("scan", { name: displayName(m.name), streak: r.currentStreak, max: r.maxStreak, isRecord });
  else await emit("refresh");
  return { status: 200 as const, body: { counted: true, streak: r.currentStreak, max: r.maxStreak } };
}