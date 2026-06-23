import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email(),
  conventionId: z.string().min(1),
  conventionName: z.string().min(1),
});

async function sendWatchConfirmation(email: string, conName: string) {
  try {
    const htmlBody = `
      <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e5e5e5; padding: 32px 24px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 800; color: #ffffff;">NEKO CIRCUIT</span>
          <span style="display: block; margin-top: 4px; font-size: 12px; letter-spacing: 2px; color: #00f0ff;">2026 WATCHLIST</span>
        </div>

        <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #ffffff;">You're watching ${conName}</h2>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #ccc; line-height: 1.6;">We'll notify you the moment ${conName} confirms their 2026 dates.</p>

        <a href="https://dateanime.com/watchlist" style="display: inline-block; padding: 10px 18px; background: #00f0ff; color: #0a0a0f; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">View full watchlist</a>

        <p style="margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #222; font-size: 12px; color: #666;">
          You're getting this because you asked to watch ${conName} at dateanime.com.<br/>
          Detroit-built, anime-fueled. 🐱⚡
        </p>
      </div>
    `;

    const resp = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: process.env.NOTIF_ID_WATCHLIST_CONVENTION_ALERT,
        subject: `You're watching ${conName} — Neko Circuit`,
        body: htmlBody,
        is_html: true,
        recipient_email: email,
        sender_alias: 'Neko Circuit',
      }),
    });
    const result = await resp.json().catch(() => ({ parseError: true, status: resp.status }));
    if (!resp.ok || result?.success === false) {
      console.error('[WATCHLIST-SUB] Confirmation email FAILED:', { httpStatus: resp.status, response: result, email, conName });
    } else {
      console.log('[WATCHLIST-SUB] Confirmation email SENT to', email, 'for', conName);
    }
  } catch (err) {
    console.error('[WATCHLIST-SUB] Confirmation email EXCEPTION:', err instanceof Error ? err.message : err);
  }
}

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit({ name: 'watchlist-sub', limit: 10, windowSeconds: 900 }, getClientIp(request));
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const { email, conventionId, conventionName } = parsed.data;

    // Check if already subscribed
    const existing = await prisma.watchlistSubscriber.findUnique({
      where: { email_conventionId: { email, conventionId } },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already watching this convention.' });
    }

    await prisma.watchlistSubscriber.create({
      data: { email, conventionId },
    });

    console.log('[WATCHLIST-SUB] Saved:', { email, conventionId, conventionName });

    // Send confirmation email (fire-and-forget)
    sendWatchConfirmation(email, conventionName).catch(() => {});

    return NextResponse.json({ message: 'Subscribed! We\'ll notify you when dates are confirmed.' });
  } catch (err) {
    console.error('[WATCHLIST-SUB] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
