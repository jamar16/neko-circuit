'use client';

import Link from 'next/link';
import { MapPin, Calendar, Users, ExternalLink, ChevronDown } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Shared EventCard — used by ALL list/grid card locations            */
/* ------------------------------------------------------------------ */

export interface EventCardData {
  /** Unique id for expand toggle keying */
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  venue?: string | null;
  startDate?: string | null; // ISO string
  endDate?: string | null;
  type?: string | null;
  slug?: string | null;
  website?: string | null;
  attendance?: number | null;
  description?: string | null;
  /** For "X days away" pill */
  daysUntil?: number | null;
  /** If true, renders a FEATURED badge */
  featured?: boolean;
  /** Custom tag label + color (Metro Detroit Scene items) */
  customTag?: { label: string; color: string } | null;
  /** Optional meta text (e.g. "214 responded", "18+") */
  meta?: string | null;
  /** Date string to show in badge when startDate is absent (e.g. "Jun 20") */
  dateBadgeText?: string | null;
  /** True for ongoing venues (no specific date) */
  ongoing?: boolean;
}

interface EventCardProps {
  data: EventCardData;
  isExpanded: boolean;
  onToggle: () => void;
  /** Card sizing variant */
  variant?: 'scroll' | 'grid';
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TYPE_COLORS: Record<string, string> = {
  'Convention': 'bg-neon-magenta/20 text-neon-magenta border-neon-magenta/30',
  'Local Scene': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Tournament': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Meetup': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Pop-Up': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'Watch Party': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

function getTypeTag(type: string | null | undefined): { label: string; color: string } | null {
  if (!type) return null;
  const color = TYPE_COLORS[type] ?? 'bg-white/10 text-gray-400 border-white/20';
  return { label: type, color };
}

function formatShortDate(iso: string): { month: string; day: number } {
  const d = new Date(iso);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
    day: d.getUTCDate(),
  };
}

export function formatDateRange(start: string | null | undefined, end: string | null | undefined): string {
  if (!start) return 'Dates not yet announced';
  const s = new Date(start);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  if (!end) return s.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  const e = new Date(end);
  if (s.getTime() === e.getTime()) {
    return s.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  }
  if (s.getUTCMonth() === e.getUTCMonth()) {
    return `${s.toLocaleDateString('en-US', opts)}–${e.getUTCDate()}, ${e.getUTCFullYear()}`;
  }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EventCard({ data, isExpanded, onToggle, variant = 'grid' }: EventCardProps) {
  const {
    name, city, state, venue, startDate, endDate, type,
    slug, website, attendance, description, daysUntil,
    featured, customTag, meta, dateBadgeText,
  } = data;

  const tag = customTag ?? getTypeTag(type);
  const dated = startDate ? formatShortDate(startDate) : null;
  const resolvedSlug = slug ?? toSlug(name);

  // Attendance display
  const attendanceText = attendance && attendance > 0
    ? `~${attendance.toLocaleString()} attendees`
    : 'Attendance: TBA';

  // Venue display
  const venueText = venue ?? 'Venue: TBA';

  // Date display — badge and body must never contradict
  const dateRangeText = data.ongoing
    ? 'Ongoing'
    : startDate
      ? formatDateRange(startDate, endDate)
      : dateBadgeText
        ? dateBadgeText
        : 'Dates not yet announced';

  // Scroll variant is narrower
  const isScroll = variant === 'scroll';

  return (
    <div
      onClick={onToggle}
      className={[
        'group rounded-2xl border p-5 transition-all duration-300 select-none cursor-pointer h-full',
        isScroll ? (isExpanded ? 'w-[320px] sm:w-[360px]' : 'w-[260px] sm:w-[280px]') : '',
        isScroll ? 'flex-shrink-0 snap-start' : '',
        isExpanded
          ? 'border-neon-magenta/40 bg-white/[0.06]'
          : featured
            ? 'border-neon-magenta/30 bg-white/[0.03] hover:bg-white/[0.06]'
            : 'border-white/[0.06] bg-white/[0.03] hover:border-neon-magenta/30 hover:bg-white/[0.06]',
      ].filter(Boolean).join(' ')}
    >
      {/* Header row: date badge + tag + chevron */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-14 h-14 rounded-xl bg-neon-magenta/10 border border-neon-magenta/20 flex flex-col items-center justify-center flex-shrink-0">
          {dated ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neon-magenta">{dated.month}</span>
              <span className="text-lg font-black text-white leading-none">{dated.day}</span>
            </>
          ) : dateBadgeText ? (
            <span className="text-xs font-bold text-white text-center leading-tight px-1">{dateBadgeText}</span>
          ) : (
            <span className="text-xs font-bold text-gray-500">TBA</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {featured && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/30">
              FEATURED
            </span>
          )}
          {tag && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${tag.color}`}>
              {tag.label}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Name */}
      <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-neon-magenta transition-colors leading-snug">
        {name}
      </h3>

      {/* Venue */}
      <p className="text-xs text-gray-500 mb-1 truncate">{venueText}</p>

      {/* Location */}
      {(city || state) && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-neon-cyan/60 flex-shrink-0" />
          {[city, state].filter(Boolean).join(', ')}
        </p>
      )}

      {/* Date range */}
      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <Calendar className="w-3 h-3 text-neon-cyan/60 flex-shrink-0" />
        {dateRangeText}
      </p>

      {/* Days-until pill */}
      {daysUntil != null && daysUntil >= 0 && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20">
          <Calendar className="w-3 h-3 text-neon-cyan" />
          <span className="text-xs font-bold text-neon-cyan">
            {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? '1 day away' : `${daysUntil} days away`}
          </span>
        </div>
      )}

      {/* Meta text */}
      {meta && (
        <p className="text-[10px] text-gray-500 mt-1">{meta}</p>
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Attendance */}
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Users className="w-3 h-3 text-gray-500 flex-shrink-0" />
            {attendanceText}
          </p>

          {/* Description */}
          {description && (
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">{description}</p>
          )}

          {/* Action links */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            {resolvedSlug && (
              <Link
                href={`/conventions/${resolvedSlug}`}
                className="text-[11px] font-medium text-neon-magenta hover:text-neon-magenta/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Full Details →
              </Link>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Visit Official Site <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
