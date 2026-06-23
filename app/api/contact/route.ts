export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit({ name: 'contact', limit: 5, windowSeconds: 900 }, getClientIp(request));
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { name, email, subject, message } = result.data;

    const submission = await prisma.contactSubmission.create({
      data: { name, email, subject: subject ?? '', message },
    });

    // Send notification email to admin — failure must not break the route
    try {
      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e5e5e5; padding: 32px; border-radius: 12px;">
          <h2 style="color: #00f0ff; margin: 0 0 24px 0; font-size: 20px;">📬 New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; width: 120px;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #00f0ff;">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Subject</td><td style="padding: 8px 0;">${subject || '(none)'}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; vertical-align: top;">Message</td><td style="padding: 8px 0; white-space: pre-line;">${message}</td></tr>
          </table>
          <p style="margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #222; font-size: 12px; color: #666;">
            Submission ID: ${submission.id}<br/>
            Reply directly to <a href="mailto:${email}" style="color: #00f0ff;">${email}</a>
          </p>
        </div>
      `;

      const emailResp = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_CONTACT_FORM_SUBMISSION,
          subject: `📬 Contact Form — ${name}: ${subject || 'No subject'}`,
          body: htmlBody,
          is_html: true,
          recipient_email: 'hello@dateanime.com',
          sender_alias: 'Neko Circuit',
        }),
      });

      const emailResult = await emailResp.json().catch(() => ({ parseError: true, status: emailResp.status }));
      if (!emailResp.ok || emailResult?.success === false) {
        console.error('[CONTACT EMAIL] FAILED:', { httpStatus: emailResp.status, response: emailResult, submissionId: submission.id });
      } else {
        console.log('[CONTACT EMAIL] SUCCESS — sent to hello@dateanime.com for submission', submission.id, emailResult);
      }
    } catch (emailError) {
      console.error('[CONTACT EMAIL] EXCEPTION:', emailError instanceof Error ? emailError.message : emailError);
    }

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err: any) {
    console.error('Contact form error:', err);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
