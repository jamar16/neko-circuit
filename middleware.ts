import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Static pages that rarely change — cache for 1 hour, stale-while-revalidate for 1 day.
const CACHEABLE_PATHS = new Set([
  '/about',
  '/faq',
  '/return-policy',
  '/vendor-directory',
  '/birthdays',
]);

// Content Security Policy — covers the third parties this site actually uses:
// GA4, Stripe Checkout/Elements, Google Fonts, Abacus chat lib, cdn.abacus.ai images.
// frame-ancestors permits Abacus preview iframes so the deployment preview keeps working.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://apps.abacus.ai",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.stripe.com https://api.stripe.com https://apps.abacus.ai",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'self' https://*.abacus.ai https://*.abacusai.app https://apps.abacus.ai",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "object-src 'none'",
].join('; ');

function setSecurityHeaders(response: NextResponse) {
  response.headers.set('Content-Security-Policy', CSP_DIRECTIVES);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  setSecurityHeaders(response);

  if (CACHEABLE_PATHS.has(pathname)) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400',
    );
  }

  // Dynamic pages with DB-driven content — never edge-cache.
  const NO_CACHE_PATHS = ['/', '/conventions', '/conventions/detroit'];
  if (NO_CACHE_PATHS.includes(pathname)) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
  }

  return response;
}

// Apply to every request EXCEPT Next.js internals and static assets so we don't
// double-process the bundler output. Security headers travel on real document
// + API responses where they matter.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.svg|favicon.ico|og-image.png|.*\\.ics$).*)',
  ],
};
