export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Neko Circuit — 2026 Anime Convention Calendar',
    template: '%s | Neko Circuit',
  },
  description: 'Where Anime Culture Meets the Convention Calendar. Premium 2026 anime calendars featuring original artwork, 39+ Midwest convention dates, and 75+ character birthdays.',
  keywords: ['anime', 'convention', 'calendar', '2026', 'midwest', 'youmacon', 'anime central', 'detroit'],
  openGraph: {
    title: 'Neko Circuit — 2026 Anime Convention Calendar',
    description: 'Where Anime Culture Meets the Convention Calendar',
    images: ['/og-image.png'],
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="google-site-verification" content="i4Vq6s5jw1UWBfZ--ytDPe2Ivkdy8IKE_Fo64VHUh8o" />
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              id="ga-script"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="antialiased">
        <div className="noise-overlay" />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
