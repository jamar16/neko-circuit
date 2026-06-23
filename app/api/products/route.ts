export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    // Parse features from JSON string to array for clean API response
    const parsed = products.map((p) => ({
      ...p,
      features: (() => { try { return JSON.parse(p.features ?? '[]'); } catch { return []; } })(),
    }));
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('Products fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
