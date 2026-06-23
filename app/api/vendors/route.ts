export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(vendors);
  } catch (err: any) {
    console.error('Vendors fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}
