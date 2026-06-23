export const dynamic = 'force-dynamic';

import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getSiteUrl(): string {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  }
  return process.env.NEXTAUTH_URL || 'https://dateanime.com';
}

// Static routes — every public, indexable page on the site.
// /checkout, /login, /api/* are intentionally excluded (also blocked in robots.ts).
const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/shop', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/pre-order', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/conventions', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/sync', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/vendor-directory', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/birthdays', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/watchlist', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/conventions/detroit', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/return-policy', changeFrequency: 'yearly', priority: 0.2 },
];

// State filter pages — canonical, indexable pages for each Midwest state.
const STATE_FILTER_ROUTES: string[] = [
  'michigan', 'illinois', 'indiana', 'ohio', 'wisconsin',
  'minnesota', 'missouri', 'kentucky', 'iowa',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  let conventions: Array<{ id: string; name: string; createdAt: Date }> = [];

  try {
    conventions = await prisma.convention.findMany({
      select: { id: true, name: true, createdAt: true },
      orderBy: { startDate: 'asc' },
    });
  } catch (err) {
    console.error('[SITEMAP] Failed to fetch dynamic entries:', err instanceof Error ? err.message : err);
  }

  const conventionLastMod = conventions.reduce<Date>(
    (latest, c) => (c.createdAt > latest ? c.createdAt : latest),
    new Date(0),
  );

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => {
    let lastModified: Date = now;
    if (r.path === '/conventions') {
      lastModified = conventionLastMod.getTime() > 0 ? conventionLastMod : now;
    }
    return {
      url: `${siteUrl}${r.path}`,
      lastModified,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    };
  });

  // State filter pages
  const stateEntries: MetadataRoute.Sitemap = STATE_FILTER_ROUTES.map((state) => ({
    url: `${siteUrl}/conventions?state=${state}`,
    lastModified: conventionLastMod.getTime() > 0 ? conventionLastMod : now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Conventions — individual slug pages at /conventions/[slug].
  const conventionEntries: MetadataRoute.Sitemap = conventions.map((c) => ({
    url: `${siteUrl}/conventions/${toSlug(c.name)}`,
    lastModified: c.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...stateEntries, ...conventionEntries];
}
