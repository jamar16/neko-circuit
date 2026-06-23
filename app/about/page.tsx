import type { Metadata } from 'next';
import AboutClient from './about-client';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Detroit-built, anime-fueled. Meet the team behind Neko Circuit and the 2026 calendar that turned our convention obsession into original art.',
  openGraph: {
    title: 'About Neko Circuit',
    description:
      'Detroit-built, anime-fueled. The story behind the 2026 Midwest anime convention calendar.',
    images: ['/og-image.png'],
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
