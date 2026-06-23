import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import ShopClient from './shop-client';
import { getConventionCount } from '@/lib/getConventionCount';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const count = await getConventionCount();
  return {
    title: 'Shop',
    description:
      `Shop the 2026 Neko Circuit anime convention calendars. 12 months of original art, ${count}+ Midwest cons. Standard, Deluxe, and Premium tiers from $24.99.`,
    openGraph: {
      title: 'Shop | Neko Circuit',
      description:
        '2026 anime convention calendars with original artwork. Standard, Deluxe, and Premium tiers from $24.99.',
      images: ['/og-image.png'],
      type: 'website',
    },
  };
}

function getSiteUrl(): string {
  try {
    const h = headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'https';
    if (host) return `${proto}://${host}`;
  } catch {}
  return process.env.NEXTAUTH_URL || 'https://dateanime.com';
}

async function getProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch (err) {
    console.error('shop/page.tsx: failed to fetch products for JSON-LD', err);
    return [];
  }
}

export default async function ShopPage() {
  const siteUrl = getSiteUrl();
  const [products, conventionCount] = await Promise.all([getProducts(), getConventionCount()]);

  const productLd = products.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    sku: p.sku,
    image: p.image ? [p.image.startsWith('http') ? p.image : `${siteUrl}${p.image}`] : undefined,
    brand: { '@type': 'Brand', name: 'Neko Circuit' },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/shop`,
      priceCurrency: 'USD',
      price: p.price.toFixed(2),
      availability:
        p.limitedEdition && p.maxUnits != null && p.unitsSold >= p.maxUnits
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }));

  return (
    <>
      {productLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
        />
      )}
      <ShopClient conventionCount={conventionCount} />
    </>
  );
}
