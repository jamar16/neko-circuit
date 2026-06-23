/**
 * Single source of truth for convention vs non-convention event classification.
 *
 * Every query that filters "real conventions" from local/culture events MUST
 * import from here.  Never duplicate these arrays elsewhere.
 */

/** Event types that are local-scene / culture events, NOT conventions. */
export const NON_CONVENTION_TYPES = [
  'Tournament',
  'Pop-Up',
  'Meetup',
  'Festival',
  'Music',
] as const;

export type NonConventionType = (typeof NON_CONVENTION_TYPES)[number];

/**
 * Returns true when `type` represents a convention (the kind we count,
 * list on /conventions, and feature in the calendar product).
 *
 * Convention = type is null  OR  type is not in NON_CONVENTION_TYPES.
 */
export function isConvention(type: string | null | undefined): boolean {
  if (type == null) return true; // null / undefined → convention
  return !NON_CONVENTION_TYPES.includes(type as NonConventionType);
}

/**
 * Prisma `where` clause fragment that selects only conventions.
 * Usage:  prisma.convention.findMany({ where: CONVENTION_WHERE, ... })
 */
export const CONVENTION_WHERE = {
  OR: [
    { type: null },
    { type: { notIn: [...NON_CONVENTION_TYPES] as string[] } },
  ],
};
