export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Only serve our known .ics file
  if (filename !== 'neko-circuit-2026.ics') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'neko-circuit-2026.ics');
    const fileBuffer = readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="neko-circuit-2026.ics"',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('[CALENDAR] Failed to serve .ics file:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
