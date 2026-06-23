import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import ConventionsClient from './conventions-client';
import { getConventionCount } from '@/lib/getConventionCount';
import { CONVENTION_WHERE } from '@/lib/eventTypes';

export const dynamic = 'force-dynamic';

const STATE_MAP: Record<string, { code: string; label: string }> = {
  michigan: { code: 'MI', label: 'Michigan' },
  illinois: { code: 'IL', label: 'Illinois' },
  indiana: { code: 'IN', label: 'Indiana' },
  ohio: { code: 'OH', label: 'Ohio' },
  wisconsin: { code: 'WI', label: 'Wisconsin' },
  minnesota: { code: 'MN', label: 'Minnesota' },
  missouri: { code: 'MO', label: 'Missouri' },
  kentucky: { code: 'KY', label: 'Kentucky' },
  iowa: { code: 'IA', label: 'Iowa' },
};

function getSiteUrl(): string {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  }
  return process.env.NEXTAUTH_URL || 'https://dateanime.com';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { state?: string };
}): Promise<Metadata> {
  const stateSlug = (searchParams.state ?? '').toLowerCase();
  const stateInfo = STATE_MAP[stateSlug] ?? null;
  const siteUrl = getSiteUrl();

  if (stateInfo) {
    const title = `Anime Conventions in ${stateInfo.label} 2026 | Neko Circuit`;
    const description = `All anime conventions in ${stateInfo.label} for 2026. Dates, venues, and attendance for every ${stateInfo.label} con on the Midwest circuit.`;
    return {
      title,
      description,
      alternates: {
        canonical: `${siteUrl}/conventions?state=${stateSlug}`,
      },
      openGraph: {
        title,
        description,
        images: ['/og-image.png'],
        type: 'website',
      },
    };
  }

  const count = await getConventionCount();
  return {
    title: 'Midwest Anime Convention Schedule 2026 | Neko Circuit',
    description:
      `${count} confirmed Midwest anime cons for 2026. Search by month, state, or name — ACen, Youmacon, Colossalcon, and more on one page.`,
    alternates: {
      canonical: `${siteUrl}/conventions`,
    },
    openGraph: {
      title: 'Midwest Anime Convention Schedule 2026 | Neko Circuit',
      description:
        `${count} confirmed Midwest anime cons for 2026. Search by month, state, or name.`,
      images: ['/og-image.png'],
      type: 'website',
    },
  };
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(d: Date | string | null): string | null {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

export default async function ConventionsPage({
  searchParams,
}: {
  searchParams: { state?: string };
}) {
  const stateSlug = (searchParams.state ?? '').toLowerCase();
  const stateInfo = STATE_MAP[stateSlug] ?? null;
  const stateCode = stateInfo?.code ?? null;

  // Fetch conventions server-side (no empty-state flash, edge-cache safe).
  // Exclude local-scene event types (Tournament, Pop-Up, Meetup) — those
  // belong on the Detroit events page, not the main convention schedule.
  const allConventions = await prisma.convention.findMany({
    where: CONVENTION_WHERE,
    orderBy: { startDate: 'asc' },
  });
  const conventionCount = allConventions.length;

  // If a valid state param is present, filter for SSR crawlable list
  const ssrConventions = stateCode
    ? allConventions.filter((c) => c.state === stateCode)
    : [];

  return (
    <>
      <ConventionsClient
        initialState={stateCode ?? undefined}
        conventionCount={conventionCount}
        initialConventions={JSON.parse(JSON.stringify(allConventions))}
      />

      {/* Server-rendered convention list when ?state= is present — crawlable */}
      {stateCode && ssrConventions.length > 0 && (
        <section className="bg-void px-4 sm:px-6 pb-12">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4">
              Anime Conventions in {stateInfo!.label} — 2026
            </h2>
            <ul className="space-y-3">
              {ssrConventions.map((c: any) => (
                <li key={c.id}>
                  <Link
                    href={`/conventions/${toSlug(c.name)}`}
                    className="text-cyan-400 hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                  <span className="text-gray-400 text-sm ml-2">
                    {formatDate(c.startDate) ? `${formatDate(c.startDate)}–${formatDate(c.endDate)}` : 'Dates not yet announced'} · {c.city}, {c.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Server-rendered SEO intro — crawlable, below-fold text */}
      <section className="bg-void px-4 sm:px-6 pb-16">
        <div className="max-w-[900px] mx-auto">
          <p className="text-gray-300 text-base leading-relaxed">
            {conventionCount} confirmed Midwest anime cons for 2026. Search by month, state, or name.
            From ACen in Chicago to Youmacon in Detroit — the full circuit, one page.
            Whether you&apos;re chasing artist-alley tables, cosplay contests, or weekend badge pickups,
            this schedule covers every major event across nine states. Bookmark the page, filter by
            what matters, and plan your con season without juggling a dozen different sites.
          </p>
        </div>
      </section>
    </>
  );
}
