"use client";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface CpwRow {
  item_id: number;
  name: string;
  brand: string | null;
  purchase_price: number;
  wear_count: number;
  cost_per_wear: number | null;
}

type SortKey = "name" | "purchase_price" | "wear_count" | "cost_per_wear";

export default function CostPerWearTable({ rows }: { rows: CpwRow[] }) {
  const [sortKey, setSortKey]   = useState<SortKey>("cost_per_wear");
  const [sortAsc, setSortAsc]   = useState(true);

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey] ?? Infinity;
    const bv = b[sortKey] ?? Infinity;
    if (typeof av === "string" && typeof bv === "string")
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="text-left px-4 py-2.5 font-medium cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => toggle(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k
          ? sortAsc
            ? <ArrowUp className="w-3.5 h-3.5" />
            : <ArrowDown className="w-3.5 h-3.5" />
          : <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />}
      </span>
    </th>
  );

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No items with a purchase price yet. Add prices to your closet items to see cost-per-wear.
      </p>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <Th label="Item"           k="name" />
            <Th label="Purchase Price" k="purchase_price" />
            <Th label="Times Worn"     k="wear_count" />
            <Th label="Cost / Wear"    k="cost_per_wear" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.item_id} className="border-t hover:bg-muted/30 transition-colors">
              <td className="px-4 py-2.5">
                <p className="font-medium">{row.name}</p>
                {row.brand && <p className="text-xs text-muted-foreground">{row.brand}</p>}
              </td>
              <td className="px-4 py-2.5">₹{Number(row.purchase_price).toFixed(2)}</td>
              <td className="px-4 py-2.5">{row.wear_count}</td>
              <td className="px-4 py-2.5 font-medium">
                {row.cost_per_wear != null
                  ? `₹${Number(row.cost_per_wear).toFixed(2)}`
                  : <span className="text-muted-foreground text-xs">Not worn yet</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
