'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Palette, Shield, Users, Zap, Music } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import AnimatedCounter from '../components/animated-counter';
import { IMAGES, BRAND } from '@/lib/constants';

export default function AboutClient() {
  const pillars = [
    { icon: Palette, title: 'Original Artwork Only', desc: 'Every illustration is 100% original. Zero IP infringement risk. Our cats are uniquely ours.' },
    { icon: Heart, title: 'Utility Meets Wall Art', desc: 'Each month is a gallery-quality art print AND a functional convention planning tool.' },
    { icon: Users, title: 'Community-Driven', desc: 'Fans helped choose the character birthdays and convention dates. This is YOUR calendar.' },
    { icon: Zap, title: 'Digital + Physical', desc: 'QR code unlocks live calendar sync. Conventions get rescheduled? Your digital calendar auto-updates.' },
  ];

  return (
    <div className="min-h-screen bg-void">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={IMAGES.about} alt="Detroit cityscape with anime overlay" fill className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/60 to-void" />
        </div>
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-6">
              <Music className="w-3.5 h-3.5 text-neon-cyan" />
              <span className="text-xs font-bold text-neon-cyan uppercase tracking-wider">Detroit × Anime</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wide text-white mb-6 leading-[0.95]">
              BORN FROM THE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-magenta to-neon-cyan">CONVENTION FLOOR</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Neko Circuit started with a simple frustration: there was no single, beautiful calendar that tracked every Midwest anime convention. So we made one.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-void-light halftone">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl text-white tracking-wide mb-6">THE STORY</h2>
              <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                <p>We’re from Detroit. We grew up on techno, anime, and convention weekends. We’ve driven through snowstorms to get to Youmacon. We’ve waited in line at ACen at 6am. We know this world.</p>
                <p>Neko Circuit is where all of that energy lives. It’s a calendar, yes — but it’s also 12 months of original graphic novel art, a convention planning tool, a character birthday tracker, and a love letter to the Midwest anime community.</p>
                <p>Every cat character, every halftone dot, every neon glow is handcrafted with the same energy that powers Movement and anime convention raves at 2am.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative aspect-square rounded-xl overflow-hidden">
              <Image src={IMAGES.collector} alt="Premium collector edition calendar" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl text-white tracking-wide text-center mb-12">BRAND PILLARS</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-void-light rounded-xl p-6 border border-white/5 card-hover text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-neon-magenta/10 flex items-center justify-center mx-auto mb-4">
                  <p.icon className="w-6 h-6 text-neon-magenta" />
                </div>
                <h3 className="font-display text-sm tracking-wider text-white mb-2">{p.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-void-light">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 39, suffix: '+', label: 'Conventions Tracked' },
              { value: 75, suffix: '+', label: 'Character Birthdays' },
              { value: 9, suffix: '', label: 'Midwest States' },
              { value: 12, suffix: '', label: 'Original Artworks' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-xl bg-void border border-white/5"
              >
                <span className="font-display text-4xl text-neon-cyan">
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </span>
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl text-white tracking-wide mb-4">CONNECT WITH US</h2>
          <p className="text-sm text-gray-500 mb-6">Follow the convention circuit on Instagram</p>
          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon px-8 py-3 rounded-lg inline-flex items-center gap-2 text-sm"
          >
            {BRAND.instagram} on Instagram
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
