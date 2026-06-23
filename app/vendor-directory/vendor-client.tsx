'use client';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, ExternalLink, Instagram, Globe, ChevronDown, Plus } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import SectionHeading from '../components/section-heading';
import Image from 'next/image';
import { IMAGES, GOOGLE_FORM_URL } from '@/lib/constants';

const CATEGORIES = ['All', 'Artist Alley', "Dealer's Room", 'Food Vendor', 'Cosplay Props', 'Prints & Posters', 'Plushies & Figures', 'Clothing & Accessories'];

const CATEGORY_EMOJIS: Record<string, string> = {
  'Artist Alley': '🎨',
  "Dealer's Room": '📚',
  'Food Vendor': '🍡',
  'Cosplay Props': '⚔️',
  'Prints & Posters': '🖼️',
  'Plushies & Figures': '🧸',
  'Clothing & Accessories': '👕',
  'Other': '🏪',
};

export default function VendorClient() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  useEffect(() => {
    fetch('/api/vendors').then(r => r.json()).then(d => { if (Array.isArray(d)) setVendors(d); }).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return (vendors ?? []).filter((v: any) => {
      const matchSearch = !search || (v?.name ?? '').toLowerCase().includes(search.toLowerCase()) || (v?.convention ?? '').toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'All' || v?.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [vendors, search, catFilter]);

  return (
    <div className="min-h-screen bg-void">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={IMAGES.vendor} alt="Vendor directory hero" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/90 to-void" />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
          <SectionHeading
            title="VENDOR DIRECTORY"
            subtitle="Find your favorite artists and vendors at every Midwest anime convention."
            icon={Users}
            accentColor="cyan"
          />
          <div className="flex justify-center">
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon px-6 py-3 rounded-lg inline-flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Your Booth
            </a>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendors or conventions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-void-light border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 rounded-lg bg-void-light border border-white/10 text-sm text-white appearance-none focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">{filtered.length} vendors listed</p>
        </div>
      </section>

      {/* Vendor Grid */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((v: any, i: number) => (
                <motion.div
                  key={v?.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className="bg-void-light rounded-xl p-5 border border-white/5 card-hover"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                      {CATEGORY_EMOJIS[v?.category] ?? '🏪'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{v?.name}</h3>
                      {v?.boothName && <p className="text-xs text-gray-500 truncate">{v.boothName}</p>}
                    </div>
                    <span className="tag-cyan text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">{v?.category}</span>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <p className="text-xs text-gray-400">📍 {v?.convention} {v?.boothNumber ? `• Booth ${v.boothNumber}` : ''}</p>
                    {v?.dates && <p className="text-xs text-gray-400">📅 {v.dates}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    {v?.instagram && (
                      <a href={`https://instagram.com/${v.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-white/5 hover:bg-neon-magenta/10 transition-colors">
                        <Instagram className="w-3.5 h-3.5 text-gray-400 hover:text-neon-magenta" />
                      </a>
                    )}
                    {v?.website && (
                      <a href={v.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-white/5 hover:bg-neon-cyan/10 transition-colors">
                        <Globe className="w-3.5 h-3.5 text-gray-400 hover:text-neon-cyan" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No vendors found. Be the first to list your booth!</p>
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-neon px-6 py-3 rounded-lg inline-flex items-center gap-2 text-sm mt-4"
              >
                <Plus className="w-4 h-4" /> Submit Your Booth
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
