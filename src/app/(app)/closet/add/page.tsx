import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { db } from "@/lib/db/client";
import { Button } from "@/components/ui/button";
import AddItemForm from "@/components/closet/AddItemForm";
import { Category } from "@/types";

async function getCategories() {
  const [rows] = await db.execute(
    `SELECT cat_id, name, slug, parent_id FROM Categories ORDER BY parent_id IS NOT NULL, name`
  );
  return rows as Category[];
}

export default async function AddItemPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/closet">
          <Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
        </Link>
        <h1 className="text-2xl font-semibold"><Plus className="w-5 h-5 inline mr-1" />Add Item</h1>
      </div>

      <AddItemForm categories={categories} />
    </div>
  );
}
