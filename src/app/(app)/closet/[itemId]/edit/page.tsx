import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateItem } from "@/lib/actions/items";
import { InventoryItem, Category } from "@/types";

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];
const COLORS = ["Black", "White", "Grey", "Navy", "Blue", "Red", "Green", "Brown", "Beige", "Pink", "Yellow"];

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

      <form action={updateAction} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Item Name *</Label>
          <Input id="name" name="name" defaultValue={item.name} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" defaultValue={item.brand ?? ""} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat_id">Category</Label>
            <select
              id="cat_id"
              name="cat_id"
              defaultValue={item.cat_id ?? ""}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.cat_id} value={c.cat_id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="condition_grade">Condition</Label>
            <select
              id="condition_grade"
              name="condition_grade"
              defaultValue={item.condition_grade}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="color">Color</Label>
            <select
              id="color"
              name="color"
              defaultValue={item.color ?? ""}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select color</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="size">Size</Label>
            <select
              id="size"
              name="size"
              defaultValue={item.size ?? ""}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select size</option>
              {SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="purchase_price">Purchase Price (₹)</Label>
          <Input
            id="purchase_price"
            name="purchase_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={item.purchase_price ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={item.description ?? ""}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
    </div>
  );
}
