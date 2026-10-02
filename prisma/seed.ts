import { PrismaClient } from "@prisma/client";
import { dayKey } from "../lib/streak";
const prisma = new PrismaClient();
const names = ["Arjun Mehta","Priya Nair","Rohan Kapoor","Sneha Iyer","Vikram Singh","Ananya Rao","Karan Malhotra","Meera Joshi","Dev Patel","Isha Verma","Aditya Roy","Tara Bose"];
(async () => {
  const yesterday = dayKey(new Date(Date.now() - 864e5));
  for (let i = 0; i < names.length; i++) {
    const s = 3 + ((i * 7) % 40);
    await prisma.member.upsert({
      where: { cardId: `CARD_${String(i + 1).padStart(3, "0")}` }, update: {},
      create: { name: names[i], cardId: `CARD_${String(i + 1).padStart(3, "0")}`, currentStreak: s, maxStreak: s + (i % 5) * 4, lastScanDay: yesterday },
    });
  }
  console.log("seeded", names.length);
})().finally(() => prisma.$disconnect());
