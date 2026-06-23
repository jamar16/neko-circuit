import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a dollar amount stored as a float (e.g. 29.99) for display.
 * We do NOT store prices in cents — this is intentional.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Calculate savings percentage between two prices.
 * Returns 0 if either value is invalid.
 */
export function savingsPercent(original: number, sale: number): number {
  if (original <= 0 || sale <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}
