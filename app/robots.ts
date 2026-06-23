export const dynamic = 'force-dynamic';

import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

function getSiteUrl(): string {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  }
  return process.env.NEXTAUTH_URL || 'https://dateanime.com';
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/login', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
