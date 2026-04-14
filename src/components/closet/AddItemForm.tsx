"use client";
import { useActionState } from "react";
import { addItem } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Category } from "@/types";

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];
const COLORS = ["Black", "White", "Grey", "Navy", "Blue", "Red", "Green", "Brown", "Beige", "Pink", "Yellow"];

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

export default function AddItemForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(addItemAction, null);

  return (
    <form action={formAction} className="space-y-5 max-w-lg">
      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Item Name *</Label>
        <Input id="name" name="name" placeholder="e.g. Vintage Levi's Jacket" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="brand">Brand</Label>
        <Input id="brand" name="brand" placeholder="e.g. Levi's" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cat_id">Category</Label>
          <select
            id="cat_id"
            name="cat_id"
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
        <Input id="purchase_price" name="purchase_price" type="number" min="0" step="0.01" placeholder="0.00" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Optional notes about this item..."
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Adding..." : "Add to Closet"}
      </Button>
    </form>
  );
}
