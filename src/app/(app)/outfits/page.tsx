import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import OutfitCard from "@/components/outfits/OutfitCard";
import { Outfit } from "@/types";

interface OutfitWithItems extends Outfit {
  item_count: number;
  items: { item_id: number; name: string; image_url: string | null }[];
}

async function getOutfits(userId: string): Promise<OutfitWithItems[]> {
  const [outfits] = await db.execute(
    `SELECT o.outfit_id, o.user_id, o.name, o.occasion_tag, o.description, o.created_at,
            COUNT(oi.item_id) AS item_count
     FROM   Outfits o
     LEFT JOIN Outfit_Items oi ON oi.outfit_id = o.outfit_id
     WHERE  o.user_id = ?
     GROUP  BY o.outfit_id
     ORDER  BY o.created_at DESC`,
    [userId]
  ) as [any[], any];

  if ((outfits as any[]).length === 0) return [];

  // Fetch items for each outfit
  const outfitIds = (outfits as any[]).map((o) => o.outfit_id);
  const placeholders = outfitIds.map(() => "?").join(",");
  const [itemRows] = await db.execute(
    `SELECT oi.outfit_id, ii.item_id, ii.name, ii.image_url, oi.position
     FROM   Outfit_Items oi
     JOIN   Inventory_Items ii ON ii.item_id = oi.item_id
     WHERE  oi.outfit_id IN (${placeholders})
     ORDER  BY oi.outfit_id, oi.position`,
    outfitIds
  ) as [any[], any];

  const itemsByOutfit = new Map<number, any[]>();
  for (const row of itemRows as any[]) {
    if (!itemsByOutfit.has(row.outfit_id)) itemsByOutfit.set(row.outfit_id, []);
    itemsByOutfit.get(row.outfit_id)!.push(row);
  }

  return (outfits as any[]).map((o) => ({
    ...o,
    items: itemsByOutfit.get(o.outfit_id) ?? [],
  }));
}

export default async function OutfitsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.userId as string;
  const outfits = await getOutfits(userId);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-end justify-between pt-1">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/30 mb-1.5">SAVED LOOKS</p>
          <h1 className="text-3xl font-bold tracking-tight">Outfits</h1>
          <p className="text-sm text-foreground/40 mt-1">{outfits.length} saved looks</p>
        </div>
        <Link href="/outfits/create" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          <Plus className="w-4 h-4" />Create Outfit
        </Link>
      </div>

      {outfits.length === 0 ? (
        <div className="glass rounded-3xl flex flex-col items-center justify-center py-28 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl glass-well flex items-center justify-center">
            <Layers className="w-8 h-8 text-foreground/25" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground/60">No outfits yet</p>
            <p className="text-sm text-foreground/30 mt-1">Create your first look from your closet items.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.outfit_id} outfit={outfit} />
          ))}
        </div>
      )}
    </div>
  );
}
