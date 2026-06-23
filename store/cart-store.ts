'use client';
import { create } from 'zustand';

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  preOrderPrice: number | null;
  image: string | null;
  tier: string;
  quantity: number;
  isPreOrder: boolean;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('neko-cart');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('neko-cart', JSON.stringify(items)); } catch {}
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  setOpen: (open: boolean) => set({ isOpen: open }),
  addItem: (item: Omit<CartItem, 'quantity'>) => {
    set((state) => {
      const existing = state.items?.find((i: CartItem) => i.id === item.id && i.isPreOrder === item.isPreOrder);
      let newItems: CartItem[];
      if (existing) {
        newItems = (state.items ?? []).map((i: CartItem) =>
          i.id === item.id && i.isPreOrder === item.isPreOrder
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        newItems = [...(state.items ?? []), { ...item, quantity: 1 }];
      }
      saveCart(newItems);
      return { items: newItems, isOpen: true };
    });
  },
  removeItem: (id: string) => {
    set((state) => {
      const newItems = (state.items ?? []).filter((i: CartItem) => i.id !== id);
      saveCart(newItems);
      return { items: newItems };
    });
  },
  updateQuantity: (id: string, quantity: number) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = (state.items ?? []).filter((i: CartItem) => i.id !== id);
        saveCart(newItems);
        return { items: newItems };
      }
      const newItems = (state.items ?? []).map((i: CartItem) =>
        i.id === id ? { ...i, quantity } : i
      );
      saveCart(newItems);
      return { items: newItems };
    });
  },
  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },
  getTotal: () => {
    const items = get().items ?? [];
    return items.reduce((sum: number, i: CartItem) => {
      const price = i.isPreOrder && i.preOrderPrice ? i.preOrderPrice : i.price;
      return sum + price * i.quantity;
    }, 0);
  },
  getItemCount: () => {
    const items = get().items ?? [];
    return items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
  },
}));
