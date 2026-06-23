'use client';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Filter, ChevronDown } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import SectionHeading from '../components/section-heading';
import Image from 'next/image';
import { IMAGES } from '@/lib/constants';
import EventCard, { type EventCardData } from '../components/event-card';


const STATES = ['All States', 'MI', 'IL', 'IN', 'OH', 'WI', 'MN', 'MO', 'KY', 'IA'];
const MONTHS = ['All Months', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ConventionsClient({ initialState, conventionCount = 0, initialConventions = [] }: { initialState?: string; conventionCount?: number; initialConventions?: any[] }) {
  const [conventions, setConventions] = useState<any[]>(initialConventions);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState(
    initialState && STATES.includes(initialState) ? initialState : 'All States'
  );
  const [monthFilter, setMonthFilter] = useState('All Months');

  // Data is passed from the server component. Only fetch client-side as a
  // fallback if the server somehow passed an empty array.
  useEffect(() => {
    if (conventions.length === 0) {
      fetch('/api/conventions').then(r => r.json()).then(d => { if (Array.isArray(d)) setConventions(d); }).catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return (conventions ?? []).filter((c: any) => {
      const matchSearch = !search || (c?.name ?? '').toLowerCase().includes(search.toLowerCase()) || (c?.city ?? '').toLowerCase().includes(search.toLowerCase());
      const matchState = stateFilter === 'All States' || c?.state === stateFilter;
      const matchMonth = monthFilter === 'All Months' || (() => {
        if (!c?.startDate) return false;
        const monthIdx = MONTHS.indexOf(monthFilter) - 1;
        const startMonth = new Date(c.startDate).getMonth();
        return startMonth === monthIdx;
      })();
      return matchSearch && matchState && matchMonth;
    });
  }, [conventions, search, stateFilter, monthFilter]);


  return (
    <div className="min-h-screen bg-void">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={IMAGES.convention} alt="Anime convention scene" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/90 to-void" />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
          <SectionHeading
            title="2026 CONVENTION SCHEDULE"
            subtitle={`${conventionCount} confirmed Midwest anime cons across 9 states. Filter by location or month to plan your event season.`}
            icon={Calendar}
          />
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
                placeholder="Search cons by name or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-void-light border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-magenta/50"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 rounded-lg bg-void-light border border-white/10 text-sm text-white appearance-none focus:outline-none focus:border-neon-magenta/50 cursor-pointer"
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 rounded-lg bg-void-light border border-white/10 text-sm text-white appearance-none focus:outline-none focus:border-neon-magenta/50 cursor-pointer"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">{filtered.length} events found</p>
        </div>
      </section>

      {/* Convention List */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c: any, i: number) => {
              const cardData: EventCardData = {
                id: c?.id ?? `con-${i}`,
                name: c?.name ?? '',
                city: c?.city,
                state: c?.state,
                venue: c?.venue,
                startDate: c?.startDate,
                endDate: c?.endDate,
                slug: c?.slug,
                website: c?.website,
                attendance: c?.attendance,
                description: c?.description,
                featured: c?.featured,
              };
              return (
                <motion.div
                  key={cardData.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                >
                  <EventCard
                    data={cardData}
                    isExpanded={expandedId === cardData.id}
                    onToggle={() => setExpandedId(expandedId === cardData.id ? null : cardData.id)}
                  />
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No cons match your filters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}