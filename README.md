# Neko Circuit

E-commerce and convention hub for the Midwest anime community. Customers browse and purchase limited-edition anime calendar sets, track the full Midwest convention schedule, join a watchlist for specific events, register as vendors, and get birthday features — all in one place.

**Live site:** [dateanime.com](https://dateanime.com)

---

## What it does

- **Shop** — Calendar products at multiple tiers (Standard, Collector, Deluxe) with per-SKU inventory caps for limited editions
- **Pre-orders** — Separate pre-order pricing and tracking; inventory enforced at the database level
- **Checkout** — Stripe Checkout Sessions with webhook-confirmed order status; guest checkout supported
- **Convention calendar** — Full Midwest anime convention schedule with filtering; data synced from ICS feeds
- **Convention watchlist** — Users subscribe by email to specific conventions and get notified; rate-limited to prevent abuse
- **Vendor directory** — Vendors apply to be listed; submissions go into an admin approval queue
- **Birthdays** — Character birthday feature backed by the database
- **Admin sync** — Internal page to trigger convention data sync and view live counts
- **Authentication** — NextAuth with Google SSO and email/password; role-based access (user vs. admin)
- **Print fulfillment** — Lulu Direct integration for calendar print orders
- **Stripe webhooks** — Confirmed order fulfillment flow triggered by Stripe payment events

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Radix UI |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth v4 (Google OAuth + credentials) |
| Payments | Stripe (Checkout Sessions + Webhooks) |
| Print fulfillment | Lulu Direct API |
| State | Zustand + Jotai |
| Data fetching | TanStack Query + SWR |
| Validation | Zod |
| Hosting | Abacus AI platform |

---

## Project structure

```
app/
├── app/
│   ├── about/
│   ├── api/
│   │   ├── auth/              # NextAuth handler
│   │   ├── calendar/          # ICS calendar generation
│   │   ├── characters/        # Character/birthday data
│   │   ├── checkout/          # Stripe session creation
│   │   ├── contact/           # Contact form
│   │   ├── conventions/       # Convention data endpoints
│   │   ├── products/          # Product listing + detail
│   │   ├── signup/            # User registration
│   │   ├── subscribe/         # Email subscription
│   │   ├── vendors/           # Vendor application + directory
│   │   ├── watchlist-subscribe/ # Convention watchlist signup (rate-limited)
│   │   └── webhook/           # Stripe webhook handler
│   ├── birthdays/             # Character birthday feature
│   ├── checkout/              # Checkout success flow
│   ├── conventions/           # Convention calendar UI
│   ├── faq/
│   ├── login/
│   ├── pre-order/
│   ├── return-policy/
│   ├── shop/
│   ├── sync/                  # Admin convention sync page
│   ├── vendor-directory/
│   └── watchlist/             # User convention watchlist
├── components/                # Shared Radix UI components
├── hooks/
├── lib/
│   ├── auth-options.ts        # NextAuth config
│   ├── conventions-data.ts    # Static convention data (edit here to add events)
│   ├── rate-limit.ts          # Rate limiting for public endpoints
│   ├── stripe.ts
│   └── utils.ts
├── middleware.ts               # Route protection
├── prisma/
│   └── schema.prisma          # Full database schema
├── scripts/
│   ├── seed.ts                # Database seed
│   └── sync-ics-to-db.ts      # ICS feed → DB sync
├── store/
│   └── cart-store.ts          # Zustand cart state
├── public/
├── .env.example               # All required env vars with placeholders
└── next.config.js
```

---

## Adding or updating convention events

Convention data lives in `lib/conventions-data.ts`. To add an event, add an entry to the `CONVENTIONS_2026` array:

```ts
{ 
  name: "Event Name", 
  city: "City", 
  state: "MI", 
  venue: "Venue Name", 
  startDate: new Date("2026-08-01T12:00:00.000Z"), 
  endDate: new Date("2026-08-03T12:00:00.000Z"), 
  attendance: 2000, 
  featured: false 
},
```

After editing, trigger the sync endpoint to push changes to the database:
```
POST /api/admin/sync-conventions
```
(Requires `ADMIN_SYNC_SECRET` header — see `.env.example`)

---

## Local setup

**1. Clone and install**
```bash
git clone https://github.com/jamar16/neko-circuit.git
cd neko-circuit
yarn install
```

**2. Configure environment**
```bash
cp .env.example .env
# Fill in your own values — Stripe test keys, local DB URL, Google OAuth creds
```

**3. Set up the database**
```bash
npx prisma migrate dev
npx prisma db seed
```

**4. Run**
```bash
yarn dev
# → http://localhost:3000
```

---

## Database schema

Core models: `User`, `Product`, `Order`, `OrderItem`, `Convention`, `Vendor`, `ContactSubmission`, `EmailSubscription`

Key design decisions:
- Orders link to `User` optionally — guest checkout is fully supported
- `Product` tracks `unitsSold` and `maxUnits` for limited-edition enforcement at the DB level
- `Order` stores `stripeSessionId` for webhook reconciliation
- `Convention` model supports attendance estimates, featured flags, and watchlist subscriptions
- `Vendor` submissions require admin approval before appearing in the directory
- Watchlist subscriptions are rate-limited per IP to prevent abuse

---

## Skills demonstrated

- **Full-stack Next.js** — App Router, Server Components, API routes, middleware-based route protection
- **Database design** — Relational schema with Prisma, guest checkout, inventory enforcement, role-based access
- **Payment integration** — Stripe Checkout Sessions with webhook-confirmed order fulfillment
- **Authentication** — NextAuth with multiple providers, role-based route protection
- **Third-party APIs** — Lulu Direct print fulfillment, Google OAuth, Stripe
- **Rate limiting** — IP-based rate limiting on public subscription endpoints
- **Data pipeline** — ICS feed ingestion script that syncs external convention calendars into the database
- **Admin tooling** — Internal dashboard for orders, products, vendor approvals, and convention sync
