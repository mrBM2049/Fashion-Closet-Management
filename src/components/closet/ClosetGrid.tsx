import { Shirt, Plus } from "lucide-react";
import Link from "next/link";
import ItemCard from "./ItemCard";
import { InventoryItem } from "@/types";

export default function ClosetGrid({ items }: { items: InventoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="glass rounded-3xl flex flex-col items-center justify-center py-28 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl glass-well flex items-center justify-center">
          <Shirt className="w-8 h-8 text-foreground/25" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground/60">Your closet is empty</p>
          <p className="text-sm text-foreground/30 mt-1">Add your first item to get started</p>
        </div>
        <Link
          href="/closet/add"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm mt-1"
        >
          <Plus className="w-4 h-4" /> Add Item
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <ItemCard key={item.item_id} item={item} />
      ))}
    </div>
  );
}
