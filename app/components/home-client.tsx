'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Sparkles, Calendar, MapPin, Users, Zap, ChevronRight, Truck } from 'lucide-react';
import Header from './header';
import Footer from './footer';
import ProductCard from './product-card';
import AnimatedCounter from './animated-counter';
import SectionHeading from './section-heading';
import EmailCapture from './email-capture';
import { IMAGES, BRAND } from '@/lib/constants';

interface NextHeroCon {
  name: string;
  dateLabel: string;
}

export default function HomeClient({ children, conventionCount = 0, nextHeroCon }: { children?: React.ReactNode; conventionCount?: number; nextHeroCon?: NextHeroCon | null }) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setProducts(d); })
      .catch(console.error);
  }, []);

  const mainProducts = (products ?? []).filter((p: any) => ['standard', 'deluxe', 'premium'].includes(p?.tier));

  return (
    <div className="min-h-screen bg-void">
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* BG Image */}
        <div className="absolute inset-0">
          <Image src={IMAGES.hero} alt="Neko Circuit cyberpunk cityscape" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/60 to-void" />
          <div className="absolute inset-0 halftone" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-magenta/10 border border-neon-magenta/30 mb-6">
                  <Zap className="w-3.5 h-3.5 text-neon-magenta" />
                  <span className="text-xs font-bold text-neon-magenta uppercase tracking-wider">2026 Edition — Now Shipping</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wide leading-[0.9] text-white mb-6"
              >
                NEVER MISS A<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-magenta to-neon-cyan">MIDWEST ANIME CON</span>
                <br />AGAIN.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base sm:text-lg text-gray-400 max-w-lg mb-8 leading-relaxed"
              >
                {conventionCount} conventions. 12 months of original art. One calendar. <span className="text-neon-cyan">Ships in 7–10 days.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                <Link href="/shop" className="btn-neon px-8 py-3.5 rounded-lg flex items-center gap-2 text-sm">
                  Shop Now — From $24.99 <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/pre-order" className="btn-outline-neon px-8 py-3.5 rounded-lg flex items-center gap-2 text-sm">
                  Get Launch Price <Zap className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Hero Product Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[3/4] max-w-[380px] mx-auto">
                <div className="absolute inset-0 rounded-xl overflow-hidden glow-box-magenta">
                  <Image src="/images/v5/02.png" alt="Neko Circuit 2026 anime convention calendar — January spread preview" fill className="object-contain rounded-xl bg-void" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-neon-magenta" />
          </div>
        </motion.div>
      </section>

      {/* ===== DYNAMIC SECTIONS (server-injected) ===== */}
      {children}

      {/* ===== STATS MARQUEE ===== */}
      <section className="py-6 bg-void-light border-y border-white/5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-12 px-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neon-magenta" />
                <span className="text-sm font-bold text-white"><AnimatedCounter end={conventionCount} suffix="+" /> Conventions</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm font-bold text-white"><AnimatedCounter end={9} /> States Covered</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-magenta" />
                <span className="text-sm font-bold text-white"><AnimatedCounter end={12} /> Original Art Prints</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm font-bold text-white">Ships in 7–10 Days</span>
              </div>
              <span className="text-gray-600">•</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRODUCTS ===== */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <SectionHeading
            title="CHOOSE YOUR EDITION"
            subtitle="Three tiers of anime calendar perfection. Every edition features 12 months of original artwork."
            icon={Sparkles}
            accentColor="magenta"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainProducts.map((p: any) => (
              <ProductCard
                key={p?.id}
                id={p?.id ?? ''}
                sku={p?.sku ?? ''}
                name={p?.name ?? ''}
                description={p?.description ?? ''}
                price={p?.price ?? 0}
                preOrderPrice={p?.preOrderPrice}
                image={p?.image}
                tier={p?.tier ?? 'standard'}
                features={p?.features}
                limitedEdition={p?.limitedEdition ?? false}
                maxUnits={p?.maxUnits}
                unitsSold={p?.unitsSold ?? 0}
                featured={p?.tier === 'deluxe'}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/shop" className="btn-outline-neon px-8 py-3 rounded-lg inline-flex items-center gap-2 text-sm">
              View All Products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ARTWORK PREVIEW ===== */}
      <section className="py-20 bg-void-light halftone-lg relative">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <SectionHeading
            title="GALLERY-QUALITY ART EVERY MONTH"
            subtitle="Bold graphic novel aesthetic — thick black inks, halftone dots, neon accent colors"
            icon={Star}
            accentColor="cyan"
          />

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[3/4] rounded-xl overflow-hidden card-hover bg-void"
            >
              <Image src={IMAGES.august} alt="August artwork - DJ anime cat at convention rave" fill className="object-contain" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-void/90 to-transparent">
                <span className="tag-magenta text-[10px] font-bold px-2 py-1 rounded-full">AUGUST</span>
                <p className="text-white font-display text-lg tracking-wide mt-2">Peak Con Season / Obon</p>
                <p className="text-xs text-gray-400">DJ cat at convention rave — Movement Detroit-inspired</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[3/4] rounded-xl overflow-hidden card-hover bg-void"
            >
              <Image src={IMAGES.november} alt="November artwork - anime cat in Detroit cityscape" fill className="object-contain" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-void/90 to-transparent">
                <span className="tag-cyan text-[10px] font-bold px-2 py-1 rounded-full">NOVEMBER</span>
                <p className="text-white font-display text-lg tracking-wide mt-2">Culture Day / Youmacon</p>
                <p className="text-xs text-gray-400">Cat in Detroit cityscape — Renaissance Center backdrop</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CONVENTION TEASER ===== */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 circuit-lines opacity-30" />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
          <SectionHeading
            title="EVERY MIDWEST CON. ONE CALENDAR."
            subtitle="Every major Midwest con. All in one place."
            icon={Calendar}
            accentColor="magenta"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { name: 'Youmacon', city: 'Detroit, MI', month: 'Nov' },
              { name: 'ACen', city: 'Rosemont, IL', month: 'May' },
              { name: 'Gen Con', city: 'Indianapolis, IN', month: 'Aug' },
              { name: 'Colossalcon', city: 'Sandusky, OH', month: 'Jun' },
            ].map((con, i) => (
              <motion.div
                key={con.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-void-light rounded-lg p-4 border border-white/5 card-hover"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-neon-magenta" />
                  <span className="text-xs text-gray-500">{con.city}</span>
                </div>
                <h4 className="font-display text-lg text-white tracking-wide">{con.name}</h4>
                <span className="tag-cyan text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block">{con.month} 2026</span>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/conventions" className="btn-neon px-8 py-3 rounded-lg inline-flex items-center gap-2 text-sm">
              See All {conventionCount}+ Conventions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-void-light relative overflow-hidden">
        <div className="absolute inset-0 stripe-accent" />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white tracking-wide mb-4">
              {nextHeroCon
                ? <>{nextHeroCon.name.toUpperCase()} IS {nextHeroCon.dateLabel.toUpperCase()}. <span className="text-neon-magenta">ARE YOU ON THE CIRCUIT?</span></>
                : <>NEXT CON IS COMING. <span className="text-neon-magenta">ARE YOU ON THE CIRCUIT?</span></>
              }
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">{conventionCount} Midwest cons. 12 months of original art. Never miss a con again.</p>
            <Link href="/shop" className="btn-neon px-10 py-4 rounded-lg inline-flex items-center gap-2 text-sm font-bold">
              Get Your Calendar <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== EMAIL CAPTURE ===== */}
      <section className="py-16 relative overflow-hidden">
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-500 text-sm mb-4">Stay on the circuit — get drop alerts &amp; con updates</p>
          <div className="flex justify-center">
            <EmailCapture source="homepage" />
          </div>
          <p className="text-[10px] text-gray-600 mt-4">No spam. Unsubscribe anytime. Your data stays private.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
