import type { Metadata } from 'next';
import ContactClient from './contact-client';

export const metadata: Metadata = {
  title: 'Contact | Neko Circuit',
  description:
    'Get in touch with the Neko Circuit team. Questions about your order, calendar, or convention data? We respond within 24 hours.',
  openGraph: {
    title: 'Contact | Neko Circuit',
    description:
      'Get in touch with the Neko Circuit team. Questions about your order, calendar, or convention data? We respond within 24 hours.',
    url: 'https://dateanime.com/contact',
    images: ['/og-image.png'],
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
