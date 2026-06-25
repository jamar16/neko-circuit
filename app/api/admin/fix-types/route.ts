import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = process.env.ADMIN_SYNC_SECRET ?? 'NEKOADMIN2026';

// Non-convention events and their correct types.
// Every other row gets type = null (appears on main /conventions list).
const NON_CONVENTION_TYPES: Record<string, string> = {
  'Mythic Forge Gaming': 'Tournament',
  'Gotta Gatcha': 'Pop-Up',
  'Glotaku': 'Meetup',
  'Detroit Festival of Books': 'Festival',
  'Fantastical Fairytale Festival': 'Festival',
  'Mid-Michigan Renaissance Festival': 'Festival',
  'Nerdivation Nerdcore Music Showcase': 'Music',
};

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Step 1: Reset all convention types to null so they appear on the main list.
    const { count: resetCount } = await prisma.convention.updateMany({
      where: {},
      data: { type: null },
    });

    // Step 2: Re-apply correct types for non-convention events.
    const typeUpdates: Array<{ name: string; type: string; count: number }> = [];
    for (const [name, type] of Object.entries(NON_CONVENTION_TYPES)) {
      const { count } = await prisma.convention.updateMany({
        where: { name },
        data: { type },
      });
      typeUpdates.push({ name, type, count });
    }

    const conventionCount = await prisma.convention.count({ where: { OR: [{ type: null }, { type: { notIn: Object.values(NON_CONVENTION_TYPES) } }] } });

    return NextResponse.json({
      success: true,
      rowsReset: resetCount,
      typeUpdates,
      conventionCount,
      message: `Reset ${resetCount} rows to type=null, re-applied ${typeUpdates.length} non-convention types. ${conventionCount} conventions now visible on /conventions.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
