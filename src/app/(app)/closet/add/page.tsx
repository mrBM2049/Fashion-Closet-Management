import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db/client";
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
    <div className="space-y-4 pb-10">
      {/* Back button */}
      <Link
        href="/closet"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/45
                   hover:text-foreground transition-colors duration-150"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Closet
      </Link>

      <AddItemForm categories={categories} />
    </div>
  );
}
