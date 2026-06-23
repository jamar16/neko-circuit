import { prisma } from '@/lib/prisma';
import { CONVENTION_WHERE } from '@/lib/eventTypes';

/**
 * Returns the total number of conventions in the database.
 * Uses the shared CONVENTION_WHERE filter from lib/eventTypes.
 * Intended for server-side use (Server Components, API routes).
 */
export async function getConventionCount(): Promise<number> {
  try {
    return await prisma.convention.count({ where: CONVENTION_WHERE });
  } catch (err) {
    console.error('[getConventionCount] DB query failed:', err instanceof Error ? err.message : err);
    return 0;
  }
}
