import type { Metadata } from 'next';
import Header from '../components/header';
import Footer from '../components/footer';
import WatchlistClient from './watchlist-client';

export const metadata: Metadata = {
  title: '2026 Con Watchlist — 29 Unconfirmed Midwest Anime Events | Neko Circuit',
  description:
    "29 Midwest anime conventions haven't confirmed 2026 dates yet. We're watching them. Get alerted the second one locks in.",
  openGraph: {
    title: '2026 Con Watchlist — 29 Unconfirmed Midwest Anime Events | Neko Circuit',
    description:
      "29 Midwest anime conventions haven't confirmed 2026 dates yet. We're watching them. Get alerted the second one locks in.",
    images: ['/og-image.png'],
    type: 'website',
  },
};

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-void">
      <Header />
      <WatchlistClient />
      <Footer />
    </div>
  );
}
