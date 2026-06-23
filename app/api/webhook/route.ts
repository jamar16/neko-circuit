export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { getConventionCount } from '@/lib/getConventionCount';

/**
 * Stripe webhook handler.
 * Listens for `checkout.session.completed` to:
 *  1. Create an Order record in the DB
 *  2. Increment unitsSold on each Product (for limited-edition tracking)
 *
 * IMPORTANT: We use request.text() (not .json()) because Stripe
 * signature verification needs the raw body.
 */
export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // If no webhook secret configured, log but still return 200
    if (!webhookSecret) {
      console.error('[WEBHOOK FATAL] STRIPE_WEBHOOK_SECRET is not set in environment');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const conCount = await getConventionCount();
    let event: Stripe.Event;

    try {
      const rawBody = await request.text();
      const signature = request.headers.get('stripe-signature');

      console.log('[WEBHOOK] Signature verification attempt', {
        hasSignature: !!signature,
        signaturePrefix: signature?.substring(0, 20) + '...',
        secretPrefix: webhookSecret.substring(0, 10) + '...',
        bodyLength: rawBody.length,
      });

      if (!signature) {
        console.error('[WEBHOOK ERROR] Missing stripe-signature header');
        return NextResponse.json({ received: true }, { status: 200 });
      }

      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      console.log('[WEBHOOK] Signature verified successfully, event type:', event.type);
    } catch (err: any) {
      console.error('[WEBHOOK ERROR] Signature verification failed:', {
        message: err.message,
        type: err.type,
      });
      // Return 200 to stop Stripe from retrying with an outdated secret
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // ── Handle checkout.session.completed ──────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('[WEBHOOK] Processing checkout.session.completed:', session.id);

      try {
        // Parse the items we attached as metadata during checkout
        const itemsMeta: Array<{ id: string; qty: number; preOrder: boolean }> =
          JSON.parse(session.metadata?.items || '[]');

        if (itemsMeta.length === 0) {
          console.warn('[WEBHOOK] No items in session metadata', session.id);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Check if order already exists (idempotency — prevents duplicate orders on retry)
        const existingOrder = await prisma.order.findUnique({
          where: { stripeSessionId: session.id },
        });
        if (existingOrder) {
          console.log('[WEBHOOK] Order already exists for session', session.id);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // NOTE: GA4 purchase event moved after product lookup (see below)

        // Send order notification email to admin
        try {
          const custName = session.customer_details?.name || 'Unknown';
          const custEmail = session.customer_details?.email || 'N/A';
          const addr = session.customer_details?.address;
          const shipping = (session as any).shipping_details as { name?: string; address?: Stripe.Address } | null;
          const shippingAddr = shipping?.address || addr;
          const shippingName = shipping?.name || custName;
          const fullAddress = shippingAddr
            ? [shippingName, shippingAddr.line1, shippingAddr.line2, `${shippingAddr.city}, ${shippingAddr.state} ${shippingAddr.postal_code}`, shippingAddr.country].filter(Boolean).join('\n')
            : 'No address provided';
          const itemsList = itemsMeta.map((i) => `${i.id} × ${i.qty}${i.preOrder ? ' (Pre-Order)' : ''}`).join(', ');
          const totalStr = `$${((session.amount_total ?? 0) / 100).toFixed(2)} USD`;

          const htmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e5e5e5; padding: 32px; border-radius: 12px;">
              <h2 style="color: #ff2d78; margin: 0 0 24px 0; font-size: 20px;">🐱 New Neko Circuit Order</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #888; width: 140px;">Customer</td><td style="padding: 8px 0;">${custName}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;"><a href="mailto:${custEmail}" style="color: #00f0ff;">${custEmail}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Product</td><td style="padding: 8px 0;">${itemsList}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Total</td><td style="padding: 8px 0; font-weight: bold; color: #ff2d78;">${totalStr}</td></tr>
                <tr><td style="padding: 8px 0; color: #888; vertical-align: top;">Shipping Address</td><td style="padding: 8px 0; white-space: pre-line;">${fullAddress}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Stripe Session ID</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${session.id}</td></tr>
              </table>
              <div style="margin-top: 24px; padding: 20px; background: #111; border-radius: 8px; border-left: 3px solid #00f0ff;">
                <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: bold; color: #00f0ff;">📅 SYNC YOUR 2026 MIDWEST CON CALENDAR</p>
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #ccc;">${conCount} confirmed Midwest anime conventions — one tap to your phone.</p>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #888;">Tap to add to Google Calendar:</p>
                <a href="https://calendar.google.com/calendar/r?cid=https://dateanime.com/api/calendar/neko-circuit-2026.ics" style="color: #00f0ff; font-size: 13px; word-break: break-all;">https://calendar.google.com/calendar/r?cid=https://dateanime.com/api/calendar/neko-circuit-2026.ics</a>
                <p style="margin: 16px 0 4px 0; font-size: 13px; color: #888;">Or download the .ics file (Apple Calendar / Outlook):</p>
                <a href="https://dateanime.com/api/calendar/neko-circuit-2026.ics" style="color: #00f0ff; font-size: 13px; word-break: break-all;">https://dateanime.com/api/calendar/neko-circuit-2026.ics</a>
                <p style="margin: 16px 0 0 0; font-size: 13px; color: #999;">ACen • Gen Con • Youmacon • Colossalcon + 43 more.<br/>Never miss a Midwest con again.</p>
              </div>
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #222;">
                <p style="margin: 0; color: #888; font-size: 13px;">Submit this order manually at <a href="https://lulu.com" style="color: #00f0ff;">lulu.com</a></p>
            </div>
          `;

          console.log('[WEBHOOK] Sending order notification email...', {
            hasApiKey: !!process.env.ABACUSAI_API_KEY,
            hasAppId: !!process.env.WEB_APP_ID,
            hasNotifId: !!process.env.NOTIF_ID_NEW_ORDER_NOTIFICATION,
            notifId: process.env.NOTIF_ID_NEW_ORDER_NOTIFICATION,
            recipient: 'hello@dateanime.com',
          });

          const emailPayload = {
            deployment_token: process.env.ABACUSAI_API_KEY,
            app_id: process.env.WEB_APP_ID,
            notification_id: process.env.NOTIF_ID_NEW_ORDER_NOTIFICATION,
            subject: `🐱 New Neko Circuit Order — ${custName}`,
            body: htmlBody,
            is_html: true,
            recipient_email: 'hello@dateanime.com',
            sender_alias: 'Neko Circuit',
          };

          const emailResp = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload),
          });

          const emailResult = await emailResp.json().catch(() => ({ parseError: true, status: emailResp.status }));
          if (!emailResp.ok || emailResult?.success === false) {
            console.error('[WEBHOOK] Order notification email FAILED:', {
              httpStatus: emailResp.status,
              response: emailResult,
              sessionId: session.id,
            });
          } else {
            console.log('[WEBHOOK] Order notification email SENT for session', session.id, emailResult);
          }
        } catch (emailError) {
          console.error('[WEBHOOK] Order notification email EXCEPTION:', emailError instanceof Error ? emailError.message : emailError);
        }

        // ── Send post-purchase calendar sync email to the CUSTOMER ──────
        try {
          const custEmailForSync = session.customer_details?.email;
          const custFirstName =
            (session.customer_details?.name || '').split(' ')[0] || 'friend';

          if (custEmailForSync) {
            const customerHtml = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e5e5e5; padding: 32px; border-radius: 12px;">
                <h1 style="color: #ff2d78; margin: 0 0 12px 0; font-size: 26px; letter-spacing: 1px;">ONE MORE STEP — SYNC THE CIRCUIT.</h1>
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #ccc; line-height: 1.55;">
                  Hey ${custFirstName} — your Neko Circuit order is locked in. While your printed calendar is on its way, get the digital version on your phone in one tap so you never miss a Midwest con again.
                </p>

                <div style="margin: 24px 0; padding: 24px; background: #111; border-radius: 8px; border-left: 3px solid #00f0ff; text-align: center;">
                  <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #00f0ff;">📅 Add to Google Calendar or Apple Calendar</p>
                  <p style="margin: 0 0 18px 0; font-size: 14px; color: #ccc;">${conCount} confirmed cons. ACen, Youmacon, Gen Con, Colossalcon, and ${conCount - 4} more — auto-updating, all year.</p>
                  <a href="https://dateanime.com/sync" style="display: inline-block; padding: 14px 28px; background: #00f0ff; color: #0a0a0f; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Sync the 2026 con calendar →</a>
                  <p style="margin: 18px 0 0 0; font-size: 12px; color: #888; word-break: break-all;">
                    Or paste this link into your browser: <a href="https://dateanime.com/sync" style="color: #00f0ff;">https://dateanime.com/sync</a>
                  </p>
                </div>

                <p style="margin: 24px 0 0 0; font-size: 14px; color: #aaa; line-height: 1.55;">
                  Works with Google Calendar, Apple Calendar, Outlook — anything that speaks .ics. Subscribe once and the calendar updates itself when new cons are confirmed.
                </p>

                <p style="margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #222; font-size: 12px; color: #666;">
                  Order ref: ${session.id}<br/>
                  Detroit-built, anime-fueled. 🐱⚡
                </p>
              </div>
            `;

            console.log('[WEBHOOK] Sending post-purchase calendar sync email to customer...', {
              hasNotifId: !!process.env.NOTIF_ID_POSTPURCHASE_CALENDAR_SYNC,
              recipient: custEmailForSync,
            });

            const customerResp = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                deployment_token: process.env.ABACUSAI_API_KEY,
                app_id: process.env.WEB_APP_ID,
                notification_id: process.env.NOTIF_ID_POSTPURCHASE_CALENDAR_SYNC,
                subject: 'Sync your 2026 Midwest con calendar — one tap.',
                body: customerHtml,
                is_html: true,
                recipient_email: custEmailForSync,
                sender_alias: 'Neko Circuit',
              }),
            });

            const customerResult = await customerResp
              .json()
              .catch(() => ({ parseError: true, status: customerResp.status }));
            if (!customerResp.ok || customerResult?.success === false) {
              console.error('[WEBHOOK] Customer calendar-sync email FAILED:', {
                httpStatus: customerResp.status,
                response: customerResult,
                sessionId: session.id,
              });
            } else {
              console.log('[WEBHOOK] Customer calendar-sync email SENT to', custEmailForSync);
            }
          } else {
            console.warn('[WEBHOOK] No customer email on session, skipping calendar-sync email', session.id);
          }
        } catch (customerEmailError) {
          console.error(
            '[WEBHOOK] Customer calendar-sync email EXCEPTION:',
            customerEmailError instanceof Error ? customerEmailError.message : customerEmailError,
          );
        }

        // Look up products for pricing
        const productIds = itemsMeta.map((i) => i.id);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));

        // Validate all products still exist — log missing but don't block the order
        const missingProducts = itemsMeta.filter((i) => !productMap.has(i.id));
        if (missingProducts.length > 0) {
          console.warn(
            '[WEBHOOK] Some products not found in DB, using Stripe total for pricing:',
            missingProducts.map((p) => p.id)
          );
        }

        // Calculate order totals from DB prices
        let subtotal = 0;
        const orderItemsData = itemsMeta
          .filter((item) => productMap.has(item.id))
          .map((item) => {
            const product = productMap.get(item.id)!;
            const unitPrice =
              item.preOrder && product.preOrderPrice != null
                ? product.preOrderPrice
                : product.price;
            subtotal += unitPrice * item.qty;
            return {
              productId: item.id,
              quantity: item.qty,
              price: unitPrice,
              isPreOrder: item.preOrder,
            };
          });

        // Stripe amounts are in cents; shipping = total - subtotal
        const totalPaid = (session.amount_total ?? 0) / 100;
        const shippingCost = Math.max(0, totalPaid - subtotal);

        // ── Fire GA4 purchase event (after product lookup so we have real data) ──
        try {
          const ga4Items = orderItemsData.map((oi) => {
            const product = productMap.get(oi.productId);
            return {
              item_id: oi.productId,
              item_name: product?.name ?? oi.productId,
              price: Number(oi.price),
              quantity: oi.quantity,
            };
          });
          // GA4 MP client_id must look like <random>.<timestamp>
          const ga4ClientId = `${Math.floor(Math.random() * 2147483647)}.${Math.floor(Date.now() / 1000)}`;
          const ga4Payload = {
            client_id: ga4ClientId,
            events: [{
              name: 'purchase',
              params: {
                transaction_id: session.id,
                value: Number(totalPaid),
                currency: 'USD',
                tax: 0,
                shipping: Number(shippingCost),
                items: ga4Items,
              },
            }],
          };
          console.log('[GA4] Sending purchase event:', JSON.stringify(ga4Payload));

          const ga4Resp = await fetch(
            `https://www.google-analytics.com/mp/collect?measurement_id=G-FGD1MJ2CFT&api_secret=VKMq-Po1RT-JSsvuXUBTfw`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(ga4Payload),
            }
          );
          console.log('[GA4] Response status:', ga4Resp.status, 'for session', session.id);
        } catch (ga4Error) {
          console.error('[GA4] EXCEPTION:', ga4Error instanceof Error ? ga4Error.message : ga4Error);
        }

        // Try to link to existing user account
        const customerEmail = session.customer_details?.email ?? 'unknown@unknown.com';
        const existingUser = await prisma.user.findUnique({
          where: { email: customerEmail },
        });

        // Create the order + items in a transaction
        await prisma.$transaction(async (tx) => {
          await tx.order.create({
            data: {
              email: customerEmail,
              name: session.customer_details?.name ?? 'Customer',
              status: 'paid',
              total: totalPaid,
              subtotal,
              shipping: shippingCost,
              stripeSessionId: session.id,
              stripePaymentId: session.payment_intent as string | null,
              shippingMethod:
                (session as unknown as Record<string, unknown>).shipping_cost
                  ? 'selected'
                  : 'standard',
              ...(existingUser ? { userId: existingUser.id } : {}),
              items: {
                create: orderItemsData,
              },
            },
          });

          // Increment unitsSold for each product
          for (const item of itemsMeta) {
            if (productMap.has(item.id)) {
              await tx.product.update({
                where: { id: item.id },
                data: { unitsSold: { increment: item.qty } },
              });
            }
          }
        });

        console.log('[WEBHOOK] Order created for session', session.id, 'email:', customerEmail);

        // ── Submit Lulu Print API fulfillment (DROP_SHIP) ──────────────────
        async function submitLuluOrder() {
          const luluClientId = process.env.LULU_CLIENT_ID;
          const luluClientSecret = process.env.LULU_CLIENT_SECRET;
          if (!luluClientId || !luluClientSecret) {
            console.warn('[LULU] Missing LULU_CLIENT_ID or LULU_CLIENT_SECRET — skipping fulfillment');
            return;
          }

          // 1. Get bearer token
          const basicAuth = Buffer.from(`${luluClientId}:${luluClientSecret}`).toString('base64');
          console.log('[LULU] Requesting auth token from production...');
          const tokenResp = await fetch(
            'https://api.lulu.com/auth/realms/glasstree/protocol/openid-connect/token',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${basicAuth}`,
              },
              body: 'grant_type=client_credentials',
            }
          );
          const tokenData = await tokenResp.json();
          if (!tokenResp.ok || !tokenData.access_token) {
            console.error('[LULU] Auth FAILED:', { status: tokenResp.status, response: tokenData });
            return;
          }
          console.log('[LULU] Auth SUCCESS — token expires in', tokenData.expires_in, 'seconds');

          // 2. Build shipping address from Stripe session
          const shipping = (session as any).shipping_details as {
            name?: string;
            address?: Stripe.Address;
          } | null;
          const addr = shipping?.address || session.customer_details?.address;
          if (!addr || !addr.line1) {
            console.warn('[LULU] No shipping address on session — skipping fulfillment', session.id);
            return;
          }

          const luluPayload = {
            external_id: session.id,
            contact_email: session.customer_details?.email || 'hello@dateanime.com',
            shipping_level: 'MAIL',
            line_items: [
              {
                printable_id: '95d9yp5',
                external_id: session.id,
                quantity: 1,
              },
            ],
            shipping_address: {
              name: shipping?.name || session.customer_details?.name || 'Customer',
              street1: addr.line1,
              ...(addr.line2 ? { street2: addr.line2 } : {}),
              city: addr.city || '',
              state_code: addr.state || '',
              country_code: addr.country || 'US',
              postcode: addr.postal_code || '',
              phone_number: '000-000-0000',
            },
          };
          console.log('[LULU] Submitting print job:', JSON.stringify(luluPayload));

          // 3. Create the print job
          const jobResp = await fetch('https://api.lulu.com/print-jobs/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenData.access_token}`,
            },
            body: JSON.stringify(luluPayload),
          });
          const jobData = await jobResp.json().catch(() => ({ rawStatus: jobResp.status }));
          if (!jobResp.ok) {
            console.error('[LULU] Print job FAILED:', { status: jobResp.status, response: JSON.stringify(jobData) });
          } else {
            console.log('[LULU] Print job SUCCESS:', JSON.stringify(jobData));
          }
        }

        try {
          await submitLuluOrder();
        } catch (luluError) {
          // Lulu failure must NEVER affect order emails or return non-200 to Stripe
          console.error('[LULU] EXCEPTION:', luluError instanceof Error ? luluError.message : luluError);
        }

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        console.error('[WEBHOOK ERROR] Failed to process order for session', session.id, {
          message,
          stack,
        });
        // Still return 200 — Stripe will not retry but we avoid the 100% error rate
        // The order can be reconciled manually from Stripe dashboard
      }
    // ── Handle checkout.session.expired — abandoned cart recovery ──────
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('[WEBHOOK] Processing checkout.session.expired:', session.id);

      try {
        const custEmail = session.customer_details?.email;
        if (!custEmail) {
          console.warn('[WEBHOOK] No customer email on expired session, skipping recovery email', session.id);
        } else {
          const recoveryHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e5e5e5; padding: 32px; border-radius: 12px;">
              <h1 style="color: #ff2d78; margin: 0 0 12px 0; font-size: 24px; letter-spacing: 1px;">YOU LEFT SOMETHING ON THE CIRCUIT.</h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #ccc; line-height: 1.6;">
                Looks like you started checking out but didn't finish — no worries, your calendar is still waiting for you.
              </p>

              <div style="margin: 24px 0; padding: 24px; background: #111; border-radius: 8px; border-left: 3px solid #00f0ff; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #00f0ff;">${conCount} Midwest cons, one wall.</p>
                <p style="margin: 0 0 18px 0; font-size: 14px; color: #ccc;">ACen · Youmacon · Gen Con · Colossalcon + ${conCount - 4} more — all in one beautifully illustrated calendar.</p>
                <a href="https://dateanime.com/shop" style="display: inline-block; padding: 14px 28px; background: #ff2d78; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">Finish your order →</a>
              </div>

              <p style="margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #222; font-size: 12px; color: #666;">
                You're getting this because you started a checkout at dateanime.com.<br/>
                Detroit-built, anime-fueled. 🐱⚡
              </p>
            </div>
          `;

          const recoveryResp = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deployment_token: process.env.ABACUSAI_API_KEY,
              app_id: process.env.WEB_APP_ID,
              notification_id: process.env.NOTIF_ID_ABANDONED_CART_RECOVERY,
              subject: 'You left something on the circuit 👀',
              body: recoveryHtml,
              is_html: true,
              recipient_email: custEmail,
              sender_alias: 'Neko Circuit',
            }),
          });

          const recoveryResult = await recoveryResp.json().catch(() => ({ parseError: true, status: recoveryResp.status }));
          if (!recoveryResp.ok || recoveryResult?.success === false) {
            console.error('[WEBHOOK] Abandoned cart recovery email FAILED:', {
              httpStatus: recoveryResp.status,
              response: recoveryResult,
              sessionId: session.id,
            });
          } else {
            console.log('[WEBHOOK] Abandoned cart recovery email SENT to', custEmail, 'for session', session.id);
          }
        }
      } catch (recoveryError) {
        // Email failure must NOT return non-200 to Stripe
        console.error(
          '[WEBHOOK] Abandoned cart recovery email EXCEPTION:',
          recoveryError instanceof Error ? recoveryError.message : recoveryError,
        );
      }

    } else {
      console.log('[WEBHOOK] Received unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (topLevelError: unknown) {
    // Top-level safety net — always return 200 to Stripe no matter what
    const message = topLevelError instanceof Error ? topLevelError.message : String(topLevelError);
    const stack = topLevelError instanceof Error ? topLevelError.stack : undefined;
    console.error('[WEBHOOK CRITICAL] Unhandled top-level error:', { message, stack });
    return NextResponse.json({ received: true }, { status: 200 });
  }
}