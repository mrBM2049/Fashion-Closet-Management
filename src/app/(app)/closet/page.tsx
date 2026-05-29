import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { Plus } from "lucide-react";
import ClosetGrid from "@/components/closet/ClosetGrid";
import FilterBar from "@/components/closet/FilterBar";
import { InventoryItem, Category } from "@/types";

async function getItems(userId: string, params: Record<string, string>) {
  const catId  = params.cat_id  || null;
  const color  = params.color   || null;
  const size   = params.size    || null;
  const status = params.status  || null;
  const search = params.search  || null;

  if (search) {
    // Postgres-compatible full-text search using search_vector column
    const [rows] = await db.execute(
      `SELECT ii.*, c.name AS category_name FROM Inventory_Items ii
       LEFT JOIN Categories c ON c.cat_id = ii.cat_id
       WHERE ii.user_id = ? 
         AND ii.search_vector @@ websearch_to_tsquery('english', ?)
       ORDER BY ii.created_at DESC`,
      [userId, search]
    );
    return rows as InventoryItem[];
  }

  // Postgres needs explicit types for parameters in IS NULL checks, 
  // or we can build the query dynamically. Using COALESCE(?::text, col::text) = col::text 
  // is a trick, but dynamic building is cleaner.
  let sql = `
    SELECT ii.*, c.name AS category_name 
    FROM Inventory_Items ii
    LEFT JOIN Categories c ON c.cat_id = ii.cat_id
    WHERE ii.user_id = ?
  `;
  const values: any[] = [userId];

  if (catId) {
    sql += ` AND ii.cat_id = ?`;
    values.push(catId);
  }
  if (color) {
    sql += ` AND ii.color = ?`;
    values.push(color);
  }
  if (size) {
    sql += ` AND ii.size = ?`;
    values.push(size);
  }
  if (status) {
    sql += ` AND ii.status = ?`;
    values.push(status);
  }

  sql += ` ORDER BY ii.created_at DESC`;

  const [rows] = await db.execute(sql, values);
  return rows as InventoryItem[];
}

async function getCategories() {
  const [rows] = await db.execute(
    `SELECT cat_id, name, slug, parent_id FROM Categories ORDER BY parent_id IS NOT NULL, name`
  );
  return rows as Category[];
}

export default async function ClosetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const userId  = (session?.user as any)?.userId as string;
  const params  = await searchParams;

  const [items, categories] = await Promise.all([
    getItems(userId, params),
    getCategories(),
  ]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/30 mb-1.5">
            MY WARDROBE
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Your Closet</h1>
          <p className="text-sm text-foreground/40 mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Link
          href="/closet/add"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Link>
      </div>

      {/* Filter bar */}
      <div className="glass rounded-2xl px-4 py-3">
        <Suspense fallback={null}>
          <FilterBar categories={categories} />
        </Suspense>
      </div>

      {/* Grid */}
      <ClosetGrid items={items} />
    </div>
  );
}
