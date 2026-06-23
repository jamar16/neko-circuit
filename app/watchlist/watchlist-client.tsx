'use client';

import { useState } from 'react';
import { Eye, Bell, ArrowRight, Check, MapPin, Loader2, BellRing } from 'lucide-react';

interface WatchlistCon {
  name: string;
  city: string;
  state: string;
  month: string;
}

function toConId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function NotifyMeInline({ con }: { con: WatchlistCon }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrMsg('');
    try {
      const res = await fetch('/api/watchlist-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), conventionId: toConId(con.name), conventionName: con.name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Something went wrong');
      if (data?.message?.includes('Already')) {
        setStatus('already');
      } else {
        setStatus('success');
      }
      setEmail('');
    } catch (err: any) {
      setErrMsg(err?.message || 'Failed');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
        <Check className="w-3.5 h-3.5" /> Watching
      </span>
    );
  }

  if (status === 'already') {
    return (
      <span className="inline-flex items-center gap-1.5 text-neon-cyan text-xs font-medium">
        <BellRing className="w-3.5 h-3.5" /> Already watching
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neon-cyan border border-neon-cyan/30 rounded-lg bg-neon-cyan/5 hover:bg-neon-cyan/10 transition-all whitespace-nowrap"
      >
        <Bell className="w-3 h-3" /> Notify me
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="email"
        required
        autoFocus
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-[160px] px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan/40 transition-all"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neon-cyan text-void font-bold text-xs rounded-lg hover:bg-neon-cyan/90 disabled:opacity-60 transition-all whitespace-nowrap"
      >
        {status === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setErrMsg(''); }}
        className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
      >
        ✕
      </button>
      {status === 'error' && errMsg && <span className="text-red-400 text-[10px]">{errMsg}</span>}
    </form>
  );
}

// Parsed from koneko_watchlist_2026.csv — static watchlist data
const WATCHLIST: WatchlistCon[] = [
  { name: 'Zipcon', city: 'Akron', state: 'OH', month: 'TBA' },
  { name: 'Indiana Comic Con', city: 'Indianapolis', state: 'IN', month: 'TBA' },
  { name: 'Shoufu-Con', city: 'Lansing', state: 'MI', month: 'TBA' },
  { name: 'Motor City Comic Con', city: 'Novi', state: 'MI', month: 'TBA' },
  { name: 'Collect-A-Con Chicago', city: 'Rosemont', state: 'IL', month: 'TBA' },
  { name: 'AniMinneapolis', city: 'Minneapolis', state: 'MN', month: 'TBA' },
  { name: 'ConComics Indy', city: 'Indianapolis', state: 'IN', month: 'TBA' },
  { name: 'Anime Ink Con', city: 'Cincinnati', state: 'OH', month: 'TBA' },
  { name: 'Grand Rapids Comic Con', city: 'Grand Rapids', state: 'MI', month: 'TBA' },
  { name: 'JAFAX', city: 'Grand Rapids', state: 'MI', month: 'Jun' },
  { name: 'Matsuricon', city: 'Columbus', state: 'OH', month: 'TBA' },

  { name: 'Wizard World Chicago', city: 'Chicago', state: 'IL', month: 'TBA' },
  { name: 'KawaiiKon Midwest', city: 'St. Louis', state: 'MO', month: 'TBA' },
  { name: 'Nan Desu Kan', city: 'Chicago', state: 'IL', month: 'TBA' },
  { name: 'Animarathon', city: 'Bowling Green', state: 'OH', month: 'TBA' },
  { name: 'Kalamazoo Comic Con', city: 'Kalamazoo', state: 'MI', month: 'TBA' },
  { name: 'Midwest GameFest', city: 'Milwaukee', state: 'WI', month: 'TBA' },
  { name: 'Archon', city: 'St. Louis', state: 'MO', month: 'TBA' },
  { name: 'Michigan Comic Con', city: 'Novi', state: 'MI', month: 'TBA' },
  { name: 'Tokyo in Tulsa Midwest', city: 'Chicago', state: 'IL', month: 'TBA' },
  { name: 'Hallowcon', city: 'Cleveland', state: 'OH', month: 'TBA' },
  { name: 'WindyCon', city: 'Chicago', state: 'IL', month: 'TBA' },
  { name: 'Detroit Fanfare', city: 'Dearborn', state: 'MI', month: 'TBA' },
  { name: 'Con Alt Delete', city: 'Louisville', state: 'KY', month: 'TBA' },
  { name: 'Midwest FurFest', city: 'Rosemont', state: 'IL', month: 'TBA' },
  { name: 'Galaxy Con Columbus', city: 'Columbus', state: 'OH', month: 'TBA' },
  { name: 'IKKiCON Midwest', city: 'Chicago', state: 'IL', month: 'TBA' },
  { name: 'Holiday Matsuri Midwest', city: 'Indianapolis', state: 'IN', month: 'TBA' },
];

export default function WatchlistClient() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'watchlist' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Something went wrong');
      }
      setStatus('success');
      setEmail('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to subscribe');
      setStatus('error');
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 via-void to-void" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-neon-cyan border border-neon-cyan/30 rounded-full bg-neon-cyan/5">
            <Eye className="w-3.5 h-3.5" />
            Monitoring 29 Events
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            The 2026 Circuit Watchlist
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-[600px] mx-auto leading-relaxed">
            29 potential cons. No confirmed dates yet. We track them so you don&apos;t have to.
          </p>
        </div>
      </section>

      {/* Email Capture */}
      <section className="pb-10 md:pb-14">
        <div className="max-w-[560px] mx-auto px-4 sm:px-6">
          <div className="rounded-2xl border border-neon-cyan/20 bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-neon-cyan" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Get Notified</h2>
            </div>

            {status === 'success' ? (
              <div className="flex items-center gap-3 text-emerald-400">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">You&apos;re on the list. We&apos;ll email you when a con confirms.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-neon-cyan text-void font-bold text-sm rounded-xl hover:bg-neon-cyan/90 disabled:opacity-60 transition-all whitespace-nowrap"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Alert me when they confirm
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {status === 'error' && errorMsg && (
              <p className="mt-2 text-xs text-red-400">{errorMsg}</p>
            )}

            <p className="mt-3 text-[11px] text-gray-600">
              No spam. One email per confirmation. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Watchlist Table */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-xl font-bold text-white">All 29 Watchlist Events</h2>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block rounded-2xl border border-white/[0.06] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Convention
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    City
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    State
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Month (Est.)
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Alerts
                  </th>
                </tr>
              </thead>
              <tbody>
                {WATCHLIST.map((con, i) => (
                  <tr
                    key={con.name}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${
                      i % 2 === 0 ? 'bg-white/[0.01]' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-white">{con.name}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-neon-cyan/50" />
                        {con.city}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{con.state}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {con.month}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <NotifyMeInline con={con} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {WATCHLIST.map((con) => (
              <div
                key={con.name}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{con.name}</h3>
                  <span className="flex-shrink-0 inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {con.month}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {con.city}, {con.state}
                </p>
                <div className="mt-3">
                  <NotifyMeInline con={con} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
