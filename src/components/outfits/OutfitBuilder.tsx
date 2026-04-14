"use client";
import { useState, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Shirt } from "lucide-react";
import { createOutfit } from "@/lib/actions/outfits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "@/types";

const OCCASIONS = ["Casual", "Formal", "Party", "College", "Work", "Sport", "Date", "Travel"];

type State = { error?: string } | null;

async function createOutfitAction(_prev: State, formData: FormData): Promise<State> {
  try {
    await createOutfit(formData);
    return null;
  } catch (e: any) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { error: e.message ?? "Failed to save outfit" };
  }
}

export default function OutfitBuilder({ items }: { items: InventoryItem[] }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [state, formAction, pending] = useActionState(createOutfitAction, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Outfit Name *</Label>
          <Input id="name" name="name" placeholder="e.g. Monday Fit" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="occasion_tag">Occasion</Label>
          <select
            id="occasion_tag"
            name="occasion_tag"
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select occasion</option>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Select Items * ({selected.size} selected)</Label>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items in your closet yet.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 max-h-[480px] overflow-y-auto pr-1">
            {items.map((item) => {
              const isSelected = selected.has(item.item_id);
              return (
                <label
                  key={item.item_id}
                  className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                    isSelected ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="item_ids"
                    value={item.item_id}
                    checked={isSelected}
                    onChange={() => toggle(item.item_id)}
                    className="sr-only"
                  />
                  <div className="aspect-square bg-muted">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Shirt className="w-8 h-8 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    {item.brand && (
                      <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <Button type="submit" disabled={selected.size === 0 || pending} className="w-full sm:w-auto">
        {pending ? "Saving..." : "Save Outfit"}
      </Button>
    </form>
  );
}
