# Execution Plan – ThreadShare (College Project)

**Fashion Closet Management System** | DBMS Subject | PDEU  
Build order for a demo-ready college project using the latest 2025/2026 stack.

---

## Tech Versions Reference

| Package | Version | Install |
|---------|---------|---------|
| Node.js | **22 LTS** | [nodejs.org](https://nodejs.org) |
| Next.js | **16.2** | `npx create-next-app@latest` |
| React | **19.2.5** | included with Next.js |
| TypeScript | **v6** | included with Next.js |
| Tailwind CSS | **v4** | included via create-next-app |
| shadcn/ui | **latest (new-york)** | `npx shadcn@latest init` |
| Auth.js | **v5-beta** | `npm install next-auth@beta` |
| mysql2 | **3.21.1** | `npm install mysql2` |
| bcryptjs | latest | `npm install bcryptjs` |
| sonner | latest | `npm install sonner` |

---

## Prerequisites

- [ ] Node.js **22 LTS** installed
- [ ] MySQL 8.0 via **XAMPP** or **MySQL Workbench** running locally
- [ ] VS Code with extensions: ESLint, Tailwind CSS IntelliSense, Prisma (optional)
- [ ] Git repository initialized

No cloud accounts required. Everything runs on localhost.

---

## Phase Dependency Chain

```
Phase 1: Project Setup & Database
          ↓
Phase 2: Authentication (Auth.js v5)
          ↓
Phase 3: Closet – Core Feature        ← Demo checkpoint 1
          ↓
Phase 4: Outfits
          ↓
Phase 5: Analytics                    ← Demo checkpoint 2
          ↓
Phase 6: Transactions
          ↓
Phase 7: Polish & Seed Data           ← Final submission
```

---

## Phase 1 — Project Setup & Database

**Goal:** Running Next.js 16 app connected to MySQL with all tables, triggers, view, and indexes created.

### Steps

**1. Scaffold with Turbopack (Next.js 16)**
```bash
npx create-next-app@latest threadshare \
  --typescript \
  --tailwind \
  --app \
  --turbopack \
  --src-dir

cd threadshare
```

**2. Install dependencies**
```bash
npm install mysql2 next-auth@beta bcryptjs sonner
```

**3. Init shadcn/ui (Tailwind v4 + React 19)**
```bash
npx shadcn@latest init
# → style: new-york
# → base color: neutral
# → CSS variables: yes

# Add commonly used components
npx shadcn@latest add button input card badge select table
```

**4. Create database**
```sql
-- Run in MySQL Workbench
CREATE DATABASE threadshare
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE threadshare;
```

**5. Run schema file**
```bash
# In MySQL Workbench: File → Open SQL Script → database/schema.sql → Execute
# Or via CLI:
mysql -u root threadshare < database/schema.sql
```

**6. Configure environment**
```env
# .env.local
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=threadshare

AUTH_SECRET=replace-with-any-32-char-random-string
AUTH_URL=http://localhost:3000
```

**7. Set up mysql2 client**
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

### Deliverables
- `database/schema.sql` — full DDL with all tables, triggers, view, indexes
- `database/seed.sql` — sample data
- `database/queries.sql` — viva reference queries
- `lib/db/client.ts` — mysql2 v3 pool
- App running on `localhost:3000`

### DB Objects Created

| Object | Type |
|--------|------|
| Users | Table |
| Categories | Table (self-referencing) |
| Inventory_Items | Table (FULLTEXT indexed) |
| Wear_Log | Table |
| Outfits | Table |
| Outfit_Items | Table (M:N junction) |
| Transactions | Table |
| trg_wear_count_increment | Trigger (AFTER INSERT on Wear_Log) |
| trg_update_item_status_on_sale | Trigger (AFTER UPDATE on Transactions) |
| sp_add_wear_entry | Stored Procedure |
| v_cost_per_wear | View |

---

## Phase 2 — Authentication (Auth.js v5)

**Goal:** Users can sign up and sign in using the new Auth.js v5 `auth.ts` pattern.

### Steps

**1. Create `auth.ts` at project root**
```typescript
// auth.ts
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
        return { id: String(user.user_id), email: user.email, name: user.username };
      },
    }),
  ],
  pages: { signIn: "/signin" },
});
```

**2. Create Auth.js route handler**
```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

**3. Add middleware**
```typescript
// middleware.ts (project root)
import { auth } from "@/auth";
export default auth((req) => {
  if (!req.auth) return Response.redirect(new URL("/signin", req.url));
});
export const config = {
  matcher: ["/closet/:path*", "/outfits/:path*", "/analytics", "/transactions"],
};
```

**4. Build sign-up Server Action**
```typescript
// lib/actions/auth.ts
"use server";
import { db } from "@/lib/db/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const email    = formData.get("email")    as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const hash     = await bcrypt.hash(password, 12);

  await db.execute(
    "INSERT INTO Users (email, username, password_hash) VALUES (?, ?, ?)",
    [email, username, hash]
  );
  redirect("/signin");
}
```

### SQL Used
```sql
-- Sign up
INSERT INTO Users (email, username, password_hash) VALUES (?, ?, ?);

-- Sign in lookup
SELECT user_id, email, username, password_hash, role
FROM   Users WHERE email = ?;
```

### Deliverables
- `auth.ts` root config (Auth.js v5 pattern)
- Working sign-up → stores bcrypt hash in `Users`
- Working sign-in → JWT session → redirects to `/closet`
- Protected routes via `middleware.ts`

---

## Phase 3 — Closet (Core Feature)

**Goal:** Full Pinterest-style wardrobe grid with filter bar. Most important phase.

### Steps

**1. Build API route for filtered items**
```typescript
// app/api/items/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const catId  = searchParams.get("cat_id");
  const color  = searchParams.get("color");
  const size   = searchParams.get("size");
  const status = searchParams.get("status");
  const userId = (session.user as any).userId;

  const [rows] = await db.execute(
    `SELECT ii.*, c.name AS category_name
     FROM   Inventory_Items ii
     LEFT JOIN Categories c ON c.cat_id = ii.cat_id
     WHERE  ii.user_id = ?
       AND  (? IS NULL OR ii.cat_id = ?)
       AND  (? IS NULL OR ii.color  = ?)
       AND  (? IS NULL OR ii.size   = ?)
       AND  (? IS NULL OR ii.status = ?)
     ORDER  BY ii.created_at DESC`,
    [userId, catId, catId, color, color, size, size, status, status]
  );

  return Response.json(rows);
}
```

**2. Build Server Action for adding items**
```typescript
// lib/actions/items.ts
"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function addItem(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.execute(
    `INSERT INTO Inventory_Items (user_id, name, brand, cat_id, color, size, condition_grade, purchase_price, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      (session.user as any).userId,
      formData.get("name"),
      formData.get("brand") || null,
      formData.get("cat_id") || null,
      formData.get("color") || null,
      formData.get("size") || null,
      formData.get("condition_grade") || "Good",
      formData.get("purchase_price") || null,
      formData.get("description") || null,
    ]
  );
  revalidatePath("/closet");
}

export async function logWear(itemId: number, occasion: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  // Calls stored procedure; trigger auto-increments wear_count
  await db.execute("CALL sp_add_wear_entry(?, CURDATE(), ?)", [itemId, occasion]);
  revalidatePath(`/closet/${itemId}`);
}
```

**3. Build components**
- `ClosetGrid.tsx` — `grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4`
- `ItemCard.tsx` — image, name, brand, wear count `<Badge>`, condition `<Badge>`
- `FilterBar.tsx` — shadcn `<Select>` for each filter; updates URL search params
- `AddItemForm.tsx` — shadcn `<Input>`, `<Select>`, `<Button>` with `action={addItem}`

### SQL Used
```sql
-- Filtered closet
SELECT ii.*, c.name AS category_name
FROM   Inventory_Items ii
LEFT JOIN Categories c ON c.cat_id = ii.cat_id
WHERE  ii.user_id = ? AND (...filters...)
ORDER  BY ii.created_at DESC;

-- FULLTEXT search
SELECT *, MATCH(name, brand, description) AGAINST(? IN BOOLEAN MODE) AS rel
FROM   Inventory_Items
WHERE  user_id = ?
  AND  MATCH(name, brand, description) AGAINST(? IN BOOLEAN MODE)
ORDER  BY rel DESC;

-- Wear log for item detail
SELECT worn_on, occasion
FROM   Wear_Log WHERE item_id = ? ORDER BY worn_on DESC;

-- Log wear (via stored procedure)
CALL sp_add_wear_entry(?, CURDATE(), ?);
```

### Deliverables
- `/closet` — responsive grid with filter bar ✓
- `/closet/add` — add item form → Server Action ✓
- `/closet/[itemId]` — item detail + wear log table + "Log Wear" button ✓
- Edit / Delete item ✓

---

## Phase 4 — Outfits

**Goal:** Save named outfit "looks" by picking items from the closet.

### Steps

1. `GET /api/outfits` — list user's outfits with item thumbnails
2. `POST /api/outfits` — create outfit (accepts `{ name, occasion_tag, item_ids[] }`)
3. `DELETE /api/outfits/[id]` — delete outfit
4. Build `OutfitCard.tsx` — name, occasion badge, row of item thumbnails
5. Build `OutfitBuilder.tsx` — checkbox list of closet items → name field → save

### SQL Used
```sql
-- Create outfit (atomic)
START TRANSACTION;
  INSERT INTO Outfits (user_id, name, occasion_tag) VALUES (?, ?, ?);
  SET @oid = LAST_INSERT_ID();
  INSERT INTO Outfit_Items (outfit_id, item_id, position)
    VALUES (@oid, ?, 1), (@oid, ?, 2);   -- repeated per selected item
COMMIT;

-- Fetch outfit items (M:N join)
SELECT ii.item_id, ii.name, ii.image_url, oi.position
FROM   Outfit_Items oi
JOIN   Inventory_Items ii ON ii.item_id = oi.item_id
WHERE  oi.outfit_id = ?
ORDER  BY oi.position;
```

### Deliverables
- `/outfits` — gallery of saved looks ✓
- `/outfits/create` — multi-select items + name → save ✓
- Delete outfit ✓

---

## Phase 5 — Analytics

**Goal:** Data dashboard using the `v_cost_per_wear` view + aggregate queries.

### Steps

1. Build `GET /api/analytics` — returns CPW list, most-worn, never-worn
2. Build `CostPerWearTable.tsx` — sortable HTML table from view data
3. Render three sections on `/analytics` page

### SQL Used
```sql
-- Cost-per-wear from view
SELECT name, brand, purchase_price, wear_count, cost_per_wear
FROM   v_cost_per_wear
WHERE  user_id = ?
ORDER  BY cost_per_wear ASC;

-- Most worn (aggregate + ORDER BY)
SELECT name, brand, wear_count
FROM   Inventory_Items
WHERE  user_id = ?
ORDER  BY wear_count DESC
LIMIT  5;

-- Never worn (subquery)
SELECT item_id, name, brand, created_at
FROM   Inventory_Items
WHERE  user_id = ?
  AND  item_id NOT IN (SELECT DISTINCT item_id FROM Wear_Log)
ORDER  BY created_at DESC;
```

### Deliverables
- `/analytics` — three data sections: CPW table, most-worn, never-worn ✓
- Optional: `recharts` bar chart for most-worn ✓

---

## Phase 6 — Transactions

**Goal:** Simple record of item sales and borrows between users.

### Steps

1. `GET /api/transactions` — history for logged-in user (buyer OR seller), multi-table JOIN
2. `POST /api/transactions` — atomic insert + item status update (Server Action)
3. Status update button: Pending → Completed / Cancelled (PATCH)
4. Build `/transactions` page with history table + create form

### SQL Used
```sql
-- Transaction history (3-table JOIN)
SELECT t.txn_id, t.txn_type, t.status, t.amount, t.txn_date,
       ii.name AS item_name,
       s.username AS seller,
       b.username AS buyer
FROM   Transactions t
JOIN   Inventory_Items ii ON ii.item_id   = t.item_id
JOIN   Users           s  ON s.user_id    = t.seller_id
JOIN   Users           b  ON b.user_id    = t.buyer_id
WHERE  t.seller_id = ? OR t.buyer_id = ?
ORDER  BY t.created_at DESC;

-- Record sale (atomic)
START TRANSACTION;
  INSERT INTO Transactions (item_id, seller_id, buyer_id, txn_type, amount, txn_date)
  VALUES (?, ?, ?, 'Sale', ?, CURDATE());
  UPDATE Inventory_Items SET status = 'Listed' WHERE item_id = ?;
COMMIT;
-- trg_update_item_status_on_sale fires when status → 'Completed'
```

### Deliverables
- `/transactions` — history table + create form ✓
- Status update (Pending → Completed fires the trigger) ✓

---

## Phase 7 — Polish & Seed Data

**Goal:** Submission-ready project with good sample data, clean UI, and viva-ready SQL.

### Steps

**1. Expand `database/seed.sql`**
```sql
-- 5 users, 30+ items across all categories
-- 10+ wear_log entries
-- 5+ outfits
-- 5+ transactions (mix of Sale and Borrow, various statuses)
```

**2. UI polish**
- Add `<EmptyState>` components where lists are empty
- Add `sonner` toasts for add/delete/error feedback
- Dark mode toggle using `next-themes` + Tailwind v4 `.dark` class

**3. Add `database/queries.sql` for viva**

Include all key queries with comments explaining which syllabus topic each demonstrates:
```sql
-- [TOPIC: FULLTEXT Search]
-- [TOPIC: Subquery]
-- [TOPIC: Aggregate + GROUP BY]
-- [TOPIC: View]
-- [TOPIC: Trigger demonstration]
-- [TOPIC: Stored Procedure call]
-- [TOPIC: Transaction + ROLLBACK]
```

**4. Write `README.md`** with setup steps, screenshots, and a note on which DB concepts are covered.

### Viva Preparation Checklist

| Question | Answer Location |
|----------|----------------|
| Explain your ER diagram | `DB_SCHEMA.md` entity overview |
| Why did you use InnoDB? | FK constraints + transactions require InnoDB |
| Show 3NF normalization | `DB_SCHEMA.md` normalization notes |
| Trigger demonstration | Log a wear → watch `wear_count` update in Workbench |
| Stored procedure | `CALL sp_add_wear_entry(...)` in Workbench |
| View query | `SELECT * FROM v_cost_per_wear WHERE user_id = 1` |
| ACID transaction | Walk through atomic outfit creation SQL |
| FULLTEXT search | Show MATCH...AGAINST query in Workbench |
| Subquery | "Items never worn" query |
| Self-referencing FK | `Categories.parent_id` |

---

## Risk & Scope Table

| Risk | Mitigation |
|------|-----------|
| Next.js 16 async params (breaking change) | Use `const { itemId } = await props.params` — async access required in v16 |
| Auth.js v5 still beta | Very stable for credentials-only use; don't use bleeding-edge OAuth features |
| Tailwind v4 no `tailwind.config.js` | All config in `globals.css` — follow ARCHITECTURE.md setup exactly |
| shadcn/ui component mismatch | Use `npx shadcn@latest add` — always pulls Tailwind v4 compatible version |
| Image uploads | Use `<input type="file">` → save to `/public/uploads` folder; store relative URL in DB |
| Complex drag-and-drop | Skip — use checkbox multi-select for outfit builder |

---

## Project Summary

| Metric | Value |
|--------|-------|
| Next.js | 16.2 |
| React | 19.2.5 |
| Tailwind | v4 (CSS-first) |
| shadcn/ui | new-york style, OKLCH |
| Auth | Auth.js v5 |
| DB Driver | mysql2 3.21.1 |
| DB Tables | 7 |
| Triggers | 2 |
| Stored Procedures | 1 |
| Views | 1 |
| Pages | ~8 |
| Server Actions | ~6 |
| API Routes | ~7 |
| External Services | 0 (none required) |
| Estimated Build Time | 2–3 weeks solo |

---

## Syllabus Checklist

- [x] ER Model — 6 entities, all relationships documented
- [x] Relational Model — PKs, FKs, UNIQUE, CHECK constraints on all tables
- [x] SQL DDL — `CREATE TABLE`, `CREATE TRIGGER`, `CREATE PROCEDURE`, `CREATE VIEW`
- [x] SQL DML — `SELECT`, `INSERT`, `UPDATE`, `DELETE` in every Server Action
- [x] JOINs — INNER JOIN (3-table transaction query), LEFT JOIN (closet + category)
- [x] Aggregate Functions — `COUNT`, `ROUND`, `NULLIF`, `COALESCE`
- [x] Subqueries — "items never worn" analytics query
- [x] GROUP BY — aggregation queries
- [x] FULLTEXT Index — item search by name/brand/description
- [x] Views — `v_cost_per_wear` on analytics page
- [x] Triggers — `trg_wear_count_increment`, `trg_update_item_status_on_sale`
- [x] Stored Procedures — `sp_add_wear_entry`
- [x] Normalization 1NF → 3NF — documented per table
- [x] Transactions (ACID) — outfit creation + sale recording flows
- [x] Indexes — FK columns, FULLTEXT, status, color
- [x] Self-referencing FK — `Categories.parent_id`
- [x] M:N Relationship — `Outfit_Items` junction table
- [x] ENUMs & CHECK Constraints — multiple per table
