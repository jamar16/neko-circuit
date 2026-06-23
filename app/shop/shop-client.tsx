'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Package, Star, Sparkles, Crown, Gift, Layers } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import ProductCard from '../components/product-card';
import SectionHeading from '../components/section-heading';
import { useCartStore } from '@/store/cart-store';
import { IMAGES } from '@/lib/constants';
import Image from 'next/image';

export default function ShopClient({ conventionCount = 0 }: { conventionCount?: number }) {
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => { if (Array.isArray(d)) setProducts(d); }).catch(console.error);
  }, []);

  const filtered = filter === 'all'
    ? products
    : filter === 'bundles'
      ? (products ?? []).filter((p: any) => p?.tier === 'bundle')
      : (products ?? []).filter((p: any) => p?.tier === filter);

  const calendars = (products ?? []).filter((p: any) => ['standard','deluxe','premium'].includes(p?.tier));
  const bundles = (products ?? []).filter((p: any) => p?.tier === 'bundle');
  const accessories = (products ?? []).filter((p: any) => ['sticker','print','digital'].includes(p?.tier));

  return (
    <div className="min-h-screen bg-void">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-void-light halftone" />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
          <SectionHeading
            title="THE FULL LINEUP"
            subtitle="Every edition of the Neko Circuit 2026 calendar, plus bundles, stickers, and prints."
            icon={Store}
          />

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[{k:'all',l:'All',i:Layers},{k:'standard',l:'Standard',i:Star},{k:'deluxe',l:'Deluxe',i:Sparkles},{k:'premium',l:'Premium',i:Crown},{k:'bundles',l:'Bundles',i:Gift}].map(t => (
              <button
                key={t.k}
                onClick={() => setFilter(t.k)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  filter === t.k
                    ? 'bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/30'
                    : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <t.i className="w-3.5 h-3.5" />
                {t.l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {filter === 'all' ? (
            <>
              {/* Calendars */}
              {calendars.length > 0 && (
                <div className="mb-16">
                  <h3 className="font-display text-2xl text-white tracking-wide mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-neon-magenta" /> Calendars
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {calendars.map((p: any) => (
                      <ProductCard key={p?.id} {...p} featured={p?.tier === 'deluxe'} />
                    ))}
                  </div>
                </div>
              )}

              {/* Bundles */}
              {bundles.length > 0 && (
                <div className="mb-16">
                  <h3 className="font-display text-2xl text-white tracking-wide mb-6 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-neon-cyan" /> Bundles
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bundles.map((p: any) => (
                      <ProductCard key={p?.id} {...p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Accessories */}
              {accessories.length > 0 && (
                <div className="mb-16">
                  <h3 className="font-display text-2xl text-white tracking-wide mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" /> Accessories
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accessories.map((p: any) => (
                      <ProductCard key={p?.id} {...p} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filtered ?? []).map((p: any) => (
                <ProductCard key={p?.id} {...p} featured={p?.tier === 'deluxe'} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-sm">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-void-light">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <h3 className="font-display text-2xl text-white tracking-wide mb-8 text-center">COMPARE EDITIONS</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-4">Feature</th>
                  <th className="text-center text-xs text-neon-cyan uppercase tracking-wider py-3 px-4">Standard</th>
                  <th className="text-center text-xs text-neon-magenta uppercase tracking-wider py-3 px-4">Deluxe</th>
                  <th className="text-center text-xs text-yellow-400 uppercase tracking-wider py-3 px-4">Premium</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['12 Original Art Prints', true, true, true],
                  [`${conventionCount}+ Convention Dates`, true, true, true],
                  ['75+ Character Birthdays', true, true, true],
                  ['QR Digital Calendar Sync', true, true, true],
                  ['24 Die-Cut Vinyl Stickers', false, true, true],
                  ['Bonus 13th Art Print', false, true, true],
                  ['Con Survival Checklist', false, true, true],
                  ['Magnetic Backing', false, false, true],
                  ['Gold Foil Stamping', false, false, true],
                  ['Mini Art Book', false, false, true],
                  ['Numbered Certificate', false, false, true],
                  ['Custom Box Packaging', false, false, true],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-3 px-4 text-gray-400">{row[0]}</td>
                    {[row[1], row[2], row[3]].map((val, j) => (
                      <td key={j} className="text-center py-3 px-4">
                        {val ? <span className="text-neon-cyan">✓</span> : <span className="text-gray-700">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-white/10">
                  <td className="py-4 px-4 font-semibold text-white">Price</td>
                  <td className="text-center py-4 px-4 font-display text-xl text-white">$24.99</td>
                  <td className="text-center py-4 px-4 font-display text-xl text-neon-magenta">$44.99</td>
                  <td className="text-center py-4 px-4 font-display text-xl text-yellow-400">$84.99</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
