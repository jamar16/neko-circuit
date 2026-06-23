export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subscribeSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getConventionCount } from '@/lib/getConventionCount';

async function sendWelcomeEmail(email: string) {
  // Fire welcome email via Abacus notification API. Failures are logged
  // but never block the subscription save.
  try {
    const conCount = await getConventionCount();
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e5e5e5; padding: 32px; border-radius: 12px;">
        <h1 style="color: #ff2d78; margin: 0 0 12px 0; font-size: 28px; letter-spacing: 1px;">YOU'RE ON THE CIRCUIT.</h1>
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #ccc; line-height: 1.55;">
          Welcome to Neko Circuit — the home of the 2026 Midwest anime convention calendar.
          ${conCount} confirmed cons. 12 months of original art. One link to keep them all on your phone.
        </p>

        <div style="margin: 24px 0; padding: 20px; background: #111; border-radius: 8px; border-left: 3px solid #00f0ff;">
          <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: bold; color: #00f0ff;">📅 Sync the 2026 con calendar now</p>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #ccc;">Apple Calendar, Outlook, or any .ics-compatible app:</p>
          <a href="https://dateanime.com/api/calendar/neko-circuit-2026.ics" style="display: inline-block; padding: 10px 18px; background: #00f0ff; color: #0a0a0f; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Download the .ics file</a>
          <p style="margin: 14px 0 0 0; font-size: 12px; color: #888; word-break: break-all;">
            Direct link: <a href="https://dateanime.com/api/calendar/neko-circuit-2026.ics" style="color: #00f0ff;">https://dateanime.com/api/calendar/neko-circuit-2026.ics</a>
          </p>
        </div>

        <div style="margin: 24px 0; padding: 20px; background: #111; border-radius: 8px; border-left: 3px solid #ff2d78;">
          <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: bold; color: #ff2d78;">🛍️ Get the printed calendar</p>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #ccc;">Original artwork. Premium print. Ships in 7–10 days.</p>
          <a href="https://dateanime.com/shop" style="display: inline-block; padding: 10px 18px; background: #ff2d78; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Shop the 2026 calendar</a>
        </div>

        <p style="margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #222; font-size: 12px; color: #666;">
          You're getting this because you joined the Neko Circuit list at dateanime.com.<br/>
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
        notification_id: process.env.NOTIF_ID_SUBSCRIBER_WELCOME,
        subject: "You're on the circuit.",
        body: htmlBody,
        is_html: true,
        recipient_email: email,
        sender_alias: 'Neko Circuit',
      }),
    });
    const result = await resp.json().catch(() => ({ parseError: true, status: resp.status }));
    if (!resp.ok || result?.success === false) {
      console.error('[SUBSCRIBE] Welcome email FAILED:', { httpStatus: resp.status, response: result, email });
    } else {
      console.log('[SUBSCRIBE] Welcome email SENT to', email);
    }
  } catch (err) {
    console.error('[SUBSCRIBE] Welcome email EXCEPTION:', err instanceof Error ? err.message : err);
  }
}

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit({ name: 'subscribe', limit: 5, windowSeconds: 900 }, getClientIp(request));
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const result = subscribeSchema.safeParse(body);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { email, source } = result.data;

    const before = await prisma.emailSubscription.findUnique({ where: { email } });

    const record = await prisma.emailSubscription.upsert({
      where: { email },
      update: { source },
      create: { email, source },
    });

    console.log(`[WATCHLIST] Subscription saved — email=${email}, source=${source}, id=${record.id}, isNew=${!before}`);

    // Only send welcome email on first-time subscribe — avoids re-emailing
    // anyone who resubmits the form.
    if (!before) {
      await sendWelcomeEmail(email);
    } else {
      console.log('[SUBSCRIBE] Existing subscriber, skipping welcome email:', email);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(`[WATCHLIST] Subscription FAILED — email=${(err as any)?.email ?? 'unknown'}`, err);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
