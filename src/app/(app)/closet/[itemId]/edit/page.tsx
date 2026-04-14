import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateItem } from "@/lib/actions/items";
import EditItemForm from "@/components/closet/EditItemForm";
import { InventoryItem, Category } from "@/types";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as any)?.userId as string;
  const { itemId } = await params;

  const [[itemRows], [catRows]] = await Promise.all([
    db.execute(
      `SELECT * FROM Inventory_Items WHERE item_id = ? AND user_id = ?`,
      [itemId, userId]
    ),
    db.execute(`SELECT cat_id, name, slug, parent_id FROM Categories ORDER BY parent_id IS NOT NULL, name`),
  ]);

  const item = (itemRows as InventoryItem[])[0];
  if (!item) notFound();

  const categories = catRows as Category[];

  const updateAction = async (formData: FormData) => {
    "use server";
    await updateItem(item.item_id, formData);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href={`/closet/${itemId}`}>
          <Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
        </Link>
        <h1 className="text-2xl font-semibold">Edit Item</h1>
      </div>

      <EditItemForm item={item} categories={categories} updateAction={updateAction} />
    </div>
  );
}
