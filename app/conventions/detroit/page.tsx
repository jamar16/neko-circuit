export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, MapPin, Users, ExternalLink, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/db';
import Header from '../../components/header';
import Footer from '../../components/footer';

export const metadata: Metadata = {
  title: 'Detroit Anime Events 2026 — Your Complete Local Guide | Neko Circuit',
  description:
    'Every anime convention in and around Detroit for 2026. Youmacon, Astronomicon, Isshocon and more — dates, venues, and badge info in one place.',
  openGraph: {
    title: 'Detroit Anime Events 2026 — Your Complete Local Guide | Neko Circuit',
    description:
      'Every anime convention in and around Detroit for 2026. Youmacon, Astronomicon, Isshocon and more — dates, venues, and badge info in one place.',
    images: ['/og-image.png'],
    type: 'website',
  },
};

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateRange(start: Date | null, end: Date | null): string {
  if (!start) return 'Dates not yet announced';
  const s = new Date(start);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (!end) return s.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  const e = new Date(end);
  // Same-day event
  if (s.getTime() === e.getTime()) {
    return s.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  }
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('en-US', opts)}–${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

export default async function DetroitConventionsPage() {
  let conventions: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    venue: string | null;
    startDate: Date | null;
    endDate: Date | null;
    attendance: number | null;
    website: string | null;
  }> = [];

  try {
    conventions = await prisma.convention.findMany({
      where: { state: 'MI' },
      orderBy: { startDate: 'asc' },
    });
  } catch (err) {
    console.error('[DETROIT] Failed to fetch MI conventions:', err instanceof Error ? err.message : err);
  }

  // Sort: dated events first (by date), then TBD events (by attendance desc)
  const dated = conventions.filter((c) => c.startDate).sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());
  const tbd = conventions.filter((c) => !c.startDate).sort((a, b) => (b.attendance ?? 0) - (a.attendance ?? 0));
  const sorted = [...dated, ...tbd];

  return (
    <div className="min-h-screen bg-void">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-magenta/5 via-void to-void" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block mb-4 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-neon-magenta border border-neon-magenta/30 rounded-full bg-neon-magenta/5">
            Michigan Convention Guide
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Detroit Anime Events 2026
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-[700px] mx-auto leading-relaxed">
            Detroit and greater Michigan have become one of the Midwest&apos;s strongest anime corridors.
            Headlined by <strong className="text-white">Youmacon</strong> — a 25,000-attendee juggernaut that
            takes over <strong className="text-white">Huntington Place</strong> every fall — the state hosts
            a packed calendar of conventions year-round, from intimate fan gatherings to massive multi-genre expos.
          </p>
        </div>
      </section>

      {/* Convention List */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-xl font-bold text-white">
              {sorted.length} Michigan Convention{sorted.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {sorted.length === 0 ? (
            <p className="text-gray-500 text-center py-12">No Michigan conventions found.</p>
          ) : (
            <div className="space-y-4">
              {sorted.map((con) => (
                <article
                  key={con.id}
                  className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 sm:p-6 hover:border-neon-magenta/20 hover:bg-white/[0.05] transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Date badge */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neon-magenta/10 border border-neon-magenta/20 flex flex-col items-center justify-center text-center">
                      {con.startDate ? (
                        <>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neon-magenta">
                            {new Date(con.startDate).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-black text-white leading-none">
                            {new Date(con.startDate).getDate()}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-gray-500">—</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-neon-magenta transition-colors">
                          {con.website ? (
                            <a href={con.website} target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1.5">
                              {con.name}
                              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                            </a>
                          ) : (
                            con.name
                          )}
                        </h3>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neon-cyan/70" />
                          {formatDateRange(con.startDate, con.endDate)}
                        </span>
                        {con.venue && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neon-cyan/70" />
                            {con.venue}, {con.city}
                          </span>
                        )}
                        {!con.venue && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neon-cyan/70" />
                            {con.city}, MI
                          </span>
                        )}
                        {con.attendance && (
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-neon-cyan/70" />
                            ~{con.attendance.toLocaleString('en-US')} attendees
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl border border-neon-magenta/20 bg-gradient-to-r from-neon-magenta/5 to-neon-cyan/5 p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Track every Michigan con with the 2026 Neko Circuit Wall Calendar
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-[500px] mx-auto">
              All major Midwest anime events printed on a gorgeous wall calendar — never miss a badge pickup again.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neon-magenta text-white font-bold rounded-full hover:bg-neon-magenta/90 transition-colors text-sm"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
