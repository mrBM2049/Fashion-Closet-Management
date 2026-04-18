"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Shirt, Layers, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const previewItems = outfit.items?.slice(0, 4) ?? [];

  return (
    <div className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
      {/* Thumbnail strip */}
      <div className="h-32 flex overflow-hidden bg-foreground/4">
        {previewItems.length > 0 ? (
          previewItems.map((item) => (
            <div key={item.item_id} className="flex-1 overflow-hidden">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground/15">
                  <Shirt className="w-6 h-6" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-full flex items-center justify-center text-foreground/15">
            <Layers className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground/90 truncate">{outfit.name}</p>
            <p className="text-[11px] text-foreground/35 mt-0.5">{outfit.item_count} items</p>
          </div>
          {outfit.occasion_tag && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 shrink-0 border-border/50 text-foreground/50">
              {outfit.occasion_tag}
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/25
                     hover:text-red-400 transition-colors duration-150 w-full justify-center
                     py-1 rounded-lg hover:bg-red-500/8"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
  );
}
