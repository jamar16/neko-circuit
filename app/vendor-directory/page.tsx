import type { Metadata } from 'next';
import VendorClient from './vendor-client';

export const metadata: Metadata = {
  title: 'Vendor Directory | Neko Circuit',
  description:
    'Browse anime convention vendors across the Midwest. Tables, booths, and small businesses on the 2026 circuit.',
  openGraph: {
    title: 'Vendor Directory | Neko Circuit',
    description:
      'Browse anime convention vendors across the Midwest. Tables, booths, and small businesses on the 2026 circuit.',
    url: 'https://dateanime.com/vendor-directory',
    images: ['/og-image.png'],
    type: 'website',
  },
};

export default function VendorPage() {
  return <VendorClient />;
}
