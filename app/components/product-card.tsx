'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, Star, Sparkles, Crown, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  preOrderPrice: number | null;
  image: string | null;
  tier: string;
  features: string | string[] | null;
  limitedEdition: boolean;
  maxUnits: number | null;
  unitsSold: number;
  featured?: boolean;
}

const tierConfig: Record<string, { icon: any; color: string; gradient: string; badge: string }> = {
  standard: { icon: Star, color: 'text-neon-cyan', gradient: 'from-neon-cyan/20 to-transparent', badge: 'Standard' },
  deluxe: { icon: Sparkles, color: 'text-neon-magenta', gradient: 'from-neon-magenta/20 to-transparent', badge: 'Deluxe' },
  premium: { icon: Crown, color: 'text-yellow-400', gradient: 'from-yellow-400/20 to-transparent', badge: 'Premium' },
};

export default function ProductCard(props: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const config = tierConfig[props.tier] ?? tierConfig.standard;
  const Icon = config.icon;
  const featureList: string[] = (() => {
    const raw = props.features;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as unknown as string[];
    try { return JSON.parse(raw); } catch { return []; }
  })();

  const handleAdd = (isPreOrder: boolean = false) => {
    addItem({
      id: props.id,
      sku: props.sku,
      name: props.name,
      price: props.price,
      preOrderPrice: props.preOrderPrice,
      image: props.image,
      tier: props.tier,
      isPreOrder,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const remaining = props.maxUnits ? props.maxUnits - props.unitsSold : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-xl overflow-hidden bg-void-light card-hover group ${
        props.featured ? 'gradient-border' : 'border border-white/5'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-void overflow-hidden">
        {props.image && (
          <Image
            src={props.image}
            alt={props.name ?? 'Product'}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient}`} />

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-void/80 backdrop-blur-sm ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">{config.badge}</span>
          </div>
        </div>

        {/* Limited Badge */}
        {props.limitedEdition && remaining !== null && (
          <div className="absolute top-3 right-3">
            <div className="px-2 py-1 rounded-full bg-red-500/80 backdrop-blur-sm">
              <span className="text-[10px] font-bold text-white uppercase">{remaining} left</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg tracking-wide text-white mb-2 line-clamp-2">{props.name}</h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{props.description}</p>

        {/* Features */}
        {featureList.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {featureList.slice(0, 4).map((f: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <Check className={`w-3 h-3 mt-0.5 flex-shrink-0 ${config.color}`} />
                <span className="text-[11px] text-gray-400 leading-tight">{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="font-display text-2xl text-white">${props.price?.toFixed?.(2) ?? '0.00'}</span>
        </div>

        {/* Button */}
        <button
          onClick={() => handleAdd(false)}
          className="w-full btn-neon py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
}
