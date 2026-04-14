"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Shirt, Layers, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteOutfit } from "@/lib/actions/outfits";
import { Outfit } from "@/types";

interface OutfitWithItems extends Outfit {
  item_count: number;
  items?: { item_id: number; name: string; image_url: string | null }[];
}

export default function OutfitCard({ outfit }: { outfit: OutfitWithItems }) {
  const [, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteOutfit(outfit.outfit_id);
        toast.success("Outfit deleted.");
      } catch {
        toast.error("Failed to delete outfit.");
      }
    });
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow">
      {/* Item thumbnails row */}
      <div className="flex h-28 bg-muted overflow-hidden">
        {outfit.items && outfit.items.length > 0 ? (
          outfit.items.slice(0, 4).map((item) => (
            <div key={item.item_id} className="flex-1 overflow-hidden">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Shirt className="w-8 h-8 opacity-30" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-full flex items-center justify-center text-muted-foreground">
            <Layers className="w-10 h-10 opacity-30" />
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{outfit.name}</p>
            <p className="text-xs text-muted-foreground">{outfit.item_count} items</p>
          </div>
          {outfit.occasion_tag && (
            <Badge variant="outline" className="text-xs shrink-0">{outfit.occasion_tag}</Badge>
          )}
        </div>

        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive w-full text-xs" type="button" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
      </div>
    </div>
  );
}
