import ItemCard from "./ItemCard";
import { Shirt } from "lucide-react";
import { InventoryItem } from "@/types";

export default function ClosetGrid({ items }: { items: InventoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Shirt className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">Your closet is empty</p>
        <p className="text-sm mt-1">Add your first item to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      {items.map((item) => (
        <ItemCard key={item.item_id} item={item} />
      ))}
    </div>
  );
}
