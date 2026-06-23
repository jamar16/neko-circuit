export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Calendar, MapPin, Users, ExternalLink, ArrowRight, Globe, Clock, Download, Cake } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getConventionCount } from '@/lib/getConventionCount';
import { CONVENTION_WHERE } from '@/lib/eventTypes';
import Header from '../../components/header';
import Footer from '../../components/footer';

function getSiteUrl(): string {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  }
  return process.env.NEXTAUTH_URL || 'https://dateanime.com';
}

/* ------------------------------------------------------------------ */
/*  Slug helpers                                                       */
/* ------------------------------------------------------------------ */

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const STATE_NAMES: Record<string, string> = {
  MI: 'Michigan', IL: 'Illinois', IN: 'Indiana', OH: 'Ohio',
  WI: 'Wisconsin', MN: 'Minnesota', MO: 'Missouri', KY: 'Kentucky', IA: 'Iowa',
};

const STATE_SLUGS: Record<string, string> = {
  MI: 'michigan', IL: 'illinois', IN: 'indiana', OH: 'ohio',
  WI: 'wisconsin', MN: 'minnesota', MO: 'missouri', KY: 'kentucky', IA: 'iowa',
};

/* ------------------------------------------------------------------ */
/*  Date formatting                                                    */
/* ------------------------------------------------------------------ */

function formatDateRange(start: Date | null, end: Date | null): string {
  if (!start) return 'Dates not yet announced';
  const s = new Date(start);
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
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

function formatDateShort(d: Date | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function durationDays(start: Date | null, end: Date | null): number | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

/* ------------------------------------------------------------------ */
/*  Expanded description builder — 200–250 words                       */
/* ------------------------------------------------------------------ */

function buildDescription(con: {
  name: string;
  city: string;
  state: string;
  venue: string | null;
  startDate: Date | null;
  endDate: Date | null;
  attendance: number | null;
  description: string | null;
}, sameStateCount: number): string {
  if (con.description) return con.description;

  const days = durationDays(con.startDate, con.endDate);
  const stateName = STATE_NAMES[con.state] || con.state;

  // Date phrasing
  const datePhrase = con.startDate
    ? `taking place ${formatDateRange(con.startDate, con.endDate)}`
    : 'with dates still to be announced for the 2026 season';

  // Venue phrasing
  const venuePhrase = con.venue
    ? `Held at ${con.venue} in ${con.city}, ${stateName}`
    : `Located in ${con.city}, ${stateName}`;

  // Duration phrasing
  const dayPhrase = days && days > 1
    ? `spanning ${days} full days of programming`
    : 'packed into a single day of programming';

  // Attendance phrasing
  const attendancePhrase = con.attendance
    ? `Drawing approximately ${con.attendance.toLocaleString('en-US')} attendees each year, ${con.name} has established itself as a significant destination for anime fans in the ${stateName} area`
    : `A growing regional event, ${con.name} continues to build momentum and attract anime fans from across ${stateName} and the surrounding Midwest states`;

  // State context
  const stateContext = sameStateCount > 0
    ? `${con.name} is one of ${sameStateCount + 1} anime conventions that Neko Circuit tracks in ${stateName}, making the state a strong hub on the 2026 Midwest convention circuit.`
    : `${con.name} is the anchor anime convention that Neko Circuit tracks in ${stateName} for the 2026 season.`;

  return (
    `${con.name} is a Midwest anime convention ${datePhrase}. ` +
    `${venuePhrase}, this event offers ${dayPhrase}. ` +
    `${attendancePhrase}. ` +
    `Attendees can expect cosplay contests, artist alleys, vendor halls, industry panels, and late-night programming that keeps the energy going from open to close. ` +
    `${stateContext} ` +
    `Whether you're planning your first trip or returning for another year, ${con.name} deserves a spot on your 2026 con calendar.`
  );
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

type PageProps = { params: { slug: string } };

/* ------------------------------------------------------------------ */
/*  Slug-specific SEO overrides                                        */
/* ------------------------------------------------------------------ */

const SEO_OVERRIDES: Record<string, {
  title: string;
  description: string;
  canonical: string;
}> = {
  'anime-midwest': {
    title: 'Anime Midwest 2026 — July 3-5, Rosemont IL | Dates, Tickets, Schedule',
    description: 'Anime Midwest 2026 runs July 3-5 at Donald E. Stephens Convention Center in Rosemont, IL. Get dates, schedule, hotel info, and the full Midwest con calendar.',
    canonical: 'https://dateanime.com/conventions/anime-midwest',
  },
  'mianime': {
    title: 'MiAnime 2026 — August 1-2, Novi MI | Dates, Venue, Tickets',
    description: 'MiAnime 2026 runs August 1-2 at Vibe Credit Union Showplace in Novi, MI. Setup day Friday July 31. Dates, venue info, and the full Midwest anime con calendar.',
    canonical: 'https://dateanime.com/conventions/mianime',
  },
  'ozokucon': {
    title: 'Ozokucon 2026 — August 28-30, Port Huron MI | Dates, Venue, Tickets',
    description: 'Ozokucon 2026 runs August 28-30 at Blue Water Convention Center in Port Huron, MI. Anime and pop culture convention dates, venue info, and more.',
    canonical: 'https://dateanime.com/conventions/ozokucon',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const conventions = await prisma.convention.findMany();
  const con = conventions.find((c) => toSlug(c.name) === params.slug);
  if (!con) return { title: 'Convention Not Found | Neko Circuit' };

  const override = SEO_OVERRIDES[params.slug];

  const dateStr = con.startDate
    ? formatDateRange(con.startDate, con.endDate)
    : '2026';
  const title = override?.title ?? `${con.name} 2026 — Dates, Venue, and Tickets | Neko Circuit`;
  const description = override?.description ?? `${con.name} ${dateStr} in ${con.city}, ${con.state}. Dates, venue info, attendance estimates, and how to plan your trip.`.slice(0, 160);

  const meta: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/og-image.png'],
      type: 'website',
    },
  };

  if (override?.canonical) {
    meta.alternates = { canonical: override.canonical };
  }

  return meta;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function ConventionSlugPage({ params }: PageProps) {
  const conventions = await prisma.convention.findMany({
    orderBy: { startDate: 'asc' },
  });
  const con = conventions.find((c) => toSlug(c.name) === params.slug);
  if (!con) notFound();

  const totalCons = await getConventionCount();
  const stateName = STATE_NAMES[con.state] || con.state;
  const stateSlug = STATE_SLUGS[con.state] || con.state.toLowerCase();
  const dateRange = formatDateRange(con.startDate, con.endDate);
  const days = durationDays(con.startDate, con.endDate);

  /* ── Same-state conventions (for "Other cons" section) ───────────── */
  const now = new Date();
  const sameStateCons = conventions.filter(
    (c) => c.state === con.state && c.id !== con.id
  );
  // Only show future or undated events in the "Other Conventions" cards
  const otherStateCons = sameStateCons
    .filter((c) => !c.startDate || new Date(c.startDate) >= now)
    .slice(0, 3);

  /* ── "Coming up nearby" — next con in same state within 90 days ─── */
  let upcomingNearbyCon: typeof con | null = null;
  if (con.endDate || con.startDate) {
    const conEnd = con.endDate ? new Date(con.endDate) : new Date(con.startDate!);
    const ninetyDaysOut = new Date(conEnd.getTime() + 90 * 86_400_000);
    upcomingNearbyCon = sameStateCons.find((c) => {
      if (!c.startDate) return false;
      const cStart = new Date(c.startDate);
      return cStart > conEnd && cStart <= ninetyDaysOut;
    }) ?? null;
  }

  const descriptionText = buildDescription(con, sameStateCons.length);

  /* ── Slug-specific first-paragraph overrides ────────────────────── */
  const FIRST_PARAGRAPH_OVERRIDES: Record<string, { factual: string; brand: string }> = {
    'anime-midwest': {
      factual: `Anime Midwest 2026 runs July 3–5, 2026, at the Donald E. Stephens Convention Center in Rosemont, IL. It's a 15,000-person three-day anime convention near Chicago featuring cosplay contests, artist alleys, vendor halls, industry panels, and late-night programming. Badges and the latest schedule are available on the official site.`,
      brand: descriptionText,
    },
  };
  const paragraphOverride = FIRST_PARAGRAPH_OVERRIDES[params.slug];

  /* ── Event JSON-LD structured data ──────────────────────────────── */
  const siteUrl = getSiteUrl();
  const eventLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: con.name,
    image: `${siteUrl}/og-image.png`,
    organizer: {
      '@type': 'Organization',
      name: con.name,
    },
    location: {
      '@type': 'Place',
      name: con.venue || con.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: con.city,
        addressRegion: con.state,
        addressCountry: 'US',
      },
    },
  };
  if (con.startDate) eventLd.startDate = new Date(con.startDate).toISOString();
  if (con.endDate) eventLd.endDate = new Date(con.endDate).toISOString();
  if (con.website) eventLd.url = con.website;
  if (con.attendance) {
    eventLd.maximumAttendeeCapacity = con.attendance;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
      />
    <div className="min-h-screen bg-void">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 via-void to-void" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block mb-4 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-neon-cyan border border-neon-cyan/30 rounded-full bg-neon-cyan/5">
            2026 Convention Guide
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            {con.name} 2026
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-[600px] mx-auto">
            {dateRange} &middot; {con.city}, {stateName}
          </p>
        </div>
      </section>

      {/* Details grid */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dates */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-neon-magenta" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Dates</span>
              </div>
              <p className="text-white font-semibold">{dateRange}</p>
              {days && days > 1 && (
                <p className="text-gray-500 text-sm mt-1">{days}-day event</p>
              )}
            </div>

            {/* Venue */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-neon-magenta" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Venue</span>
              </div>
              <p className="text-white font-semibold">
                {con.venue || 'Venue not yet announced'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {con.city}, {stateName}
              </p>
            </div>

            {/* Attendance */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-neon-magenta" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Est. Attendance</span>
              </div>
              <p className="text-white font-semibold">
                {con.attendance
                  ? `~${con.attendance.toLocaleString('en-US')}`
                  : 'Not reported'}
              </p>
            </div>
          </div>

          {/* Website link */}
          {con.website && (
            <div className="mt-4">
              <a
                href={con.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                Visit Official Site
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Description / about */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-white mb-4">About {con.name}</h2>
          {paragraphOverride ? (
            <>
              <p className="text-gray-300 text-base leading-relaxed">
                {paragraphOverride.factual}
                {con.website && (
                  <>{' '}<a href={con.website} target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:text-neon-cyan/80 transition-colors underline">Get badges on the official site →</a></>
                )}
              </p>
              <p className="text-gray-400 text-base leading-relaxed mt-4">
                {paragraphOverride.brand}
              </p>
            </>
          ) : (
            <p className="text-gray-300 text-base leading-relaxed">
              {descriptionText}
            </p>
          )}
          {!paragraphOverride && con.website && (
            <p className="text-gray-400 text-sm mt-4">
              Official site:{' '}
              <a
                href={con.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan hover:text-neon-cyan/80 transition-colors underline"
              >
                {con.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </p>
          )}
        </div>
      </section>

      {/* Coming up nearby */}
      {upcomingNearbyCon && (
        <section className="pb-12 md:pb-16">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-neon-cyan" />
              <h2 className="text-xl font-bold text-white">Coming Up Nearby</h2>
            </div>
            <Link
              href={`/conventions/${toSlug(upcomingNearbyCon.name)}`}
              className="block bg-white/[0.03] border border-neon-cyan/20 hover:border-neon-cyan/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]"
            >
              <p className="text-white font-semibold">{upcomingNearbyCon.name}</p>
              <p className="text-gray-400 text-sm mt-1">
                {formatDateShort(upcomingNearbyCon.startDate) ? `${formatDateShort(upcomingNearbyCon.startDate)}–${formatDateShort(upcomingNearbyCon.endDate)}` : 'Dates not yet announced'} · {upcomingNearbyCon.city}, {stateName}
              </p>
            </Link>
          </div>
        </section>
      )}

      {/* Other cons in this state */}
      {otherStateCons.length > 0 && (
        <section className="pb-12 md:pb-16">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Other Conventions in {stateName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherStateCons.map((c) => (
                <Link
                  key={c.id}
                  href={`/conventions/${toSlug(c.name)}`}
                  className="block bg-white/[0.03] border border-white/[0.06] hover:border-neon-magenta/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_0_16px_rgba(255,59,217,0.08)]"
                >
                  <p className="text-white font-semibold text-sm">{c.name}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatDateShort(c.startDate) ? `${formatDateShort(c.startDate)}–${formatDateShort(c.endDate)}` : 'Dates not yet announced'}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {c.city}, {stateName}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop CTA */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl border border-neon-magenta/20 bg-gradient-to-r from-neon-magenta/5 to-neon-cyan/5 p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Track {con.name} and {totalCons - 1} other Midwest cons with the 2026 Neko Circuit Calendar
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

      {/* Footer CTA links */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href={`/conventions?state=${stateSlug}`}
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] hover:border-neon-cyan/30 rounded-xl p-4 transition-all group"
            >
              <MapPin className="w-5 h-5 text-neon-cyan flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold group-hover:text-neon-cyan transition-colors">All {stateName} Cons</p>
                <p className="text-gray-500 text-xs">Track every event in the state</p>
              </div>
            </Link>
            <Link
              href="/sync"
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] hover:border-neon-cyan/30 rounded-xl p-4 transition-all group"
            >
              <Download className="w-5 h-5 text-neon-cyan flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold group-hover:text-neon-cyan transition-colors">Download Calendar</p>
                <p className="text-gray-500 text-xs">Sync every con to your phone</p>
              </div>
            </Link>
            <Link
              href="/birthdays"
              className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] hover:border-neon-cyan/30 rounded-xl p-4 transition-all group"
            >
              <Cake className="w-5 h-5 text-neon-cyan flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold group-hover:text-neon-cyan transition-colors">Character Birthdays</p>
                <p className="text-gray-500 text-xs">See who's celebrating near this con</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className="pb-12">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <Link
            href="/conventions"
            className="text-gray-500 hover:text-white transition-colors text-sm"
          >
            ← Back to all conventions
          </Link>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}
