import Link from "next/link";
import { Shirt } from "lucide-react";
import { InventoryItem } from "@/types";

const conditionColors: Record<string, { dot: string; label: string }> = {
  New:        { dot: "bg-emerald-400", label: "text-emerald-400" },
  "Like New": { dot: "bg-sky-400",     label: "text-sky-400"     },
  Good:       { dot: "bg-amber-400",   label: "text-amber-400"   },
  Fair:       { dot: "bg-orange-400",  label: "text-orange-400"  },
  Poor:       { dot: "bg-red-400",     label: "text-red-400"     },
};

export default function ItemCard({ item }: { item: InventoryItem }) {
  const cond = conditionColors[item.condition_grade] ?? { dot: "bg-zinc-400", label: "text-zinc-400" };

  return (
    <Link href={`/closet/${item.item_id}`} className="group block">
      <div className="glass rounded-2xl overflow-hidden
                      hover:shadow-2xl hover:-translate-y-1
                      transition-all duration-300 ease-out">

        {/* ── Image ── */}
        <div className="aspect-[3/4] relative overflow-hidden bg-foreground/4">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover
                         group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground/12">
              <Shirt className="w-16 h-16" />
            </div>
          )}

          {/* Gradient scrim for text legibility */}
          <div className="absolute inset-x-0 bottom-0 h-20
                          bg-gradient-to-t from-black/60 to-transparent" />

          {/* Wear count pill — always visible, high contrast */}
          {item.wear_count > 0 && (
            <span className="absolute top-2.5 right-2.5
                             bg-black/70 text-white text-[11px] font-bold
                             px-2.5 py-1 rounded-full backdrop-blur-sm
                             border border-white/10">
              {item.wear_count}×
            </span>
          )}

          {/* Status pill */}
          {item.status !== "Available" && (
            <span className="absolute top-2.5 left-2.5
                             bg-black/70 text-white/80 text-[10px] font-bold
                             px-2 py-0.5 rounded-full uppercase tracking-wider
                             backdrop-blur-sm border border-white/10">
              {item.status}
            </span>
          )}
        </div>

        {/* ── Info panel ── */}
        <div className="px-3.5 py-3 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm leading-snug line-clamp-1 text-foreground/90">
              {item.name}
            </p>
            <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${cond.dot}`} />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-foreground/40 flex-wrap">
            {item.brand && <span>{item.brand}</span>}
            {item.brand && (item.size || item.color) && <span className="opacity-40">·</span>}
            {item.size  && <span className="uppercase font-medium">{item.size}</span>}
            {item.size  && item.color && <span className="opacity-40">·</span>}
            {item.color && <span>{item.color}</span>}
          </div>

          {item.purchase_price != null && (
            <p className="text-xs font-semibold text-foreground/55">
              ₹{Number(item.purchase_price).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
