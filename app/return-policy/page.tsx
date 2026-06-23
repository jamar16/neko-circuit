import type { Metadata } from 'next';
import ReturnPolicyClient from './return-policy-client';

export const metadata: Metadata = {
  title: 'Return Policy | Neko Circuit',
  description:
    'Neko Circuit return and refund policy. Print-on-demand orders ship via Lulu — review our policy before purchasing.',
  openGraph: {
    title: 'Return Policy | Neko Circuit',
    description:
      'Neko Circuit return and refund policy. Print-on-demand orders ship via Lulu — review our policy before purchasing.',
    url: 'https://dateanime.com/return-policy',
    images: ['/og-image.png'],
    type: 'website',
  },
};

export default function ReturnPolicyPage() {
  return <ReturnPolicyClient />;
}
