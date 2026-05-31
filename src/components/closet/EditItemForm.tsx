"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/closet/ImageUploader";
import GlassSelect from "@/components/ui/glass-select";
import { ArrowRight } from "lucide-react";
import { InventoryItem, Category } from "@/types";

const CONDITIONS = ["New","Like New","Good","Fair","Poor"].map((c) => ({ value: c, label: c }));
const SIZES      = ["XS","S","M","L","XL","XXL","28","30","32","34","36"].map((s) => ({ value: s, label: s }));
const COLORS     = ["Black","White","Grey","Navy","Blue","Red","Green","Brown","Beige","Pink","Yellow"].map((c) => ({ value: c, label: c }));

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-foreground/35 mb-1.5">
      {children}
    </p>
  );
}

export default function EditItemForm({
  item,
  categories,
  updateAction,
}: {
  item: InventoryItem;
  categories: Category[];
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState(item.image_url ?? "");
  const catOptions = categories.map((c) => ({ value: String(c.cat_id), label: c.name }));

  return (
    <div className="glass rounded-3xl overflow-hidden max-w-4xl mx-auto">
      <div className="grid md:grid-cols-[2fr_3fr]">

        {/* LEFT — image */}
        <div className="relative bg-foreground/4 flex flex-col items-center justify-center p-8 gap-4 min-h-[360px]">
          <div className="w-full max-w-[280px]">
            <ImageUploader currentUrl={item.image_url} onUpload={(url) => setImageUrl(url)} />
          </div>
        </div>

        {/* RIGHT — fields */}
        <form action={updateAction} className="flex flex-col p-7 gap-5 bg-card">
          <input type="hidden" name="image_url" value={imageUrl} />

          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/35 mb-1">EDIT ITEM</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{item.name}</h2>
          </div>

          <div>
            <FieldLabel>Item Name *</FieldLabel>
            <Input name="name" defaultValue={item.name} required
              className="bg-foreground/6 border-border text-foreground h-10 rounded-xl" />
          </div>

          <div>
            <FieldLabel>Brand</FieldLabel>
            <Input name="brand" defaultValue={item.brand ?? ""}
              className="bg-foreground/6 border-border text-foreground placeholder:text-foreground/30 h-10 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Category</FieldLabel>
              <GlassSelect name="cat_id" defaultValue={item.cat_id ? String(item.cat_id) : ""} placeholder="Select" options={catOptions} />
            </div>
            <div>
              <FieldLabel>Condition</FieldLabel>
              <GlassSelect name="condition_grade" defaultValue={item.condition_grade} options={CONDITIONS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Color</FieldLabel>
              <GlassSelect name="color" defaultValue={item.color ?? ""} placeholder="Select" options={COLORS} />
            </div>
            <div>
              <FieldLabel>Size</FieldLabel>
              <GlassSelect name="size" defaultValue={item.size ?? ""} placeholder="Select" options={SIZES} />
            </div>
          </div>

          <div>
            <FieldLabel>Purchase Price (₹)</FieldLabel>
            <Input name="purchase_price" type="number" min="0" step="0.01"
              defaultValue={item.purchase_price ?? ""}
              className="bg-foreground/6 border-border text-foreground placeholder:text-foreground/30 h-10 rounded-xl" />
          </div>

          <div>
            <FieldLabel>Notes</FieldLabel>
            <textarea name="description" rows={2} defaultValue={item.description ?? ""}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm resize-none
                         bg-foreground/6 border border-border text-foreground placeholder:text-foreground/30
                         focus:outline-none focus:ring-1 focus:ring-ring focus:bg-foreground/8 transition-all" />
          </div>

          <button type="submit"
            className="btn-primary w-full h-12 flex items-center justify-center gap-2 text-sm mt-auto">
            <span>Save Changes</span><ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
