/**
 * Shared types for Neko Circuit.
 * DB-related types come from Prisma; these cover API and UI shapes.
 */

/** Shape of a cart item stored client-side */
export interface CartItemShape {
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

/** Minimal product info returned by /api/products */
export interface ProductListItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  preOrderPrice: number | null;
  image: string | null;
  tier: string;
  features: string | null;
  includes: string | null;
  limitedEdition: boolean;
  maxUnits: number | null;
  unitsSold: number;
  active: boolean;
  sortOrder: number;
}

/** Convention as returned by /api/conventions */
export interface ConventionItem {
  id: string;
  name: string;
  city: string;
  state: string;
  venue: string | null;
  startDate: string;
  endDate: string;
  attendance: number | null;
  website: string | null;
  description: string | null;
  featured: boolean;
}
