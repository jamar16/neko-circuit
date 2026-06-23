'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Check, Instagram, MapPin, MessageSquare } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import SectionHeading from '../components/section-heading';
import { BRAND } from '@/lib/constants';

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-void">
      <Header />

      <section className="pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <SectionHeading
            title="GET IN TOUCH"
            subtitle="Questions about orders, conventions, or collabs? We'd love to hear from you."
            icon={Mail}
            accentColor="cyan"
          />
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-5 gap-10">
            {/* Contact Info */}
            <div className="md:col-span-2">
              <div className="space-y-6">
                <div className="bg-void-light rounded-xl p-6 border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-magenta/10 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-neon-magenta" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Instagram</p>
                      <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-neon-magenta transition-colors">{BRAND.instagram}</a>
                    </div>
                  </div>
                </div>

                <div className="bg-void-light rounded-xl p-6 border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-white">{BRAND.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-void-light rounded-xl p-6 border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Based in</p>
                      <p className="text-sm text-white">Detroit, Michigan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-3">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-void-light rounded-xl p-10 border border-neon-cyan/20 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <h3 className="font-display text-xl text-white mb-2">MESSAGE SENT</h3>
                  <p className="text-sm text-gray-400">Thanks for reaching out! We&apos;ll get back to you soon.</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn-outline-neon px-6 py-2 rounded-lg text-xs mt-6"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-void-light rounded-xl p-6 md:p-8 border border-white/5 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-lg bg-void border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-magenta/50"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-lg bg-void border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-magenta/50"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-void border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-magenta/50"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Message *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-lg bg-void border border-white/10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-magenta/50 resize-none"
                      placeholder="Tell us everything..."
                    />
                  </div>
                  {status === 'error' && (
                    <p className="text-xs text-red-400">Something went wrong. Please try again.</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full btn-neon py-3 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                  <p className="text-[10px] text-gray-600 text-center">Your message is stored securely. We don&apos;t share your info.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
