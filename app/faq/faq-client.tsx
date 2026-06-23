'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Package, Truck, CreditCard, Calendar, Palette } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import SectionHeading from '../components/section-heading';

const FAQ_SECTIONS = [
  {
    title: 'Product',
    icon: Package,
    items: [
      { q: 'What sizes are the calendars?', a: 'The Standard and Deluxe editions are 11" x 17" (opens to 11" x 34" when hung). The Premium edition uses the same dimensions with thicker 130lb silk cover stock.' },
      { q: 'What\'s included in the Deluxe edition?', a: 'Everything in Standard plus a 24-piece vinyl sticker sheet, an exclusive 13th art print (All-Stars group poster), and a convention survival checklist card.' },
      { q: 'How is the Premium edition different?', a: 'The Premium adds magnetic backing for fridge/locker display, gold foil stamping on the cover, a 16-page mini art book with artist commentary, a numbered certificate of authenticity, and holographic packaging. Limited to 200 units.' },
      { q: 'Is the artwork original?', a: 'Yes! Every illustration is 100% original — no licensed characters, no IP infringement risk. Each monthly cat character is uniquely designed in a bold graphic novel style.' },
      { q: 'What is the Digital Calendar Sync?', a: 'A QR code on the back cover gives you a live Google/Apple Calendar subscription that auto-updates when conventions get rescheduled, cancelled, or added. Free with any physical calendar purchase.' },
    ],
  },
  {
    title: 'Shipping',
    icon: Truck,
    items: [
      { q: 'How much is shipping?', a: 'Standard shipping (5-7 business days via USPS First Class) is $5.99. Priority shipping (2-3 days) is $9.99. Orders over $50 get FREE standard shipping!' },
      { q: 'How are calendars packaged?', a: 'All calendars ship in rigid stay-flat mailers to prevent bending. Deluxe ships in a branded rigid mailer with tissue paper. Premium ships in a custom printed rigid box.' },
      { q: 'Do you ship internationally?', a: 'Currently we only ship within the United States. International shipping may be available in the future.' },
      { q: 'When do pre-orders ship?', a: 'Pre-orders ship starting November 15, 2026. Pre-order customers are fulfilled first before regular orders.' },
    ],
  },
  {
    title: 'Payment',
    icon: CreditCard,
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards through Stripe. At convention booths, we also accept Cash, Venmo, CashApp, and Square.' },
      { q: 'Is my payment information secure?', a: 'Absolutely. We use Stripe for all online payments — we never see or store your card details. Everything is encrypted end-to-end.' },
      { q: 'What is your refund policy?', a: 'We want you to love your calendar. If it arrives damaged, contact us within 7 days with photos and we\'ll send a replacement. Pre-orders can be cancelled before the shipping date.' },
    ],
  },
  {
    title: 'Conventions',
    icon: Calendar,
    items: [
      { q: 'Which conventions are included?', a: '39+ Midwest anime conventions across MI, IL, IN, OH, WI, MN, MO, KY, and IA. Priority cons include Youmacon, Anime Central, Anime Midwest, Colossalcon, and many more.' },
      { q: 'What if a convention gets cancelled or rescheduled?', a: 'That\'s the beauty of the Digital Calendar Sync — it auto-updates. The printed calendar shows dates as of our print deadline, but the digital version stays current.' },
      { q: 'Will you be at any conventions?', a: 'Yes! Follow us on Instagram @neko313circuit for booth announcements. We plan to attend 5-12 Midwest conventions in 2026.' },
    ],
  },
];

export default function FaqClient() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...(prev ?? {}), [key]: !prev?.[key] }));
  };

  return (
    <div className="min-h-screen bg-void">
      <Header />

      <section className="pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <SectionHeading
            title="FREQUENTLY ASKED QUESTIONS"
            subtitle="Everything you need to know about Neko Circuit calendars, shipping, and conventions."
            icon={HelpCircle}
          />
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          {FAQ_SECTIONS.map((section, si) => (
            <div key={si} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="w-4 h-4 text-neon-magenta" />
                <h3 className="font-display text-lg tracking-wider text-white">{section.title}</h3>
              </div>
              <div className="space-y-2">
                {section.items.map((item, qi) => {
                  const key = `${si}-${qi}`;
                  const isOpen = openItems?.[key] ?? false;
                  return (
                    <div key={key} className="bg-void-light rounded-lg border border-white/5 overflow-hidden">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <span className="text-sm text-white font-medium pr-4">{item.q}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4">
                              <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
