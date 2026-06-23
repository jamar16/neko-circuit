'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { IMAGES } from '@/lib/constants';
import EventCard, { type EventCardData } from './event-card';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DetroitEvent {
  id: string;
  name: string;
  city: string;
  state: string;
  venue: string | null;
  startDate: string | null; // ISO string
  endDate: string | null;
  type: string | null;
  slug: string;
  website: string | null;
  attendance: number | null;
  description: string | null;
}

export interface NextHeroCon {
  name: string;
  dateLabel: string; // e.g. "July 3"
}

export interface UpcomingCon {
  id: string;
  name: string;
  city: string;
  state: string;
  venue: string | null;
  startDate: string; // ISO string
  endDate: string | null;
  type: string | null;
  slug: string;
  daysUntil: number;
  website: string | null;
  attendance: number | null;
  description: string | null;
}

interface Props {
  detroitEvents: DetroitEvent[];
  upcomingCons: UpcomingCon[];
  detroitHeading: string; // "This Month in Detroit" or fallback label
  conventionCount?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Section A — Detroit Scroll Row                                     */
/* ------------------------------------------------------------------ */

function DetroitScrollRow({ events, heading }: { events: DetroitEvent[]; heading: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; scrollLeft: number } | null>(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll, events]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('[data-card]')?.clientWidth ?? 280;
    el.scrollBy({ left: dir === 'left' ? -cardWidth - 16 : cardWidth + 16, behavior: 'smooth' });
  };

  // Drag-scroll for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft };
    setIsDragging(false);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current || !scrollRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 4) setIsDragging(true);
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  };
  const onMouseUp = () => { dragStart.current = null; };

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { scroll('left'); e.preventDefault(); }
    if (e.key === 'ArrowRight') { scroll('right'); e.preventDefault(); }
  };

  if (events.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-block mb-3 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-neon-cyan border border-neon-cyan/30 rounded-full bg-neon-cyan/5">
              Local Scene
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wide text-white">
              {heading}
            </h2>
          </div>
          {/* Desktop arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="p-2 rounded-full border border-white/10 bg-white/5 text-white disabled:opacity-30 disabled:cursor-default hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="p-2 rounded-full border border-white/10 bg-white/5 text-white disabled:opacity-30 disabled:cursor-default hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scroll row */}
        <div
          ref={scrollRef}
          role="region"
          aria-label={heading}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className={[
            'flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory',
            'pb-4 -mb-4',                   // hide scrollbar visually
            'scrollbar-none',                // webkit/firefox
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 rounded-xl',
          ].join(' ')}
          style={{ scrollPaddingInline: '16px' }}
        >
          {events.map((ev) => {
            const cardData: EventCardData = {
              id: ev.id, name: ev.name, city: ev.city, state: ev.state,
              venue: ev.venue, startDate: ev.startDate, endDate: ev.endDate,
              type: ev.type, slug: ev.slug, website: ev.website,
              attendance: ev.attendance, description: ev.description,
            };
            return (
              <div key={ev.id} data-card draggable={false}>
                <EventCard
                  data={cardData}
                  isExpanded={expandedId === ev.id}
                  onToggle={() => { if (!isDragging) setExpandedId(expandedId === ev.id ? null : ev.id); }}
                  variant="scroll"
                />
              </div>
            );
          })}
          {/* Spacer so last card peeks */}
          <div className="flex-shrink-0 w-4" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section B — Coming Up on the Circuit                               */
/* ------------------------------------------------------------------ */

function UpcomingConsSection({ cons }: { cons: UpcomingCon[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (cons.length === 0) return null;

  return (
    <section className="pb-14 md:pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <span className="inline-block mb-3 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-neon-magenta border border-neon-magenta/30 rounded-full bg-neon-magenta/5">
            Conventions On Deck
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wide text-white">
            Coming Up on the Circuit
          </h2>
        </div>

          {cons.map((con) => {
            const cardData: EventCardData = {
              id: con.id, name: con.name, city: con.city, state: con.state,
              venue: con.venue, startDate: con.startDate, endDate: con.endDate,
              type: con.type, slug: con.slug, website: con.website,
              attendance: con.attendance, description: con.description,
              daysUntil: con.daysUntil,
            };
            return (
              <EventCard
                key={con.id}
                data={cardData}
                isExpanded={expandedId === con.id}
                onToggle={() => setExpandedId(expandedId === con.id ? null : con.id)}
              />
            );
          })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section C — Bridge CTA                                             */
/* ------------------------------------------------------------------ */

function BridgeCTA({ conventionCount = 0 }: { conventionCount?: number }) {
  return (
    <section className="pb-14 md:pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl border border-neon-magenta/30 bg-gradient-to-br from-neon-magenta/[0.08] via-void to-neon-cyan/[0.05] overflow-hidden">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 sm:p-8 md:p-10">
            {/* Calendar image */}
            <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-neon-magenta/10">
                <Image
                  src={IMAGES.standard}
                  alt="Neko Circuit 2026 Wall Calendar — Standard Edition"
                  fill
                  className="object-contain bg-void"
                  sizes="180px"
                />
              </div>
            </div>

            {/* Copy */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl tracking-wide text-white mb-3 leading-tight">
                Tired of checking? Get all {conventionCount} Midwest cons on one wall calendar.
              </h2>
              <p className="text-gray-400 text-sm sm:text-base mb-6 max-w-[500px] md:max-w-none">
                Every date, every state, on your wall. $24.99 — ships in 7–10 days.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-neon-magenta text-white font-bold rounded-full hover:bg-neon-magenta/90 transition-colors text-sm"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Metro Detroit Scene                                                */
/* ------------------------------------------------------------------ */

interface SceneItem {
  title: string;
  date: string | null; // badge text — null = ongoing
  startDate?: string | null; // ISO date for body display
  endDate?: string | null;   // ISO date for body display
  location: string;
  tag: string;
  tagColor: string;
  meta?: string;
  link: string;
  ongoing?: boolean; // true for venues (not dated events)
}

const DETROIT_SCENE_ITEMS: SceneItem[] = [
  {
    title: 'Cosplay Picnic Meetup 2026',
    date: 'Jun 6',
    startDate: '2026-06-06',
    endDate: '2026-06-06',
    location: 'Detroit Riverfront, 1340 E Atwater St',
    tag: 'COMMUNITY',
    tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    meta: '214 responded',
    link: 'https://www.facebook.com/events/1345925533139949',
  },
  {
    title: 'Glotaku — Yaoi x Yuri Detroit',
    date: 'Jun 20',
    startDate: '2026-06-20',
    endDate: '2026-06-20',
    location: 'Detroit, MI',
    tag: 'NIGHTLIFE',
    tagColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    meta: '18+',
    link: 'https://linktr.ee/glotaku',
  },
  {
    title: 'Metro Detroit Webcomicon 2026',
    date: 'Aug 1–2',
    startDate: '2026-08-01',
    endDate: '2026-08-02',
    location: 'Rust Belt Market, Ferndale MI',
    tag: 'INDIE COMICS',
    tagColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    meta: 'Vendor inquiries open',
    link: 'https://webcomicon.net',
  },
  {
    title: 'Michigan Anime District: The Big One',
    date: 'Sep 19',
    startDate: '2026-09-19',
    endDate: '2026-09-19',
    location: 'Detroit Shipping Company',
    tag: 'NIGHTLIFE',
    tagColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    link: 'https://www.facebook.com/events/2221624171661893',
  },
  {
    title: 'Mythic Forge Gaming',
    date: null,
    location: 'Madison Heights, MI',
    tag: 'VENUE',
    tagColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    link: 'https://mythicforgegames.com/collections/events',
    ongoing: true,
  },
  {
    title: 'Gotta Gacha',
    date: null,
    location: 'Warren, MI · Sun–Thu 2pm–12am · Fri–Sat 2pm–2am',
    tag: 'VENUE',
    tagColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    link: 'https://www.gottagacha.com',
    ongoing: true,
  },
];

function MetroDetroitScene() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sceneCards: EventCardData[] = DETROIT_SCENE_ITEMS.map((item) => ({
    id: item.title,
    name: item.title,
    venue: item.location,
    startDate: item.startDate ?? null,
    endDate: item.endDate ?? null,
    website: item.link,
    customTag: { label: item.tag, color: item.tagColor },
    meta: item.meta ?? null,
    dateBadgeText: item.date ?? (item.ongoing ? 'Ongoing' : null),
    ongoing: item.ongoing ?? false,
    description: null,
    attendance: null,
  }));

  return (
    <section className="pb-14 md:pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <span className="inline-block mb-3 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-emerald-400 border border-emerald-500/30 rounded-full bg-emerald-500/5">
            Local Scene
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wide text-white">
            Metro Detroit Scene
          </h2>
          <p className="text-gray-500 text-sm mt-2">Venues, events & community spots</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sceneCards.map((card) => (
            <EventCard
              key={card.id}
              data={card}
              isExpanded={expandedId === card.id}
              onToggle={() => setExpandedId(expandedId === card.id ? null : card.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function HomepageDynamicSections({ detroitEvents, upcomingCons, detroitHeading, conventionCount = 0 }: Props) {
  return (
    <>
      <DetroitScrollRow events={detroitEvents} heading={detroitHeading} />
      <MetroDetroitScene />
      <UpcomingConsSection cons={upcomingCons} />
      <BridgeCTA conventionCount={conventionCount} />
    </>
  );
}