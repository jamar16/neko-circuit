'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accentColor?: 'magenta' | 'cyan';
  align?: 'left' | 'center';
}

export default function SectionHeading({ title, subtitle, icon: Icon, accentColor = 'magenta', align = 'center' }: Props) {
  const colorClass = accentColor === 'magenta' ? 'text-neon-magenta' : 'text-neon-cyan';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`mb-10 md:mb-14 ${align === 'center' ? 'text-center' : ''}`}
    >
      {Icon && (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 ${colorClass} mb-4`}>
          <Icon className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Neko Circuit</span>
        </div>
      )}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wide text-white">{title}</h2>
      {subtitle && <p className="mt-3 text-sm md:text-base text-gray-500 max-w-xl mx-auto">{subtitle}</p>}
    </motion.div>
  );
}
