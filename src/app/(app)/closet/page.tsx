import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    const [rows] = await db.execute(
      `SELECT ii.*, c.name AS category_name
       FROM   Inventory_Items ii
       LEFT JOIN Categories c ON c.cat_id = ii.cat_id
       WHERE  ii.user_id = ?
         AND  MATCH(ii.name, ii.brand, ii.description) AGAINST(? IN BOOLEAN MODE)
       ORDER  BY ii.created_at DESC`,
      [userId, search]
    );
    return rows as InventoryItem[];
  }

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
  const userId = (session?.user as any)?.userId as string;
  const params = await searchParams;

  const [items, categories] = await Promise.all([
    getItems(userId, params),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Closet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} items</p>
        </div>
        <Link href="/closet/add">
          <Button><Plus className="w-4 h-4 mr-1" />Add Item</Button>
        </Link>
      </div>

      <Suspense>
        <FilterBar categories={categories} />
      </Suspense>

      <ClosetGrid items={items} />
    </div>
  );
}
