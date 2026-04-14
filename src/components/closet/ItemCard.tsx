import Link from "next/link";
import { Shirt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InventoryItem } from "@/types";

const conditionColor: Record<string, string> = {
  New: "bg-green-100 text-green-800",
  "Like New": "bg-blue-100 text-blue-800",
  Good: "bg-yellow-100 text-yellow-800",
  Fair: "bg-orange-100 text-orange-800",
  Poor: "bg-red-100 text-red-800",
};

export default function ItemCard({ item }: { item: InventoryItem }) {
  return (
    <Link href={`/closet/${item.item_id}`} className="group block">
      <div className="rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Shirt className="w-12 h-12 opacity-30" />
            </div>
          )}
          {item.status !== "Available" && (
            <span className="absolute top-2 right-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded-full">
              {item.status}
            </span>
          )}
        </div>
        <div className="p-3 space-y-1">
          <p className="font-medium text-sm truncate">{item.name}</p>
          {item.brand && (
            <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {item.color && (
              <span className="text-xs text-muted-foreground">{item.color}</span>
            )}
            {item.size && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {item.size}
              </Badge>
            )}
            <Badge className={`text-xs px-1.5 py-0 ${conditionColor[item.condition_grade] ?? ""}`}>
              {item.condition_grade}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground pt-0.5">
            Worn {item.wear_count}×
          </p>
        </div>
      </div>
    </Link>
  );
}
