'use client';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';

function CartHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    try {
      const saved = localStorage.getItem('neko-cart');
      if (saved) {
        const items = JSON.parse(saved);
        if (Array.isArray(items)) {
          useCartStore.setState({ items });
        }
      }
    } catch {}
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <SessionProvider>
      <CartHydration />
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </SessionProvider>
  );
}
