export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import SyncClient from './sync-client';
import { getConventionCount } from '@/lib/getConventionCount';

export async function generateMetadata(): Promise<Metadata> {
  const count = await getConventionCount();
  return {
    title: 'Calendar Sync',
    description:
      `${count} confirmed Midwest anime cons — live in your calendar. Subscribe once on Google, Apple, or Outlook and stay on the circuit.`,
    openGraph: {
      title: 'Calendar Sync | Neko Circuit',
      description:
        `One-tap sync for ${count}+ Midwest anime cons across Google, Apple, and Outlook calendars.`,
      images: ['/og-image.png'],
      type: 'website',
    },
  };
}

export default async function SyncPage() {
  const conventionCount = await getConventionCount();
  return <SyncClient conventionCount={conventionCount} />;
}
