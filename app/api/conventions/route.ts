export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const conventions = await prisma.convention.findMany({
      orderBy: { startDate: 'asc' },
    });
    return NextResponse.json(conventions);
  } catch (err: any) {
    console.error('Conventions fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch conventions' }, { status: 500 });
  }
}
