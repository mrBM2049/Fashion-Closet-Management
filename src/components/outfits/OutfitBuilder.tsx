"use client";
import { useState, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Shirt, ArrowRight } from "lucide-react";
import { createOutfit } from "@/lib/actions/outfits";
import { Input } from "@/components/ui/input";
import GlassSelect from "@/components/ui/glass-select";
import { InventoryItem } from "@/types";

const OCCASIONS = ["Casual","Formal","Party","College","Work","Sport","Date","Travel"].map(
  (o) => ({ value: o, label: o })
);

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-foreground/35 mb-1.5">
      {children}
    </p>
  );
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
      {/* Name + Occasion row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Outfit Name *</FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Monday Fit"
            required
            className="bg-foreground/6 border-border text-foreground placeholder:text-foreground/30 h-10 rounded-xl"
          />
        </div>
        <div>
          <FieldLabel>Occasion</FieldLabel>
          <GlassSelect
            name="occasion_tag"
            placeholder="Select occasion"
            options={OCCASIONS}
          />
        </div>
      </div>

      {/* Item picker */}
      <div className="space-y-2">
        <FieldLabel>Select Items * ({selected.size} selected)</FieldLabel>
        {items.length === 0 ? (
          <div className="glass rounded-2xl px-6 py-10 text-center text-foreground/35 text-sm">
            No items in your closet yet. Add some items first.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {items.map((item) => {
              const isSelected = selected.has(item.item_id);
              return (
                <label
                  key={item.item_id}
                  className={`cursor-pointer rounded-2xl overflow-hidden transition-all duration-200
                    ${isSelected
                      ? "ring-2 ring-primary border-2 border-primary"
                      : "border-2 border-border hover:border-foreground/20"
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
                  <div className="aspect-square bg-foreground/5 relative overflow-hidden">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/20">
                        <Shirt className="w-8 h-8" />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-2 bg-card">
                    <p className="text-xs font-semibold truncate text-foreground/85">{item.name}</p>
                    {item.brand && (
                      <p className="text-[10px] text-foreground/40 truncate">{item.brand}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {state?.error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={selected.size === 0 || pending}
        className="btn-primary flex items-center gap-2 px-6 h-12 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {pending ? "Saving..." : <><span>Save Outfit</span><ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}
