"use client";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { addItem } from "@/lib/actions/items";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/closet/ImageUploader";
import GlassSelect from "@/components/ui/glass-select";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types";

const CONDITIONS = ["New","Like New","Good","Fair","Poor"].map((c) => ({ value: c, label: c }));
const SIZES      = ["XS","S","M","L","XL","XXL","28","30","32","34","36"].map((s) => ({ value: s, label: s }));
const COLORS     = ["Black","White","Grey","Navy","Blue","Red","Green","Brown","Beige","Pink","Yellow"].map((c) => ({ value: c, label: c }));

type State = { error?: string } | null;

async function addItemAction(_prev: State, formData: FormData): Promise<State> {
  try {
    await addItem(formData);
    return null;
  } catch (e: any) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { error: e.message ?? "Failed to add item" };
  }
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-foreground/35 mb-1.5">{children}</p>;
}

export default function AddItemForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(addItemAction, null);
  const [imageUrl, setImageUrl] = useState("");
  const catOptions = categories.map((c) => ({ value: String(c.cat_id), label: c.name }));

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="glass rounded-3xl overflow-hidden max-w-4xl mx-auto">
      <form action={formAction}>
        {/* Hidden image_url inside the form */}
        <input type="hidden" name="image_url" value={imageUrl} />

        <div className="grid md:grid-cols-[2fr_3fr]">

          {/* LEFT — image upload */}
          <div className="bg-foreground/4 flex flex-col items-center justify-center p-6 gap-3 min-h-[200px] md:min-h-[360px]">
            <div className="w-full max-w-[180px] md:max-w-[200px]">
              <ImageUploader onUpload={(url) => setImageUrl(url)} />
            </div>
            <p className="text-xs text-foreground/25 text-center">JPEG, PNG, WebP · max 5 MB</p>
          </div>

          {/* RIGHT — fields */}
          <div className="flex flex-col p-5 md:p-7 gap-4 md:gap-5 bg-card">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/35 mb-1">NEW ITEM</p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Add to Closet</h2>
            </div>

            {state?.error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
                {state.error}
              </div>
            )}

            <div>
              <FieldLabel>Item Name *</FieldLabel>
              <Input name="name" placeholder="e.g. Vintage Levi's Jacket" required
                className="bg-foreground/6 border-border text-foreground placeholder:text-foreground/30 h-10 rounded-xl" />
            </div>

            <div>
              <FieldLabel>Brand</FieldLabel>
              <Input name="brand" placeholder="e.g. Levi's, Zara, Nike"
                className="bg-foreground/6 border-border text-foreground placeholder:text-foreground/30 h-10 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Category</FieldLabel>
                <GlassSelect name="cat_id" placeholder="Select" options={catOptions} />
              </div>
              <div>
                <FieldLabel>Condition</FieldLabel>
                <GlassSelect name="condition_grade" defaultValue="Good" options={CONDITIONS} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Color</FieldLabel>
                <GlassSelect name="color" placeholder="Select" options={COLORS} />
              </div>
              <div>
                <FieldLabel>Size</FieldLabel>
                <GlassSelect name="size" placeholder="Select" options={SIZES} />
              </div>
            </div>

            <div>
              <FieldLabel>Purchase Price (₹)</FieldLabel>
              <Input name="purchase_price" type="number" min="0" step="0.01" placeholder="0.00"
                className="bg-foreground/6 border-border text-foreground placeholder:text-foreground/30 h-10 rounded-xl" />
            </div>

            <div>
              <FieldLabel>Notes</FieldLabel>
              <textarea name="description" rows={2} placeholder="Optional notes about this item..."
                className="w-full rounded-xl px-3.5 py-2.5 text-sm resize-none
                           bg-foreground/6 border border-border text-foreground placeholder:text-foreground/30
                           focus:outline-none focus:ring-1 focus:ring-ring focus:bg-foreground/8 transition-all" />
            </div>

            <button type="submit" disabled={pending}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 text-sm mt-auto">
              {pending ? "Adding..." : <><span>Add to Closet</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
