import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import BirthdayCard from './birthday-card';
import Header from '../components/header';
import Footer from '../components/footer';
import { Cake } from 'lucide-react';

export const metadata: Metadata = { title: 'Character Birthdays | Neko Circuit' };
export const dynamic = 'force-dynamic';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthFromBirthday(birthday: string): number {
  return parseInt(birthday.split('-')[0], 10);
}

export default async function BirthdaysPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  const monthStr = String(currentMonth).padStart(2, '0');

  const characters = await prisma.character.findMany({
    where: { birthday: { startsWith: monthStr + '-' } },
    include: { voiceActors: true },
    orderBy: { birthday: 'asc' },
  });

  const allCharacters = await prisma.character.findMany({
    include: { voiceActors: true },
    orderBy: { birthday: 'asc' },
  });

  // Group by month
  const byMonth: Record<number, typeof allCharacters> = {};
  for (const ch of allCharacters) {
    const m = getMonthFromBirthday(ch.birthday);
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(ch);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-void pt-24 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-magenta/10 border border-neon-magenta/20 mb-4">
              <Cake className="w-4 h-4 text-neon-magenta" />
              <span className="text-neon-magenta text-xs font-semibold tracking-widest uppercase">
                Character Birthdays
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl text-white tracking-wider mb-3">
              This Month&apos;s Birthdays
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Celebrate your favorite characters! Showing birthdays for{' '}
              <span className="text-neon-cyan font-semibold">{MONTH_NAMES[currentMonth - 1]}</span>.
            </p>
          </div>

          {/* Current month characters */}
          {characters.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No birthdays this month. Check back next month!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {characters.map((ch) => (
                <BirthdayCard
                  key={ch.id}
                  name={ch.name}
                  series={ch.series}
                  birthday={ch.birthday}
                  description={ch.description}
                  imageUrl={ch.imageUrl}
                  voiceActors={ch.voiceActors}
                />
              ))}
            </div>
          )}

          {/* Other months */}
          <div className="border-t border-white/5 pt-12">
            <h2 className="font-display text-2xl text-white tracking-wider mb-8 text-center">
              Upcoming Birthdays
            </h2>
            <div className="space-y-10">
              {Array.from({ length: 12 }, (_, i) => i + 1)
                .filter((month) => month !== currentMonth)
                .map((month) => {
                  const monthChars = byMonth[month] ?? [];
                  if (monthChars.length === 0) return null;
                  return (
                    <div key={month}>
                      <h3 className="text-lg font-semibold tracking-wider mb-4 text-gray-300">
                        {MONTH_NAMES[month - 1]}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {monthChars.map((ch) => (
                          <BirthdayCard
                            key={ch.id}
                            name={ch.name}
                            series={ch.series}
                            birthday={ch.birthday}
                            description={ch.description}
                            imageUrl={ch.imageUrl}
                            voiceActors={ch.voiceActors}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
