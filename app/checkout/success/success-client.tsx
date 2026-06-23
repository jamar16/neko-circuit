'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { useCartStore } from '@/store/cart-store';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-void">
      <Header />
      <div className="max-w-[600px] mx-auto px-4 pt-32 pb-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="w-20 h-20 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-neon-cyan" />
          </div>
          <h1 className="font-display text-4xl text-white tracking-wide mb-4">ORDER CONFIRMED</h1>
          <p className="text-gray-400 text-sm mb-8">
            Your Neko Circuit calendar is on its way! Check your email for order details and tracking info.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop" className="btn-neon px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm">
              <Package className="w-4 h-4" /> Continue Shopping
            </Link>
            <Link href="/" className="btn-outline-neon px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm">
              Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
