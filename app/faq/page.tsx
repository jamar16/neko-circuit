import type { Metadata } from 'next';
import FaqClient from './faq-client';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers about shipping, sizing, launch pricing, returns, and the 2026 Neko Circuit anime convention calendar.',
  openGraph: {
    title: 'FAQ | Neko Circuit',
    description:
      'Shipping, sizing, launch pricing, returns, and everything about the 2026 calendar.',
    images: ['/og-image.png'],
    type: 'website',
  },
};

export default function FaqPage() {
  return <FaqClient />;
}
