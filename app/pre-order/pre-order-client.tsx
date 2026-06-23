'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Gift, Sparkles, Check, ArrowRight, ShieldCheck, Truck, Package, Calendar } from 'lucide-react';
import Image from 'next/image';
import Header from '../components/header';
import Footer from '../components/footer';
import { useCartStore } from '@/store/cart-store';
import { IMAGES } from '@/lib/constants';

export default function PreOrderClient() {
  const [products, setProducts] = useState<any[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => { if (Array.isArray(d)) setProducts(d); }).catch(console.error);
  }, []);

  const preOrderProducts = (products ?? []).filter((p: any) => p?.preOrderPrice && p?.preOrderPrice > 0);

  const milestones = [
    { goal: 50, label: 'Free Digital Calendar Sync for ALL launch price orders', icon: Gift },
    { goal: 100, label: 'Bonus wallpaper pack', icon: Sparkles },
    { goal: 200, label: 'Community vote on 2027 theme', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-void">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={IMAGES.convention} alt="Pre-order hype banner" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/90 via-void/70 to-void" />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-magenta/10 border border-neon-magenta/30 mb-6">
              <Zap className="w-3.5 h-3.5 text-neon-magenta" />
              <span className="text-xs font-bold text-neon-magenta uppercase tracking-wider">Launch Pricing Is Live</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide text-white mb-4">
              LAUNCH PRICING IS LIVE —{' '}
              <span className="text-neon-magenta">LOCK IN YOUR PRICE</span>
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-lg mx-auto mb-4">
              Order today. On your wall within 7–10 business days.
            </p>
            <p className="text-neon-cyan text-sm md:text-base font-semibold max-w-lg mx-auto mb-8">
              ACen is May 15. Get yours before the con.
            </p>
            <a
              href="#tiers"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-neon-magenta text-white font-bold text-sm uppercase tracking-wider hover:bg-neon-magenta/90 transition-colors"
            >
              <Zap className="w-4 h-4" /> Get Launch Price
            </a>
          </motion.div>
        </div>
      </section>

      {/* Pre-order products */}
      <section id="tiers" className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl text-white tracking-wide mb-2">CHOOSE YOUR TIER</h2>
            <p className="text-gray-400 text-sm">Ships within 7–10 business days via Lulu Direct</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {preOrderProducts.map((p: any, i: number) => {
              const savings = ((p?.price ?? 0) - (p?.preOrderPrice ?? 0));
              return (
                <motion.div
                  key={p?.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-void-light rounded-xl border border-white/10 p-6 card-hover relative"
                >
                  {savings > 5 && (
                    <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-neon-magenta text-white text-[10px] font-bold uppercase tracking-wider">
                      Exclusive Access
                    </div>
                  )}
                  {p?.image && (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-void">
                      <Image src={p.image} alt={p?.name ?? 'Product'} fill className="object-cover" />
                    </div>
                  )}
                  <h3 className="font-display text-lg text-white tracking-wide mb-2">{p?.name}</h3>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-gray-500 line-through text-sm">${p?.price?.toFixed?.(2)}</span>
                    <span className="font-display text-2xl text-neon-magenta">${p?.preOrderPrice?.toFixed?.(2)}</span>
                  </div>
                  <span className="text-xs text-neon-cyan font-semibold">Exclusive Access</span>

                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    <Truck className="w-3.5 h-3.5 text-gray-500" />
                    <span>Ships in 7–10 business days</span>
                  </div>

                  <button
                    onClick={() => addItem({
                      id: p?.id ?? '',
                      sku: p?.sku ?? '',
                      name: p?.name ?? '',
                      price: p?.price ?? 0,
                      preOrderPrice: p?.preOrderPrice,
                      image: p?.image,
                      tier: p?.tier ?? 'standard',
                      isPreOrder: true,
                    })}
                    className="w-full mt-4 py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider bg-neon-magenta text-white hover:bg-neon-magenta/90 transition-colors"
                  >
                    <Zap className="w-4 h-4" /> Get Launch Price
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shipping info banner */}
      <section className="py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="rounded-xl bg-void-lighter border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Package className="w-10 h-10 text-neon-cyan flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Ships within 7–10 business days via Lulu Direct</h4>
              <p className="text-gray-400 text-xs">Arrives in rigid stay-flat mailer — no bending. Deluxe &amp; Premium tiers ship free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-void-light">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <h3 className="font-display text-2xl text-white tracking-wide text-center mb-10">LAUNCH MILESTONES</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-void rounded-xl p-6 border border-white/5 text-center card-hover"
              >
                <m.icon className="w-8 h-8 text-neon-cyan mx-auto mb-4" />
                <span className="font-display text-3xl text-white">{m.goal}</span>
                <p className="text-xs text-gray-500 mt-1">orders</p>
                <p className="text-sm text-gray-400 mt-3">{m.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Secure Payment', desc: 'Encrypted checkout via Stripe' },
              { icon: Truck, title: 'Fast Fulfillment', desc: 'Ships within 7–10 business days via Lulu Direct' },
              { icon: Package, title: 'Stay-Flat Mailer', desc: 'Arrives in rigid mailer — no bending' },
            ].map((g, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.02]">
                <g.icon className="w-6 h-6 text-neon-magenta flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{g.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
