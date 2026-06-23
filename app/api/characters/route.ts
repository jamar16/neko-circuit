export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const monthSchema = z.coerce.number().int().min(1).max(12);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const monthRaw = searchParams.get('month');

    if (!monthRaw) {
      return NextResponse.json(
        { error: 'month query parameter is required' },
        { status: 400 }
      );
    }

    const parsed = monthSchema.safeParse(monthRaw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'month must be an integer between 1 and 12' },
        { status: 400 }
      );
    }

    const monthStr = String(parsed.data).padStart(2, '0');

    const characters = await prisma.character.findMany({
      where: { birthday: { startsWith: monthStr + '-' } },
      include: { voiceActors: true },
      orderBy: { birthday: 'asc' },
    });

    return NextResponse.json({ characters });
  } catch (err) {
    console.error('Characters fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}
