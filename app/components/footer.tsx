'use client';
import Link from 'next/link';
import { Instagram, Mail, ArrowUpRight } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="relative bg-void-light border-t border-white/5">
      <div className="section-divider" />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-magenta to-neon-cyan flex items-center justify-center">
                <span className="text-white font-bold text-sm">NC</span>
              </div>
              <span className="font-display text-xl tracking-wider text-white">NEKO CIRCUIT</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{BRAND.tagline}</p>
            <div className="flex gap-3">
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 hover:bg-neon-magenta/20 text-gray-400 hover:text-neon-magenta transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="p-2 rounded-lg bg-white/5 hover:bg-neon-cyan/20 text-gray-400 hover:text-neon-cyan transition-all"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm tracking-widest text-neon-magenta uppercase mb-4">Navigate</h4>
            <div className="flex flex-col gap-2">
              {[{ href: '/shop', label: 'Shop' }, { href: '/conventions', label: 'Conventions' }, { href: '/contact', label: 'Contact' }].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-gray-500 hover:text-white flex items-center gap-1 transition-colors group"
                >
                  {l.label}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-sm tracking-widest text-neon-cyan uppercase mb-4">Resources</h4>
            <div className="flex flex-col gap-2 mb-6">
              {[{ href: '/watchlist', label: 'Con Watchlist' }, { href: '/conventions/detroit', label: 'Detroit Events' }, { href: '/birthdays', label: 'Birthdays' }, { href: '/sync', label: 'Calendar Sync' }, { href: '/faq', label: 'FAQ' }].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-gray-500 hover:text-white flex items-center gap-1 transition-colors group"
                >
                  {l.label}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
            <h4 className="font-display text-sm tracking-widest text-neon-cyan uppercase mb-4">Shipping</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Free shipping on orders $50+. Standard delivery 5-7 business days via USPS.</p>
            <p className="text-sm text-gray-500 mt-3">All calendars ship in rigid stay-flat mailers to prevent bending.</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2026 Neko Circuit. Original artwork only.</p>
          <div className="flex items-center gap-4">
            <Link href="/return-policy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Return Policy
            </Link>
            <p className="text-xs text-gray-600">Detroit, MI — Made with ❤️ for the anime community</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
