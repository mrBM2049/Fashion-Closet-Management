"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import GlassSelect from "@/components/ui/glass-select";
import { Category } from "@/types";

const SIZES   = ["XS","S","M","L","XL","XXL","28","30","32","34","36"].map((s) => ({ value: s, label: s }));
const COLORS  = ["Black","White","Grey","Navy","Blue","Red","Green","Brown","Beige","Pink","Yellow"].map((c) => ({ value: c, label: c }));
const STATUSES = ["Available","Listed","Sold"].map((s) => ({ value: s, label: s }));

export default function FilterBar({ categories }: { categories: Category[] }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    value ? p.set(key, value) : p.delete(key);
    router.push(`${pathname}?${p.toString()}`);
  }, [router, pathname, searchParams]);

  const current    = (key: string) => searchParams.get(key) ?? "";
  const hasFilters = searchParams.toString().length > 0;

  const catOptions = categories.map((c) => ({ value: String(c.cat_id), label: c.name }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[160px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30 pointer-events-none" />
        <input
          type="search"
          placeholder="Search items..."
          defaultValue={current("search")}
          onChange={(e) => setParam("search", e.target.value)}
          className="w-full h-10 pl-9 pr-3 rounded-xl text-sm
                     bg-foreground/6 border border-border text-foreground
                     placeholder:text-foreground/30
                     focus:outline-none focus:ring-1 focus:ring-ring focus:bg-foreground/8
                     transition-all"
        />
      </div>

      <GlassSelect
        name="cat_id_filter"
        value={current("cat_id")}
        placeholder="Category"
        options={catOptions}
        onChange={(v) => setParam("cat_id", v)}
        className="w-36"
      />

      <GlassSelect
        name="color_filter"
        value={current("color")}
        placeholder="Color"
        options={COLORS}
        onChange={(v) => setParam("color", v)}
        className="w-32"
      />

      <GlassSelect
        name="size_filter"
        value={current("size")}
        placeholder="Size"
        options={SIZES}
        onChange={(v) => setParam("size", v)}
        className="w-28"
      />

      <GlassSelect
        name="status_filter"
        value={current("status")}
        placeholder="Status"
        options={STATUSES}
        onChange={(v) => setParam("status", v)}
        className="w-32"
      />

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="flex items-center gap-1 h-10 px-3 rounded-xl text-xs font-medium
                     text-foreground/45 hover:text-foreground border border-border/60
                     hover:bg-foreground/5 transition-all"
        >
          <X className="w-3 h-3" /> Clear
        </button>
      )}
    </div>
  );
}
