# Architecture

Technical architecture for **ThreadShare** – Smart Closet & P2P Marketplace.

---

## Stack

| Layer | Choice | Constraint |
|-------|--------|------------|
| Framework | Next.js 14 (App Router, TypeScript) | Vercel hosting |
| Styling | Tailwind CSS + shadcn/ui | CSS variables, responsive grid |
| Database | MySQL 8.0 (PlanetScale or Railway) | Relational schema with FK constraints |
| Auth | NextAuth.js v5 (email + Google OAuth) | JWT sessions, role-based access |
| Image Storage | Cloudinary | Free tier: 25 credits/month, 25GB storage |
| Payments | Stripe (Checkout + Webhooks) | Test mode; atomic transaction enforcement |
| Weather API | OpenWeatherMap API | Free: 1,000 calls/day; style suggestion engine |
| Deployment | Vercel (app) + PlanetScale/Railway (DB) | Free/hobby tiers |

**Third-party services:**
| Provider | Purpose | Constraint |
|----------|---------|------------|
| Cloudinary | Item image upload, optimization, CDN delivery | 25 credits/month free |
| Stripe | Rent/sale payments + security deposit holds | Webhook secret required |
| OpenWeatherMap | Context-aware outfit suggestions | 1,000 req/day free tier |

---

## App Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root: SessionProvider, fonts, Toaster
│   ├── globals.css                         # Tailwind base + design tokens
│   ├── error.tsx                           # Global error boundary
│   ├── not-found.tsx                       # 404 page
│   │
│   ├── (marketing)/                        # Public pages — MarketingNavbar + Footer
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # Landing page (/)
│   │   └── marketplace/page.tsx            # Public marketplace browsing
│   │
│   ├── (auth)/                             # Auth pages — minimal centered layout
│   │   ├── layout.tsx
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── (app)/                              # Authenticated app — AppNavbar + Sidebar
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx              # Owner dashboard: earnings, active rentals
│   │   ├── closet/
│   │   │   ├── page.tsx                    # Masonry grid inventory view
│   │   │   ├── add/page.tsx                # Upload + tag new item
│   │   │   └── [itemId]/
│   │   │       ├── page.tsx                # Item detail: wear log, cost analytics
│   │   │       └── edit/page.tsx           # Edit item metadata
│   │   ├── outfits/
│   │   │   ├── page.tsx                    # Outfit gallery
│   │   │   ├── builder/page.tsx            # Drag-and-drop outfit composer
│   │   │   └── [outfitId]/page.tsx         # Outfit detail + listing CTA
│   │   ├── marketplace/
│   │   │   ├── page.tsx                    # Filtered marketplace (rent + sale)
│   │   │   ├── [listingId]/page.tsx        # Listing detail + booking calendar
│   │   │   └── checkout/page.tsx           # Stripe checkout flow
│   │   ├── transactions/
│   │   │   ├── page.tsx                    # Transaction history (buyer + seller)
│   │   │   └── [transactionId]/page.tsx    # Transaction detail + status
│   │   ├── analytics/page.tsx              # Cost-per-wear + revenue offset stats
│   │   ├── compare/page.tsx                # "Compare Closets" style match feature
│   │   └── settings/
│   │       ├── page.tsx                    # Profile + contact info
│   │       └── payouts/page.tsx            # Stripe Connect payout settings
│   │
│   ├── (admin)/                            # Admin — AppNavbar + AdminSidebar
│   │   └── admin/
│   │       ├── page.tsx                    # Platform metrics
│   │       ├── users/page.tsx
│   │       ├── listings/page.tsx           # Moderation queue
│   │       └── transactions/page.tsx       # Dispute management
│   │
│   ├── auth/[...nextauth]/route.ts         # NextAuth route handler
│   │
│   └── api/                               # API routes
│       ├── items/
│       │   ├── route.ts                    # GET (list), POST (create)
│       │   └── [itemId]/
│       │       ├── route.ts                # GET, PATCH, DELETE
│       │       └── wear-log/route.ts       # POST: log a wear event
│       ├── outfits/
│       │   ├── route.ts                    # GET, POST
│       │   └── [outfitId]/
│       │       ├── route.ts                # GET, PATCH, DELETE
│       │       └── contents/route.ts       # POST/DELETE: manage outfit items
│       ├── listings/
│       │   ├── route.ts                    # GET (marketplace), POST (create listing)
│       │   └── [listingId]/
│       │       ├── route.ts                # GET, PATCH, DELETE
│       │       └── availability/route.ts   # GET: disabled dates from rental schedule
│       ├── transactions/
│       │   ├── route.ts                    # GET, POST (initiate)
│       │   └── [transactionId]/route.ts    # GET, PATCH (status update)
│       ├── rentals/
│       │   └── schedule/route.ts           # GET (check overlap), POST (book slot)
│       ├── analytics/
│       │   ├── cost-per-wear/route.ts      # GET: CPW per item or closet
│       │   └── revenue-offset/route.ts     # GET: earnings vs original cost
│       ├── smart/
│       │   ├── suggest/route.ts            # GET: style-match suggestions
│       │   └── compare/route.ts            # GET: closet comparison results
│       ├── upload/route.ts                 # POST: Cloudinary signed upload
│       └── webhooks/
│           └── stripe/route.ts             # Stripe event handler
│
├── components/
│   ├── ui/                                 # shadcn/ui primitives (auto-generated)
│   ├── layout/                             # Navbar, Sidebar, Footer
│   ├── marketing/                          # Landing page sections
│   ├── auth/                               # Sign-in/up forms
│   ├── closet/                             # Item card, masonry grid, upload form
│   │   ├── item-card.tsx                   # Grid tile: image, quick stats
│   │   ├── masonry-grid.tsx                # Virtualized masonry layout
│   │   ├── item-upload-form.tsx            # Multi-step upload with Cloudinary widget
│   │   └── wear-log-button.tsx             # One-tap wear event logger
│   ├── outfits/                            # Outfit builder components
│   │   ├── outfit-canvas.tsx               # Drag-and-drop composer (dnd-kit)
│   │   ├── outfit-card.tsx
│   │   └── item-picker-panel.tsx           # Sidebar: filter + pick closet items
│   ├── marketplace/                        # Listing browse + detail
│   │   ├── listing-card.tsx
│   │   ├── listing-filters.tsx
│   │   ├── booking-calendar.tsx            # Date picker: pulls disabled dates from DB
│   │   └── listing-toggle.tsx              # "List for Rent/Sale" switch on item page
│   ├── dashboard/                          # Owner dashboard widgets
│   │   ├── earnings-summary.tsx
│   │   ├── active-rentals-table.tsx
│   │   └── pending-requests-list.tsx
│   ├── analytics/                          # Cost-per-wear + revenue analytics
│   │   ├── cpw-chart.tsx
│   │   └── revenue-offset-card.tsx
│   ├── smart/                              # Smart engine UI components
│   │   ├── style-suggestions.tsx
│   │   └── closet-compare-view.tsx
│   └── shared/                             # Generic cross-feature components
│
├── lib/
│   ├── auth/
│   │   ├── config.ts                       # NextAuth config: providers, callbacks
│   │   └── hooks.ts                        # useSession, useCurrentUser
│   ├── db/
│   │   ├── client.ts                       # MySQL2 pool or Drizzle ORM client
│   │   └── queries/                        # Typed SQL query functions per domain
│   │       ├── items.ts
│   │       ├── outfits.ts
│   │       ├── listings.ts
│   │       ├── transactions.ts
│   │       ├── rentals.ts
│   │       └── analytics.ts
│   ├── cloudinary/
│   │   ├── client.ts                       # Cloudinary SDK config
│   │   └── upload.ts                       # Signed upload URL generator
│   ├── stripe/
│   │   ├── client.ts                       # Stripe SDK init
│   │   ├── checkout.ts                     # Session creation: rent + sale flows
│   │   └── webhook-handlers.ts             # payment_intent, charge, refund events
│   ├── smart-engine/
│   │   ├── style-matcher.ts                # Full-text + tag matching across closets
│   │   ├── outfit-completer.ts             # Suggest items to complete an outfit
│   │   └── closet-comparator.ts            # Size + style overlap scoring
│   ├── analytics/
│   │   ├── cost-per-wear.ts                # (purchase_price / wear_count) calculator
│   │   └── revenue-offset.ts               # earnings_total / purchase_price ratio
│   ├── hooks/                              # React hooks
│   │   ├── use-closet.ts
│   │   ├── use-listings.ts
│   │   ├── use-rental-schedule.ts
│   │   └── use-analytics.ts
│   ├── validators/
│   │   ├── item.ts                         # Zod schemas for item CRUD
│   │   ├── listing.ts                      # Listing + rental rate validation
│   │   ├── transaction.ts
│   │   └── rental.ts                       # Date overlap validation
│   ├── utils/
│   │   ├── date.ts                         # Date overlap helpers for rental logic
│   │   ├── formatters.ts                   # Currency, date, weight formatting
│   │   └── sanitize.ts                     # Input sanitization
│   ├── logger.ts                           # Structured JSON logger
│   └── constants.ts                        # Item statuses, categories, condition grades
│
├── types/
│   ├── database.ts                         # MySQL row types (mirrors DB schema)
│   ├── api.ts                              # API request/response types
│   └── marketplace.ts                      # Listing, transaction, rental types
│
└── middleware.ts                           # Next.js middleware (auth + route protection)

migrations/
├── 001_initial_schema.sql                  # Users, Items, Outfits, junction tables
├── 002_listings_transactions.sql           # Listings, Transactions, Rental_Schedule
├── 003_analytics_wear_log.sql              # Wear_Log table + computed columns
├── 004_indexes.sql                         # Performance indexes on FK + date columns
└── 005_fulltext_search.sql                 # FULLTEXT indexes for style matching

.github/workflows/ci.yml                    # CI: lint, type-check, test
```

---

## Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE Users (
  user_id       INT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(255) UNIQUE NOT NULL,
  display_name  VARCHAR(100) NOT NULL,
  avatar_url    VARCHAR(500),
  bio           TEXT,
  location      VARCHAR(100),
  rating_score  DECIMAL(3,2) DEFAULT 0.00,   -- avg of received ratings
  rating_count  INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Items
CREATE TABLE Inventory_Items (
  item_id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id         INT NOT NULL,
  title           VARCHAR(200) NOT NULL,
  category        ENUM('Tops','Bottoms','Dresses','Outerwear','Footwear','Accessories','Other'),
  size            VARCHAR(20),
  color           VARCHAR(50),
  material        VARCHAR(100),
  brand           VARCHAR(100),
  condition_grade ENUM('New','Like New','Good','Fair','Poor') DEFAULT 'Good',
  purchase_price  DECIMAL(10,2),
  image_url       VARCHAR(500),
  image_public_id VARCHAR(200),              -- Cloudinary public_id for deletion
  tags            JSON,                      -- ['casual','streetwear','summer']
  status          ENUM(
    'Available',
    'In_Use_Personal',
    'Listed_For_Rent',
    'Currently_Rented',
    'Sold'
  ) DEFAULT 'Available',
  wear_count      INT DEFAULT 0,             -- incremented via Wear_Log
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FULLTEXT INDEX ft_item_tags (title, tags)  -- used by style matcher
);

-- Wear Log (for Cost-per-Wear analytics)
CREATE TABLE Wear_Log (
  log_id    INT PRIMARY KEY AUTO_INCREMENT,
  item_id   INT NOT NULL,
  worn_on   DATE NOT NULL,
  notes     VARCHAR(255),
  FOREIGN KEY (item_id) REFERENCES Inventory_Items(item_id) ON DELETE CASCADE
);

-- Outfits (Collection entity)
CREATE TABLE Outfits (
  outfit_id   INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  cover_url   VARCHAR(500),                  -- auto-generated collage or user-picked
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Outfit_Contents (M2M junction: Items <-> Outfits)
CREATE TABLE Outfit_Contents (
  outfit_id  INT NOT NULL,
  item_id    INT NOT NULL,
  position   TINYINT DEFAULT 0,             -- drag-and-drop order
  PRIMARY KEY (outfit_id, item_id),
  FOREIGN KEY (outfit_id) REFERENCES Outfits(outfit_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id)   REFERENCES Inventory_Items(item_id) ON DELETE CASCADE
);

-- Listings (bridge: Item or Outfit → Marketplace)
CREATE TABLE Listings (
  listing_id       INT PRIMARY KEY AUTO_INCREMENT,
  seller_id        INT NOT NULL,
  item_id          INT,                      -- NULL if outfit listing
  outfit_id        INT,                      -- NULL if single item listing
  listing_type     ENUM('Rent','Sale') NOT NULL,
  daily_rate       DECIMAL(10,2),            -- required for Rent
  security_deposit DECIMAL(10,2),            -- required for Rent
  sale_price       DECIMAL(10,2),            -- required for Sale
  description      TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES Users(user_id),
  FOREIGN KEY (item_id)   REFERENCES Inventory_Items(item_id),
  FOREIGN KEY (outfit_id) REFERENCES Outfits(outfit_id),
  CHECK (item_id IS NOT NULL OR outfit_id IS NOT NULL)
);

-- Transactions
CREATE TABLE Transactions (
  transaction_id   INT PRIMARY KEY AUTO_INCREMENT,
  listing_id       INT NOT NULL,
  buyer_id         INT NOT NULL,
  seller_id        INT NOT NULL,
  transaction_type ENUM('Rent','Sale') NOT NULL,
  amount_paid      DECIMAL(10,2) NOT NULL,
  deposit_held     DECIMAL(10,2) DEFAULT 0.00,
  stripe_payment_id VARCHAR(255),
  status           ENUM('Pending','Confirmed','Active','Completed','Cancelled','Disputed')
                   DEFAULT 'Pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES Listings(listing_id),
  FOREIGN KEY (buyer_id)   REFERENCES Users(user_id),
  FOREIGN KEY (seller_id)  REFERENCES Users(user_id)
);

-- Rental_Schedule (prevents double-booking)
CREATE TABLE Rental_Schedule (
  schedule_id    INT PRIMARY KEY AUTO_INCREMENT,
  item_id        INT NOT NULL,
  transaction_id INT NOT NULL,
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  FOREIGN KEY (item_id)        REFERENCES Inventory_Items(item_id),
  FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id),
  INDEX idx_item_dates (item_id, start_date, end_date)  -- for fast overlap queries
);
```

### Key SQL Patterns

**Availability check (overlap prevention):**
```sql
-- Returns rows only if a conflict exists; empty result = available
SELECT rs.schedule_id
FROM Rental_Schedule rs
WHERE rs.item_id = :item_id
  AND rs.start_date <= :requested_end
  AND rs.end_date   >= :requested_start;
```

**Cost-per-Wear:**
```sql
SELECT
  ii.item_id,
  ii.title,
  ii.purchase_price,
  COUNT(wl.log_id) AS wear_count,
  ROUND(ii.purchase_price / NULLIF(COUNT(wl.log_id), 0), 2) AS cost_per_wear
FROM Inventory_Items ii
LEFT JOIN Wear_Log wl ON wl.item_id = ii.item_id
WHERE ii.user_id = :user_id
GROUP BY ii.item_id;
```

**Revenue Offset:**
```sql
SELECT
  ii.item_id,
  ii.title,
  ii.purchase_price,
  COALESCE(SUM(t.amount_paid), 0) AS total_earned,
  ROUND(COALESCE(SUM(t.amount_paid), 0) / NULLIF(ii.purchase_price, 0) * 100, 1)
    AS recovery_percent
FROM Inventory_Items ii
LEFT JOIN Listings    l  ON l.item_id    = ii.item_id
LEFT JOIN Transactions t  ON t.listing_id = l.listing_id
                          AND t.status    = 'Completed'
WHERE ii.user_id = :user_id
GROUP BY ii.item_id;
```

**Style matching across closets (Smart Engine):**
```sql
-- Full-text search + self-join to find complementary items from other users
SELECT ii.item_id, ii.title, ii.user_id, ii.tags,
       MATCH(ii.title, ii.tags) AGAINST (:style_query IN BOOLEAN MODE) AS relevance
FROM Inventory_Items ii
WHERE ii.user_id  != :current_user_id
  AND ii.status    = 'Listed_For_Rent'
  AND MATCH(ii.title, ii.tags) AGAINST (:style_query IN BOOLEAN MODE)
ORDER BY relevance DESC
LIMIT 20;
```

---

## Route Architecture

Four route groups with distinct layouts:

| Group | Layout | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `(marketing)` | MarketingNavbar + Footer | Public landing + marketplace browse | No |
| `(auth)` | Minimal centered | Sign in/up, password reset | No |
| `(app)` | AppNavbar + Sidebar | Closet, outfits, listings, dashboard | Yes |
| `(admin)` | AppNavbar + AdminSidebar | Moderation, user management | Yes (admin role) |

**Public routes:** `/`, `/marketplace`, `/signin`, `/signup`, `/forgot-password`

**Protected routes (authenticated):** `/dashboard`, `/closet/*`, `/outfits/*`, `/marketplace/[listingId]`, `/marketplace/checkout`, `/transactions/*`, `/analytics`, `/compare`, `/settings/*`

**Admin routes:** `/admin/*`

---

## Auth Model

**Provider:** NextAuth.js v5

**Methods:**
- Email/password (with bcrypt hashing)
- Google OAuth

**Roles:**
- `guest` — unauthenticated; can browse the public marketplace only
- `member` — authenticated; full closet + marketplace access
- `admin` — platform operator; moderation + dispute resolution

**Implementation:**
- `SessionProvider` wraps the app; `useSession()` available client-side
- `middleware.ts` checks session on every request:
  - Redirects unauthenticated users from protected routes to `/signin`
  - Redirects non-admin users from `/admin/*` to `/dashboard`
- Role stored in `Users.role` column (synced into JWT)

---

## Item Status Lifecycle

```
AVAILABLE
  ├─── [User uses personally]       → IN_USE_PERSONAL → AVAILABLE
  ├─── [User lists for rent]        → LISTED_FOR_RENT
  │       ├─── [Renter books]       → CURRENTLY_RENTED → AVAILABLE (on return)
  │       └─── [Delisted]           → AVAILABLE
  └─── [User lists for sale]        → (sale listing active)
          └─── [Buyer purchases]    → SOLD
```

Status transitions are enforced in `lib/constants.ts` via a transition map. API routes reject invalid transitions with HTTP 409.

---

## Atomic Rental Transaction Flow

Booking a rental must not partially succeed. The sequence is enforced atomically:

```
Client                              Server
  │                                   │
  ├── POST /api/listings/[id]/book ──→ 1. Validate dates (overlap check)
  │                                   2. BEGIN TRANSACTION
  │                                   3. INSERT Rental_Schedule row
  │                                   4. CREATE Stripe PaymentIntent
  │                                      (hold security_deposit + daily_rate × days)
  │                                   5. INSERT Transactions row (status=Pending)
  │                                   6. UPDATE Inventory_Items status → Currently_Rented
  │                                   7. COMMIT
  │◄── { clientSecret, txnId } ──────┤
  │                                   │
  ├── [Client confirms payment on Stripe UI]
  │                                   │
  ├── Stripe webhook ──────────────→  8. payment_intent.succeeded
  │                                   9. UPDATE Transactions status → Confirmed
  │◄── 200 OK ────────────────────────┤

On any failure in steps 3–7: ROLLBACK + return 409 / 500
On Stripe webhook failure: Rental_Schedule stays; Stripe retries webhook
```

**Why atomic:** A partial failure (schedule blocked but payment failed, or payment charged but schedule not written) would either double-book an item or charge a user for nothing. MySQL transactions + Stripe webhook confirmation prevent both.

---

## Frontend Architecture

### Key UI Patterns

**Masonry Grid (Closet page):**
- Uses CSS Grid with `grid-auto-rows` and `span` trick, or `react-masonry-css`
- Virtualized with `react-virtual` for large closets (100+ items)
- Each `ItemCard` shows: image, brand, condition badge, wear count, CPW chip

**Booking Calendar (Listing detail):**
- Date range picker (e.g., `react-day-picker`)
- On mount: `GET /api/listings/[id]/availability` → returns array of blocked date ranges from `Rental_Schedule`
- Blocked dates rendered as disabled in the calendar UI
- On selection: optimistic UI + server-side overlap re-validation before Stripe checkout

**Drag-and-Drop Outfit Builder:**
- `dnd-kit` (sortable + droppable canvas)
- Left panel: user's closet with category/color filters
- Canvas: up to 10 item slots; each item shown as a cropped image tile
- On save: `POST /api/outfits/[id]/contents` with ordered item_id array

**Owner Dashboard:**
- Three summary cards: Total Earnings, Items Currently Out, Pending Requests
- Active Rentals table: item name, renter, return date, deposit status
- Pending Requests list: accept / decline with single click

---

## Smart Engine

The "Smart Engine" is a collection of server-side query functions in `lib/smart-engine/`, not an external ML service.

| Feature | Mechanism |
|---------|-----------|
| Outfit Completer | Reads current outfit's item tags → FULLTEXT query across listed items for matching style/color tags |
| Style Suggestions | Tag-based cosine similarity on JSON tag arrays using MySQL JSON_CONTAINS + FULLTEXT |
| Compare Closets | Size equality filter → style tag overlap count → rank by shared_tags DESC |

These run on-demand per request; no background jobs needed at v1 scale.

---

## Third-Party Integrations

| Service | Purpose | Rate Limit | Notes |
|---------|---------|------------|-------|
| Cloudinary | Image upload, CDN delivery, transformations | 25 credits/month free | Signed uploads via server-generated signature |
| Stripe | Checkout, PaymentIntents, security deposit holds | No limit (test mode) | Webhook signature verified via `STRIPE_WEBHOOK_SECRET` |
| OpenWeatherMap | Outfit style suggestions by weather context | 1,000 calls/day free | Optional; graceful degradation if unavailable |
| NextAuth.js | Authentication (email + Google OAuth) | N/A (self-hosted) | JWT strategy |

All external API calls have timeouts: Stripe 15s, Cloudinary 30s, OpenWeatherMap 5s.

**Graceful degradation:**
- If OpenWeatherMap is unavailable, the style suggestion engine falls back to tag-only matching (no weather context).
- Cloudinary failures return a structured error; the item can be saved without an image and updated later.

---

## Environment Variables

| Variable | Dev | Production | Notes |
|----------|-----|------------|-------|
| `DATABASE_URL` | Local MySQL connection string | PlanetScale / Railway URL | Server-only |
| `NEXTAUTH_SECRET` | Any random string | Strong random secret | Server-only, required |
| `NEXTAUTH_URL` | `http://localhost:3000` | Production domain | Server-only |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Same | Server-only |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | Same | Server-only |
| `CLOUDINARY_CLOUD_NAME` | Personal cloud name | Same | Safe to expose (public) |
| `CLOUDINARY_API_KEY` | API key | Same | Server-only |
| `CLOUDINARY_API_SECRET` | API secret | Same | Server-only, never expose |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` | Server-only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` | Public, for Stripe.js |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | `whsec_...` | Server-only, for webhook verification |
| `OPENWEATHER_API_KEY` | Personal key | Same | Server-only |

**Security rules:**
- Never prefix server-only keys with `NEXT_PUBLIC_`
- `.env.local` is gitignored
- Production variables set via Vercel dashboard
- Database URL gives full access — only use in `lib/db/client.ts`, never client code

---

## API Design

**Conventions:**
- All routes follow Next.js App Router convention (`src/app/api/`)
- Each route file exports method handlers: `GET`, `POST`, `PATCH`, `DELETE`
- Request bodies validated with Zod before any DB call
- Business logic in `src/lib/`; route handlers handle HTTP concerns only

**Standard error shape:**
```typescript
{
  error: string;      // Machine-readable code e.g. "ITEM_NOT_FOUND"
  message: string;    // Human-readable description
  details?: unknown;  // Zod validation errors, if applicable
}
```

**Auth in API routes:**
- Session read via `getServerSession()` from NextAuth
- Return `401` if unauthenticated
- Return `403` if user does not own the resource (ownership check for all mutations)
- Return `409` if status transition is invalid or rental dates overlap

---

## Observability

**Implemented (v1):**
- Structured JSON logger (`src/lib/logger.ts`) for all server-side code
- Stripe webhook events logged with payment intent ID + event type
- Rental conflict detection logged with item_id + requested dates

**Not in v1:**
- No APM, tracing, or external error tracking (Sentry deferred)
- No custom admin analytics dashboard

**Future consideration:**
- Vercel Analytics (free tier) for page-level performance
- PlanetScale Insights for slow query detection
- Sentry for production error tracking
