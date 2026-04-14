"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Category } from "@/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];
const COLORS = ["Black", "White", "Grey", "Navy", "Blue", "Red", "Green", "Brown", "Beige", "Pink", "Yellow"];
const STATUSES = ["Available", "Listed", "Sold"];

export default function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const current = (key: string) => searchParams.get(key) ?? "";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="search"
        placeholder="Search items..."
        defaultValue={current("search")}
        onChange={(e) => setParam("search", e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm bg-background w-48 focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <select
        value={current("cat_id")}
        onChange={(e) => setParam("cat_id", e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.cat_id} value={c.cat_id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={current("color")}
        onChange={(e) => setParam("color", e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All Colors</option>
        {COLORS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={current("size")}
        onChange={(e) => setParam("size", e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All Sizes</option>
        {SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={current("status")}
        onChange={(e) => setParam("status", e.target.value)}
        className="border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">All Status</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {searchParams.toString() && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
