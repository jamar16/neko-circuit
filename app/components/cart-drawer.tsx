'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore, CartItem } from '@/store/cart-store';
import Image from 'next/image';
import { useState } from 'react';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const items = useCartStore((s) => s.items) ?? [];
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);
  const [loading, setLoading] = useState(false);

  const total = getTotal();
  const freeShipping = total >= 50;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      // Only send IDs, quantities, and isPreOrder — server fetches prices from DB
      const checkoutItems = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        isPreOrder: item.isPreOrder,
      }));
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: checkoutItems }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-void-light border-l border-white/10 z-[61] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neon-magenta" />
                <span className="font-display text-lg tracking-wider text-white">YOUR CART</span>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-600 mb-4" />
                  <p className="text-gray-500 text-sm">Your cart is empty</p>
                  <p className="text-gray-600 text-xs mt-1">Add some fire merch to get started</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item: CartItem) => {
                    const price = item.isPreOrder && item.preOrderPrice ? item.preOrderPrice : item.price;
                    return (
                      <motion.div
                        key={`${item.id}-${item.isPreOrder}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 bg-white/[0.03] rounded-lg p-3"
                      >
                        {item.image && (
                          <div className="relative w-16 h-16 rounded overflow-hidden bg-void flex-shrink-0">
                            <Image src={item.image} alt={item.name ?? 'Product'} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                          {item.isPreOrder && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neon-cyan">Pre-Order</span>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(`${item.id}`, item.quantity - 1)}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-3 h-3 text-gray-400" />
                              </button>
                              <span className="text-sm font-semibold text-white w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(`${item.id}`, item.quantity + 1)}
                                className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-neon-magenta">${(price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(`${item.id}`)}
                          className="p-1 self-start hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5">
                {!freeShipping && (
                  <div className="mb-3 p-2 rounded bg-neon-cyan/5 border border-neon-cyan/20">
                    <p className="text-[11px] text-neon-cyan text-center">
                      Add ${(50 - total).toFixed(2)} more for FREE shipping!
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Subtotal</span>
                  <span className="text-lg font-bold text-white">${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full btn-neon py-3 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Checkout'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
