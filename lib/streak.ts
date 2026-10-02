export const dayKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: process.env.GYM_TZ || "Asia/Kolkata" }).format(d);
export const dayNum = (k: string) => Date.parse(k + "T00:00:00Z") / 86400000;

type S = { currentStreak: number; maxStreak: number; lastScanDay: string | null; frozenUntil: string | null };

export function nextStreak(m: S, today: string) {
  if (m.lastScanDay === today) return { duplicate: true as const };
  let cur = 1;
  if (m.lastScanDay) {
    const gap = dayNum(today) - dayNum(m.lastScanDay);
    if (gap === 1) cur = m.currentStreak + 1;
    // freeze: streak survives if freeze covers everything up to yesterday
    else if (gap > 1 && m.frozenUntil && dayNum(m.frozenUntil) >= dayNum(today) - 1) cur = m.currentStreak + 1;
  }
  return { duplicate: false as const, currentStreak: cur, maxStreak: Math.max(m.maxStreak, cur) };
}
