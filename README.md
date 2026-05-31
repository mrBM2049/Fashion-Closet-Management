# ThreadShare — Fashion Closet Management System

A full-stack wardrobe management web app built as a DBMS college project at PDEU.
Manage your clothing inventory, build outfits, track wear history, and view cost-per-wear analytics.

---

## 📊 Project Flow

```mermaid
graph TD
    User((User)) --> Auth{Authentication}
    Auth -- Success --> Dashboard[Closet Dashboard]
    Auth -- Fail --> SignIn[Sign In / Sign Up]

    Dashboard --> Items[Inventory Items]
    Dashboard --> Outfits[Outfits]
    Dashboard --> Analytics[Analytics]
    Dashboard --> Transactions[Transactions]

    Items --> AddItem[Add Item]
    Items --> EditItem[Edit/Delete Item]
    Items --> LogWear[Log Wear Entry]

    LogWear --> Trigger[Trig: Increment Wear Count]
    
    Outfits --> CreateOutfit[Create Outfit Builder]
    CreateOutfit --> DB_Transaction[DB Atomic Transaction]

    Transactions --> Sale[Record Sale]
    Sale --> TriggerStatus[Trig: Mark as Sold]

    Analytics --> CPW_View[v_cost_per_wear View]
```

---

## ⚙️ Code Flow (Debug Guide)

Use this flow to trace data from the UI to the database.

```mermaid
sequenceDiagram
    participant UI as Client Component (UI)
    participant Action as Server Action (src/lib/actions)
    participant DB as DB Client (src/lib/db/client.ts)
    participant PG as PostgreSQL DB

    UI->>Action: Call action(formData)
    Action->>Action: auth() check (verify session)
    Action->>DB: db.execute(sql, params)
    DB->>DB: Convert MySQL syntax to PG ($1, etc.)
    DB->>PG: query(convertedSql, params)
    PG-->>DB: return result
    DB-->>Action: return [rows/insertId]
    Action->>Action: revalidatePath() (clear cache)
    Action->>UI: redirect() or return status
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.2.3 |
| Language | TypeScript | v5 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS v4 | v4 |
| Auth | Auth.js (NextAuth v5 beta) | 5.0.0-beta.30 |
| Database | PostgreSQL (Supabase/Hosted) | — |
| DB Driver | pg (Postgres Node.js) | 8.21.0 |
| Passwords | bcryptjs | 3.x |
| Toasts | sonner | 2.x |

---

## Prerequisites

- Node.js 22 LTS
- PostgreSQL Database (Supabase or local Postgres)
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
DATABASE_URL=postgresql://user:password@host:port/dbname

AUTH_SECRET=any-random-32-char-string
AUTH_URL=http://localhost:3000
```

### 3. Run schema and seed

```bash
# Via psql or your DB client
psql -d your_db_name -f database/schema_postgres.sql
psql -d your_db_name -f database/seed_postgres.sql
```

### 4. Start the dev server

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
| `Inventory_Items` | Table | Core wardrobe items |
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

### Protected routes (login required)

| Route | Description |
|-------|-------------|
| `/closet` | Pinterest-style wardrobe grid with filter bar |
| `/closet/add` | Add a new clothing item |
| `/closet/[itemId]` | Item detail — wear log, log wear, edit, delete |
| `/outfits` | Gallery of saved outfit looks |
| `/outfits/create` | Build a new outfit by selecting closet items |
| `/analytics` | Cost-per-wear table and metrics |
| `/transactions` | Transaction history |

---

## Project Structure

```
src/
├── auth.ts                          # Auth.js v5 full config
├── auth.config.ts                   # Edge-safe auth config (middleware)
│
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── (auth)/                      # Auth routes group
│   ├── (app)/                       # Protected app routes group
│   └── api/                         # Next.js API Routes
│
├── components/
│   ├── layout/                      # Navbar, Sidebar
│   ├── closet/                      # Closet specific components
│   └── ui/                          # Shared UI (shadcn)
│
├── lib/
│   ├── db/client.ts                 # PostgreSQL client with MySQL compatibility layer
│   ├── actions/                     # Server Actions (Business Logic)
│   └── utils.ts                     # Utilities
│
└── database/
    ├── schema_postgres.sql          # Postgres DDL
    └── seed_postgres.sql            # Sample data
```

---

## Progress

- [x] Phase 1 — Project Setup & Database
- [x] Phase 2 — Authentication
- [x] Phase 3 — Closet
- [x] Phase 4 — Outfits
- [x] Phase 5 — Analytics
- [x] Phase 6 — Transactions
- [x] Phase 7 — Polish & Seed Data


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
