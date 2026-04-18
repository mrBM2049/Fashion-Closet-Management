# ThreadShare — Fashion Closet Management System

A full-stack wardrobe management web app built as a DBMS college project at PDEU.
Manage your clothing inventory, build outfits, track wear history, and view cost-per-wear analytics.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.2.3 |
| Language | TypeScript | v6 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS (CSS-first, no config file) | v4 |
| Components | shadcn/ui (new-york style, OKLCH colors) | latest |
| Icons | lucide-react | latest |
| Auth | Auth.js (NextAuth v5 beta) | 5.0.0-beta.30 |
| Database | MySQL 8.0 via XAMPP | — |
| DB Driver | mysql2 (Promise API) | 3.21.1 |
| Passwords | bcryptjs | 3.x |
| Toasts | sonner | 2.x |

---

## Prerequisites

- Node.js 22 LTS
- MySQL 8.0 running locally (XAMPP or MySQL Workbench)
- Git

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd Fashion-Closet-Management
npm install
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=threadshare

AUTH_SECRET=any-random-32-char-string
AUTH_URL=http://localhost:3000
```

**Important:**
- Use `127.0.0.1` not `localhost` on Windows — MySQL listens on IPv4, not IPv6
- Do **not** wrap values in quotes — write `DB_PASSWORD=mypass` not `DB_PASSWORD="mypass"`
- `.env.local` is gitignored and never committed — each developer needs their own copy

### 3. Create the database

In MySQL Workbench or CLI:

```sql
CREATE DATABASE threadshare
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 4. Run schema and seed

```bash
# Via MySQL CLI
mysql -u root -p threadshare < database/schema.sql
mysql -u root -p threadshare < database/seed.sql
```

Or open each file in MySQL Workbench and execute.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Objects

| Object | Type | Purpose |
|--------|------|---------|
| `Users` | Table | Registered users |
| `Categories` | Table | Self-referencing clothing categories |
| `Inventory_Items` | Table | Core wardrobe items (FULLTEXT indexed) |
| `Wear_Log` | Table | Per-item wear history |
| `Outfits` | Table | Named outfit collections |
| `Outfit_Items` | Table | M:N junction — outfits ↔ items |
| `Transactions` | Table | Sales and borrows between users |
| `trg_wear_count_increment` | Trigger | Auto-increments `wear_count` on Wear_Log insert |
| `trg_update_item_status_on_sale` | Trigger | Marks item as Sold when transaction completes |
| `sp_add_wear_entry` | Stored Procedure | Validates item then inserts wear log entry |
| `v_cost_per_wear` | View | Calculates cost-per-wear per item |

---

## Route Map

### Public routes (no login required)

| Route | Description |
|-------|-------------|
| `/signin` | Sign in with email + password |
| `/signup` | Create a new account |

> Logged-in users visiting `/signin` or `/signup` are automatically redirected to `/closet`.

### Protected routes (login required)

Unauthenticated access to any route below redirects to `/signin`.

| Route | Description |
|-------|-------------|
| `/closet` | Pinterest-style wardrobe grid with filter bar |
| `/closet/add` | Add a new clothing item |
| `/closet/[itemId]` | Item detail — wear log, log wear, edit, delete |
| `/closet/[itemId]/edit` | Edit item details |
| `/outfits` | Gallery of saved outfit looks |
| `/outfits/create` | Build a new outfit by selecting closet items |
| `/analytics` | Cost-per-wear table, most-worn, never-worn *(Phase 5)* |
| `/transactions` | Transaction history and create form *(Phase 6)* |

### API routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/items` | Fetch items with filters (cat, color, size, status, FULLTEXT search) |
| GET | `/api/items/[itemId]` | Single item + wear log |
| PATCH | `/api/items/[itemId]` | Update item |
| DELETE | `/api/items/[itemId]` | Delete item |
| POST | `/api/items/[itemId]/wear` | Log a wear entry (calls stored procedure) |
| GET | `/api/categories` | All categories |
| GET | `/api/outfits` | List outfits with item count |
| POST | `/api/outfits` | Create outfit (atomic transaction) |
| GET | `/api/outfits/[outfitId]` | Outfit detail with items (M:N join) |
| DELETE | `/api/outfits/[outfitId]` | Delete outfit |
| GET | `/api/auth/[...nextauth]` | Auth.js v5 handler |
| POST | `/api/auth/[...nextauth]` | Auth.js v5 handler |

---

## Project Structure

```
src/
├── auth.ts                          # Auth.js v5 full config (Node.js runtime)
├── auth.config.ts                   # Edge-safe auth config (middleware only)
├── middleware.ts                    # Route protection + auth redirect
│
├── app/
│   ├── layout.tsx                   # Root layout — fonts, Toaster
│   ├── globals.css                  # Tailwind v4 CSS-first + OKLCH theme
│   ├── (auth)/
│   │   ├── layout.tsx               # Centered auth layout
│   │   ├── signin/page.tsx          # Sign-in form
│   │   └── signup/page.tsx          # Sign-up form
│   ├── (app)/
│   │   ├── layout.tsx               # App shell with Navbar
│   │   ├── closet/
│   │   │   ├── page.tsx             # Wardrobe grid + FilterBar
│   │   │   ├── add/page.tsx         # Add item
│   │   │   └── [itemId]/
│   │   │       ├── page.tsx         # Item detail + wear log
│   │   │       └── edit/page.tsx    # Edit item
│   │   ├── outfits/
│   │   │   ├── page.tsx             # Outfit gallery
│   │   │   └── create/page.tsx      # Outfit builder
│   │   ├── analytics/page.tsx       # Analytics dashboard (Phase 5)
│   │   └── transactions/page.tsx    # Transactions (Phase 6)
│   └── api/
│       ├── auth/[...nextauth]/      # Auth.js handler
│       ├── items/                   # Items CRUD + wear logging
│       ├── outfits/                 # Outfits CRUD
│       └── categories/              # Categories list
│
├── components/
│   ├── layout/Navbar.tsx            # Top navigation
│   ├── closet/
│   │   ├── ItemCard.tsx             # Item tile
│   │   ├── ClosetGrid.tsx           # CSS auto-fill grid
│   │   ├── FilterBar.tsx            # URL-param filters
│   │   └── AddItemForm.tsx          # Add item form
│   ├── outfits/
│   │   ├── OutfitCard.tsx           # Outfit card with thumbnails
│   │   └── OutfitBuilder.tsx        # Checkbox item picker
│   └── ui/                          # shadcn/ui components
│
├── lib/
│   ├── db/client.ts                 # mysql2 connection pool
│   ├── actions/
│   │   ├── auth.ts                  # signUp, signInUser
│   │   ├── items.ts                 # addItem, updateItem, deleteItem, logWear
│   │   └── outfits.ts               # createOutfit, deleteOutfit
│   └── utils.ts                     # cn() className utility
│
├── types/index.ts                   # TypeScript interfaces for all DB entities
└── database/
    ├── schema.sql                   # Full DDL — tables, triggers, view, indexes
    ├── seed.sql                     # Sample data
    └── queries.sql                  # Viva reference queries
```

---

## DBMS Concepts Covered

| Concept | Where |
|---------|-------|
| ER Model | 6 entities, all relationships |
| Relational Model, PKs, FKs | Every table |
| SQL DDL | `CREATE TABLE`, `TRIGGER`, `PROCEDURE`, `VIEW` |
| SQL DML | `SELECT`, `INSERT`, `UPDATE`, `DELETE` in every action |
| JOINs (INNER, LEFT) | Closet+Category, Outfit+Items, Transaction+Users |
| Aggregate Functions | `COUNT`, `ROUND`, `NULLIF`, `COALESCE` |
| Subqueries | "Items never worn" analytics query |
| GROUP BY | Analytics aggregations |
| FULLTEXT Index | Item search by name/brand/description |
| Views | `v_cost_per_wear` on analytics page |
| Triggers | `trg_wear_count_increment`, `trg_update_item_status_on_sale` |
| Stored Procedures | `sp_add_wear_entry` |
| Normalization 1NF–3NF | Per-table in DB_SCHEMA.md |
| Transactions (ACID) | Outfit creation, sale recording |
| Indexes | FK columns, FULLTEXT, status, color |
| Self-referencing FK | `Categories.parent_id` |
| M:N Relationship | `Outfit_Items` junction table |
| ENUMs & CHECK Constraints | Multiple per table |

---

## Build

```bash
npm run build   # production build
npm run dev     # development server (Turbopack)
npx tsc --noEmit  # type check only
```

---

## Progress

- [x] Phase 1 — Project Setup & Database
- [x] Phase 2 — Authentication
- [x] Phase 3 — Closet
- [x] Phase 4 — Outfits
- [ ] Phase 5 — Analytics
- [ ] Phase 6 — Transactions
- [ ] Phase 7 — Polish & Seed Data
