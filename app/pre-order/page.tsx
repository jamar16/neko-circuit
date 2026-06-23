import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import PreOrderClient from './pre-order-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Launch Price',
  description:
    'Lock in launch pricing on the 2026 Neko Circuit calendar. Limited tiers, free shipping on Deluxe and Premium, ships in 7–10 business days.',
  openGraph: {
    title: 'Launch Price | Neko Circuit',
    description:
      'Lock in launch pricing on the 2026 anime convention calendar. Free shipping on Deluxe and Premium tiers.',
    images: ['/og-image.png'],
    type: 'website',
  },
};

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
    console.error('pre-order/page.tsx: failed to fetch products for JSON-LD', err);
    return [];
  }
}

export default async function PreOrderPage() {
  const siteUrl = getSiteUrl();
  const products = await getProducts();

  // For pre-order page, surface the launch / pre-order price when available.
  const productLd = products.map((p) => {
    const launchPrice = p.preOrderPrice ?? p.price;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.description,
      sku: p.sku,
      image: p.image ? [p.image.startsWith('http') ? p.image : `${siteUrl}${p.image}`] : undefined,
      brand: { '@type': 'Brand', name: 'Neko Circuit' },
      offers: {
        '@type': 'Offer',
        url: `${siteUrl}/pre-order`,
        priceCurrency: 'USD',
        price: launchPrice.toFixed(2),
        availability:
          p.limitedEdition && p.maxUnits != null && p.unitsSold >= p.maxUnits
            ? 'https://schema.org/SoldOut'
            : 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    };
  });

  return (
    <>
      {productLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
        />
      )}
      <PreOrderClient />
    </>
  );
}
