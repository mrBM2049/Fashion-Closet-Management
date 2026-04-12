# Architecture – ThreadShare (College Project)

**Fashion Closet Management System** | DBMS Subject | PDEU  
Pinterest-style personal wardrobe manager with filtering and outfit builder.

---

## Stack

| Layer | Package | Version | Notes |
|-------|---------|---------|-------|
| Framework | `next` | **16.2** | App Router, Turbopack default, async params |
| Language | TypeScript | **v6** | Strict mode |
| UI Runtime | `react` / `react-dom` | **19.2.5** | Server Components, Actions API, Activity |
| Styling | `tailwindcss` | **v4** | CSS-first config — no `tailwind.config.js` |
| Components | `shadcn/ui` | **latest (new-york)** | Tailwind v4 + React 19, OKLCH colors |
| Animation | `tw-animate-css` | latest | Replaces deprecated `tailwindcss-animate` |
| Auth | `next-auth` | **v5-beta (Auth.js)** | Root-level `auth.ts` pattern, `AUTH_SECRET` |
| DB Driver | `mysql2` | **3.21.1** | Promise API, prepared statements, `await using` |
| Passwords | `bcryptjs` | latest | Credential hashing |
| Toasts | `sonner` | latest | shadcn/ui deprecated its own toast in v4 |

**No Stripe. No cloud APIs. No webhooks.** Intentionally simple for college scope.

### Install Commands

```bash
# 1. Scaffold project (Next.js 16 + Turbopack)
npx create-next-app@latest threadshare --typescript --tailwind --app --turbopack
cd threadshare

# 2. Core runtime deps
npm install mysql2 next-auth@beta bcryptjs sonner

# 3. shadcn/ui — Tailwind v4 + React 19 compatible
npx shadcn@latest init
# Prompts: style → new-york | base color → neutral | CSS variables → yes
```

---

## Tailwind v4 Setup

Tailwind v4 is **CSS-first** — `tailwind.config.js` no longer exists. All configuration is in `globals.css`.

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* Map shadcn/ui OKLCH variables into Tailwind's theme */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary:    var(--primary);
  --color-muted:      var(--muted);
  --radius-lg:        var(--radius);
  --radius-md:        calc(var(--radius) - 2px);
  --radius-sm:        calc(var(--radius) - 4px);
}

/* Light mode — OKLCH instead of old HSL */
:root {
  --background:  oklch(1 0 0);
  --foreground:  oklch(0.145 0 0);
  --primary:     oklch(0.205 0 0);
  --muted:       oklch(0.97 0 0);
  --radius:      0.625rem;
}

.dark {
  --background:  oklch(0.145 0 0);
  --foreground:  oklch(0.985 0 0);
  --primary:     oklch(0.922 0 0);
  --muted:       oklch(0.269 0 0);
}
```

> **Key v4 changes vs v3:** `@import "tailwindcss"` replaces `@tailwind base/components/utilities`. Colors use **OKLCH** instead of HSL. No `tailwind.config.js` needed at all.

---

## Auth.js v5 Setup

Auth.js v5 (the new name for NextAuth) uses a single root-level `auth.ts` file and exports `{ handlers, auth, signIn, signOut }`.

```typescript
// auth.ts  (project root)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db/client";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const [rows] = await db.execute(
          "SELECT user_id, email, username, password_hash, role FROM Users WHERE email = ?",
          [credentials.email]
        );
        const user = (rows as any[])[0];
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!valid) return null;
        return { id: String(user.user_id), email: user.email, name: user.username, role: user.role };
      },
    }),
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role   = (user as any).role;
        token.userId = (user as any).id;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as any).role   = token.role;
      (session.user as any).userId = token.userId;
      return session;
    },
  },
});
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

```typescript
// middleware.ts  — protect all app routes
import { auth } from "@/auth";
export default auth((req) => {
  if (!req.auth) return Response.redirect(new URL("/signin", req.url));
});
export const config = {
  matcher: ["/closet/:path*", "/outfits/:path*", "/analytics", "/transactions"],
};
```

---

## Database Connection (mysql2 v3)

```typescript
// lib/db/client.ts
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host:               process.env.DB_HOST     ?? "localhost",
  user:               process.env.DB_USER     ?? "root",
  password:           process.env.DB_PASSWORD ?? "",
  database:           process.env.DB_NAME     ?? "threadshare",
  waitForConnections: true,
  connectionLimit:    5,
});
```

**mysql2 v3 — Explicit Resource Management (`await using`):**

```typescript
// Connection auto-released when it leaves scope (no manual .release() needed)
await using conn = await db.getConnection();
const [rows] = await conn.execute(
  "SELECT * FROM Inventory_Items WHERE user_id = ?",
  [userId]
);
```

---

## App Structure

```
threadshare/
├── auth.ts                               # Auth.js v5 config (root-level)
├── middleware.ts                         # Route protection via auth()
│
├── app/
│   ├── layout.tsx                        # Root layout — Toaster (sonner), fonts
│   ├── globals.css                       # Tailwind v4 CSS config + OKLCH theme
│   │
│   ├── (auth)/
│   │   ├── layout.tsx                    # Centered minimal layout
│   │   ├── signin/page.tsx               # Sign-in form → Server Action
│   │   └── signup/page.tsx               # Register form → Server Action
│   │
│   ├── (app)/
│   │   ├── layout.tsx                    # Navbar + Sidebar
│   │   ├── closet/
│   │   │   ├── page.tsx                  # Pinterest grid + FilterBar  ← MAIN
│   │   │   ├── add/page.tsx              # Add item form → Server Action
│   │   │   └── [itemId]/page.tsx         # Item detail + wear log table
│   │   ├── outfits/
│   │   │   ├── page.tsx                  # Outfit gallery
│   │   │   └── create/page.tsx           # Multi-select items → save outfit
│   │   ├── analytics/page.tsx            # CPW table + most/never worn
│   │   └── transactions/page.tsx         # Transaction history + create form
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts   # Auth.js v5 handler
│       ├── items/
│       │   ├── route.ts                  # GET (filtered), POST
│       │   └── [itemId]/
│       │       ├── route.ts              # GET, PATCH, DELETE
│       │       └── wear/route.ts         # POST: log wear → stored procedure
│       ├── outfits/
│       │   ├── route.ts                  # GET, POST
│       │   └── [outfitId]/route.ts       # GET, DELETE
│       ├── transactions/route.ts         # GET, POST
│       └── categories/route.ts           # GET (seed data)
│
├── components/
│   ├── ui/                               # shadcn/ui (new-york, Tailwind v4)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── closet/
│   │   ├── ItemCard.tsx                  # Image tile + badges + wear count
│   │   ├── ClosetGrid.tsx                # CSS Grid auto-fill
│   │   ├── FilterBar.tsx                 # Category | Color | Size | Status + search
│   │   └── AddItemForm.tsx
│   ├── outfits/
│   │   ├── OutfitCard.tsx
│   │   └── OutfitBuilder.tsx             # Checkbox item picker → save
│   ├── analytics/
│   │   └── CostPerWearTable.tsx          # Sortable table from SQL view
│   └── shared/
│       ├── Badge.tsx
│       └── EmptyState.tsx
│
├── lib/
│   ├── db/
│   │   ├── client.ts                     # mysql2 v3 pool
│   │   └── queries/
│   │       ├── items.ts
│   │       ├── outfits.ts
│   │       ├── wearLog.ts
│   │       ├── transactions.ts
│   │       └── categories.ts
│   └── actions/                          # Next.js 16 Server Actions
│       ├── items.ts                      # addItem, updateItem, deleteItem, logWear
│       ├── outfits.ts                    # createOutfit, deleteOutfit
│       └── auth.ts                       # signUp, signInUser
│
├── types/
│   └── index.ts                          # TypeScript interfaces matching DB rows
│
└── database/
    ├── schema.sql                        # Full DDL: tables, triggers, view, indexes
    ├── seed.sql                          # 5 users, 30+ items, outfits, transactions
    └── queries.sql                       # Key queries for viva reference
```

---

## Server Actions (Next.js 16)

Next.js 16 Server Actions are the modern way to handle form submissions — no separate API route needed for mutations.

```typescript
// lib/actions/items.ts
"use server";
import { auth } from "@/auth";
import { db }   from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function addItem(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).userId;
  const name   = formData.get("name")     as string;
  const brand  = formData.get("brand")    as string | null;
  const catId  = formData.get("cat_id")   as string | null;
  const color  = formData.get("color")    as string | null;
  const size   = formData.get("size")     as string | null;

  await db.execute(
    `INSERT INTO Inventory_Items (user_id, name, brand, cat_id, color, size)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, name, brand, catId, color, size]
  );

  revalidatePath("/closet");
}

export async function logWear(itemId: number, occasion: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Calls stored procedure — trigger auto-increments wear_count
  await db.execute("CALL sp_add_wear_entry(?, CURDATE(), ?)", [itemId, occasion]);
  revalidatePath(`/closet/${itemId}`);
}
```

```tsx
// Usage in a Server Component page
import { addItem } from "@/lib/actions/items";

export default function AddItemPage() {
  return (
    <form action={addItem}>
      <input name="name"  placeholder="e.g. Vintage Levi's Jacket" required />
      <input name="brand" placeholder="Brand" />
      <button type="submit">Add to Closet</button>
    </form>
  );
}
```

---

## Pages & Features

### `/closet` — Pinterest Grid (Core Page)

```tsx
// Responsive CSS Grid — no library needed
<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
  {items.map(item => <ItemCard key={item.item_id} item={item} />)}
</div>
```

**FilterBar** sends `?cat_id=1&color=black&size=M` query params → server re-fetches with filters.

---

### `/analytics` — Data Dashboard

Three sections using SQL directly:

| Section | SQL Used |
|---------|----------|
| Cost-per-wear table | `SELECT * FROM v_cost_per_wear WHERE user_id = ?` |
| Most worn | `ORDER BY wear_count DESC LIMIT 5` |
| Never worn | `WHERE item_id NOT IN (SELECT DISTINCT item_id FROM Wear_Log)` |

---

## Environment Variables

```env
# .env.local
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=threadshare

AUTH_SECRET=any-32-char-random-string
AUTH_URL=http://localhost:3000
```

> Auth.js v5 uses `AUTH_SECRET` and `AUTH_URL` — the old `NEXTAUTH_*` names still work as aliases.

---

## Data Flow — Log Wear

```
User clicks "Log Wear" on /closet/[itemId]
            │
            ▼ (Server Action — no client JS needed)
  logWear(itemId, occasion)
    → await auth()                         ← verify session (Auth.js v5)
    → CALL sp_add_wear_entry(id, date, oc) ← stored procedure
            │
            ▼
  Stored Procedure inserts into Wear_Log
            │
            ▼
  Trigger fires: UPDATE Inventory_Items
                 SET wear_count = wear_count + 1
            │
            ▼
  revalidatePath("/closet/[itemId]")       ← Next.js 16 cache bust
            │
            ▼
  Page re-renders with new wear_count — no full reload
```

---

## Syllabus Coverage Map

| DBMS Topic | Where in Project |
|---|---|
| ER Model & Entity Types | 6 entities + all relationships in DB_SCHEMA.md |
| Relational Model, Keys, FK | Every table: PK, FK, UNIQUE, CHECK constraints |
| Referential Integrity | `ON DELETE CASCADE` / `ON DELETE SET NULL` |
| SQL DML (SELECT, INSERT, UPDATE, DELETE) | Every Server Action + API route |
| WHERE, ORDER BY, LIMIT | Closet filter queries, analytics |
| JOINs (INNER, LEFT) | Closet+Category, Outfit+Items, Transaction+Users |
| Aggregate Functions | `COUNT`, `ROUND`, `NULLIF`, `COALESCE` in view |
| Subqueries | "Items never worn" on analytics page |
| GROUP BY | Analytics aggregations |
| FULLTEXT Search | Item search on MySQL FULLTEXT index |
| Views | `v_cost_per_wear` used on analytics page |
| Triggers | `trg_wear_count_increment`, `trg_update_item_status_on_sale` |
| Stored Procedures | `sp_add_wear_entry` called from Server Action |
| Normalization 1NF–3NF | Per-table notes in DB_SCHEMA.md |
| Transactions (ACID) | `START TRANSACTION … COMMIT` for outfit create + sale |
| Indexes | All FK columns + FULLTEXT + status + color |
| Self-referencing FK | `Categories.parent_id → Categories.cat_id` |
| M:N Relationship | `Outfit_Items` junction table |
| ENUMs & CHECK Constraints | `condition_grade`, `status`, `role`, `chk_diff_users` |

---

## What's New vs Previous Version

| Old | New (This Version) |
|-----|--------------------|
| Next.js 14 | **Next.js 16.2** — Turbopack stable default, async params, Cache Components |
| React 18 | **React 19.2.5** — Server Actions, `use()`, Activity, View Transitions |
| Tailwind v3 (tailwind.config.js) | **Tailwind v4** — CSS-first, `@import "tailwindcss"`, OKLCH colors |
| shadcn/ui (HSL + tailwindcss-animate) | **shadcn/ui new-york** (OKLCH + tw-animate-css, `data-slot` attributes) |
| NextAuth v5 old pattern | **Auth.js v5** — root `auth.ts`, `AUTH_SECRET`, middleware via `auth()` |
| mysql2 older | **mysql2 v3.21.1** — `await using` Explicit Resource Management |
| Form → fetch() → API route | **Server Actions** — `<form action={serverFn}>` directly |
