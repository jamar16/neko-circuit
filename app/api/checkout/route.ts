export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit({ name: 'checkout', limit: 10, windowSeconds: 60 }, getClientIp(request));
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();

    // ── Validate shape (only IDs, quantities, isPreOrder — NO prices) ──
    const result = checkoutSchema.safeParse(body);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const { items } = result.data;

    // ── Look up every product in the DB so prices are authoritative ──
    const productIds = items.map((i) => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    // Map for fast lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Verify every requested item exists
    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 400 }
        );
      }
      // Check limited-edition stock
      if (product.limitedEdition && product.maxUnits !== null) {
        const remaining = product.maxUnits - product.unitsSold;
        if (item.quantity > remaining) {
          return NextResponse.json(
            {
              error: `Only ${remaining} units of "${product.name}" remaining`,
            },
            { status: 400 }
          );
        }
      }
    }

    // ── Build line items with DB-authoritative prices ──
    const lineItems = items.map((item) => {
      const product = productMap.get(item.id)!;
      const unitPrice =
        item.isPreOrder && product.preOrderPrice != null
          ? product.preOrderPrice
          : product.price;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: item.isPreOrder ? 'Pre-Order' : product.tier,
            images: product.image ? [product.image] : [],
          },
          // Prices are stored as floats (e.g. 24.99), Stripe expects cents
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    // ── Shipping logic: tier-based ──
    // Deluxe / Premium → free shipping.  Standard-only → $5.99.
    // Digital-only carts (all deactivated) → no physical shipping needed.
    const allTiers = items.map((i) => productMap.get(i.id)!.tier);
    const hasPhysical = allTiers.some((t) => t !== 'digital');
    const qualifiesFreeShipping = allTiers.some(
      (t) => t === 'deluxe' || t === 'premium'
    );

    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const shippingOptions = !hasPhysical
      ? [] // digital-only: no shipping
      : qualifiesFreeShipping
        ? [
            {
              shipping_rate_data: {
                type: 'fixed_amount' as const,
                fixed_amount: { amount: 0, currency: 'usd' },
                display_name: 'Free Shipping',
              },
            },
            {
              shipping_rate_data: {
                type: 'fixed_amount' as const,
                fixed_amount: { amount: 999, currency: 'usd' },
                display_name: 'Priority (2-3 days)',
              },
            },
          ]
        : [
            {
              shipping_rate_data: {
                type: 'fixed_amount' as const,
                fixed_amount: { amount: 599, currency: 'usd' },
                display_name: 'Standard (5-7 days)',
              },
            },
            {
              shipping_rate_data: {
                type: 'fixed_amount' as const,
                fixed_amount: { amount: 999, currency: 'usd' },
                display_name: 'Priority (2-3 days)',
              },
            },
          ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      ...(shippingOptions.length > 0
        ? {
            shipping_options: shippingOptions,
            shipping_address_collection: { allowed_countries: ['US'] },
          }
        : {}),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      metadata: {
        items: JSON.stringify(
          items.map((i) => ({ id: i.id, qty: i.quantity, preOrder: i.isPreOrder }))
        ),
      },
    });

    return NextResponse.json({ url: session?.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Checkout failed' },
      { status: 500 }
    );
  }
}
