export const dynamic = 'force-dynamic';

import HomeClient from './components/home-client';
import HomepageDynamicSections from './components/homepage-dynamic-sections';
import type { DetroitEvent, UpcomingCon, NextHeroCon } from './components/homepage-dynamic-sections';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { getConventionCount } from '@/lib/getConventionCount';
import { CONVENTION_WHERE } from '@/lib/eventTypes';

export async function generateMetadata(): Promise<Metadata> {
  const count = await getConventionCount();
  return {
    title: 'Midwest Anime Convention Calendar 2026 | Neko Circuit',
    description:
      `${count} confirmed Midwest anime cons in one place. Michigan, Illinois, Indiana, Ohio and more. Track every badge drop and hotel block for 2026. Detroit built.`,
  };
}

const ORG_WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Neko Circuit',
      url: 'https://dateanime.com',
      logo: 'https://dateanime.com/og-image.png',
      sameAs: ['https://instagram.com/neko313circuit'],
    },
    {
      '@type': 'WebSite',
      name: 'Neko Circuit',
      url: 'https://dateanime.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://dateanime.com/conventions?q={search_term}',
        'query-input': 'required name=search_term',
      },
    },
  ],
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function getDetroitEvents(): Promise<{ events: DetroitEvent[]; heading: string }> {
  try {
    const now = new Date();

    // Always show upcoming MI events (startDate >= today), matching
    // the /conventions/detroit page source (state: 'MI').
    const rows = await prisma.convention.findMany({
      where: {
        state: 'MI',
        startDate: { gte: now },
      },
      orderBy: { startDate: 'asc' },
      take: 6,
    });

    const events: DetroitEvent[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      city: r.city,
      state: r.state,
      venue: r.venue,
      startDate: r.startDate ? r.startDate.toISOString() : null,
      endDate: r.endDate ? r.endDate.toISOString() : null,
      type: r.type ?? null,
      slug: toSlug(r.name),
      website: r.website ?? null,
      attendance: r.attendance ?? null,
      description: r.description ?? null,
    }));

    return { events, heading: 'Upcoming in Detroit' };
  } catch (err) {
    console.error('[HOME] Detroit events fetch failed:', err instanceof Error ? err.message : err);
    return { events: [], heading: 'Upcoming in Detroit' };
  }
}

async function getNextHeroCon(): Promise<NextHeroCon | null> {
  try {
    const now = new Date();
    const row = await prisma.convention.findFirst({
      where: {
        startDate: { gt: now },
        ...CONVENTION_WHERE,
      },
      orderBy: { startDate: 'asc' },
    });
    if (!row || !row.startDate) return null;
    const start = row.startDate;
    const monthDay = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
    return { name: row.name, dateLabel: monthDay };
  } catch (err) {
    console.error('[HOME] Next hero con fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function getUpcomingCons(): Promise<UpcomingCon[]> {
  try {
    const now = new Date();
    const rows = await prisma.convention.findMany({
      where: {
        startDate: { gt: now },
        ...CONVENTION_WHERE,
      },
      orderBy: { startDate: 'asc' },
      take: 2,
    });

    return rows.map((r) => {
      const start = r.startDate!;
      const diffMs = start.getTime() - now.getTime();
      const daysUntil = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return {
        id: r.id,
        name: r.name,
        city: r.city,
        state: r.state,
        venue: r.venue ?? null,
        startDate: start.toISOString(),
        endDate: r.endDate ? r.endDate.toISOString() : null,
        type: r.type ?? null,
        slug: toSlug(r.name),
        daysUntil,
        website: r.website ?? null,
        attendance: r.attendance ?? null,
        description: r.description ?? null,
      };
    });
  } catch (err) {
    console.error('[HOME] Upcoming cons fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

export default async function HomePage() {
  const [detroit, upcomingCons, conventionCount, nextHeroCon] = await Promise.all([
    getDetroitEvents(),
    getUpcomingCons(),
    getConventionCount(),
    getNextHeroCon(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_WEBSITE_LD) }}
      />
      <HomeClient conventionCount={conventionCount} nextHeroCon={nextHeroCon}>
        <HomepageDynamicSections
          detroitEvents={detroit.events}
          upcomingCons={upcomingCons}
          detroitHeading={detroit.heading}
          conventionCount={conventionCount}
        />
      </HomeClient>

      {/* Server-rendered SEO content — visible footer-area block, real readable section */}
      <div
        style={{
          backgroundColor: '#05060a',
          paddingTop: '40px',
          paddingBottom: '40px',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 16px',
            color: '#888888',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          <section>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#aaaaaa', marginBottom: '12px' }}>
              The Complete Midwest Anime Convention Calendar for 2026
            </h2>
            <p style={{ marginBottom: '24px' }}>
              Neko Circuit tracks {conventionCount} confirmed anime conventions across 9 Midwest
              states for 2026 — Michigan, Illinois, Indiana, Ohio, Wisconsin,
              Minnesota, Missouri, Kentucky, and Iowa. Every badge drop, hotel
              block, and registration window in one place so you can plan your
              entire con season without the scramble.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#aaaaaa', marginBottom: '12px' }}>
              Midwest States on the Circuit
            </h3>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { name: 'Michigan', slug: 'michigan' },
                { name: 'Illinois', slug: 'illinois' },
                { name: 'Indiana', slug: 'indiana' },
                { name: 'Ohio', slug: 'ohio' },
                { name: 'Wisconsin', slug: 'wisconsin' },
                { name: 'Minnesota', slug: 'minnesota' },
                { name: 'Missouri', slug: 'missouri' },
                { name: 'Kentucky', slug: 'kentucky' },
                { name: 'Iowa', slug: 'iowa' },
              ].map((s) => (
                <li key={s.slug}>
                  <Link href={`/conventions?state=${s.slug}`} style={{ color: '#888888', textDecoration: 'underline' }}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
