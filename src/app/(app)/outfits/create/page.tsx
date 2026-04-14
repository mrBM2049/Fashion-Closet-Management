import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import OutfitBuilder from "@/components/outfits/OutfitBuilder";
import { InventoryItem } from "@/types";

async function getItems(userId: string) {
  const [rows] = await db.execute(
    `SELECT ii.*, c.name AS category_name
     FROM   Inventory_Items ii
     LEFT JOIN Categories c ON c.cat_id = ii.cat_id
     WHERE  ii.user_id = ? AND ii.status = 'Available'
     ORDER  BY ii.name`,
    [userId]
  );
  return rows as InventoryItem[];
}

export default async function CreateOutfitPage() {
  const session = await auth();
  const userId = (session?.user as any)?.userId as string;
  const items = await getItems(userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/outfits">
          <Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
        </Link>
        <h1 className="text-2xl font-semibold">Create Outfit</h1>
      </div>

      <OutfitBuilder items={items} />
    </div>
  );
}
