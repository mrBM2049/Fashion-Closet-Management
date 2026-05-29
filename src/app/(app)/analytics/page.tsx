import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { TrendingUp, TrendingDown, BarChart2, Package, Star, ArrowUpRight } from "lucide-react";
import CostPerWearTable from "@/components/analytics/CostPerWearTable";
import Link from "next/link";

async function getAnalytics(userId: string) {
  const [cpwRows, mostWornRows, neverWornRows, totalRows] = await Promise.all([
    db.execute(
      `SELECT item_id, name, brand, purchase_price, wear_count, cost_per_wear
       FROM v_cost_per_wear WHERE user_id = ? ORDER BY cost_per_wear ASC`,
      [userId]
    ),
    db.execute(
      `SELECT item_id, name, brand, image_url, wear_count,
              ROUND(purchase_price / NULLIF(wear_count, 0), 2) AS cost_per_wear
       FROM Inventory_Items WHERE user_id = ? ORDER BY wear_count DESC LIMIT 5`,
      [userId]
    ),
    db.execute(
      `SELECT item_id, name, brand, created_at FROM Inventory_Items
       WHERE user_id = ? AND item_id NOT IN (SELECT DISTINCT item_id FROM Wear_Log)
       ORDER BY created_at DESC`,
      [userId]
    ),
    db.execute(
      `SELECT COUNT(*) as total_items, SUM(purchase_price) as total_value, SUM(wear_count) as total_wears
       FROM Inventory_Items WHERE user_id = ?`,
      [userId]
    ),
  ]);
  return {
    costPerWear: cpwRows[0]     as any[],
    mostWorn:    mostWornRows[0] as any[],
    neverWorn:   neverWornRows[0] as any[],
    totals:      (totalRows[0] as any[])[0],
  };
}

export default async function AnalyticsPage() {
  const session = await auth();
  const userId  = (session?.user as any)?.userId as string;
  const { costPerWear, mostWorn, neverWorn, totals } = await getAnalytics(userId);

  const wornItems = costPerWear.filter((r: any) => r.cost_per_wear);
  const avgCpw    = wornItems.length
    ? wornItems.reduce((s: number, r: any) => s + Number(r.cost_per_wear), 0) / wornItems.length
    : null;
  const maxWears  = mostWorn.length ? Math.max(...mostWorn.map((r: any) => r.wear_count)) : 1;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          REFRACTIVE CONTROL CENTER
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Atelier Performance</h1>
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart2 className="w-4 h-4" />
            All Time
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <StatCard
          label="TOTAL VALUE"
          value={totals?.total_value ? `₹${Number(totals.total_value).toLocaleString()}` : "₹0"}
          sub={`${totals?.total_items ?? 0} items`}
          trend="+12.5%"
          trendUp
          icon={<Package className="w-8 h-8 text-foreground/15" />}
        />
        <StatCard
          label="TOTAL WEARS"
          value={String(totals?.total_wears ?? 0)}
          sub={`${neverWorn.length} items never worn`}
          trend={`${mostWorn.length} active`}
          trendUp
          icon={<TrendingUp className="w-8 h-8 text-foreground/15" />}
        />
        <StatCard
          label="AVG COST / WEAR"
          value={avgCpw ? `₹${avgCpw.toFixed(0)}` : "—"}
          sub={`${wornItems.length} items tracked`}
          trend="Elite"
          trendUp
          icon={<Star className="w-8 h-8 text-foreground/15" />}
        />
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">

        {/* Bar chart */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">Wear Volume</h2>
            <button className="w-8 h-8 rounded-lg bg-foreground/6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {mostWorn.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No wear data yet
            </div>
          ) : (
            <div className="flex items-end gap-3 h-48 px-2">
              {mostWorn.map((row: any, i: number) => {
                const pct    = maxWears > 0 ? (row.wear_count / maxWears) * 100 : 0;
                const isPeak = i === mostWorn.findIndex((r: any) => r.wear_count === maxWears);
                return (
                  <div key={row.item_id} className="flex-1 flex flex-col items-center gap-2">
                    {isPeak && (
                      <span className="text-[9px] font-bold tracking-wider text-muted-foreground bg-foreground/8 px-2 py-0.5 rounded-full">
                        PEAK
                      </span>
                    )}
                    <div className="w-full flex items-end" style={{ height: "160px" }}>
                      <div
                        className="w-full rounded-t-xl transition-all duration-500"
                        style={{
                          height: `${Math.max(pct, 8)}%`,
                          background: isPeak
                            ? "var(--primary)"
                            : "var(--foreground)",
                          opacity: isPeak ? 0.85 : 0.10,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {row.name.split(" ")[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* High Demand */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground leading-tight">High<br />Demand</h2>
            <Link href="/closet" className="text-[10px] font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              VIEW ALL
            </Link>
          </div>

          <div className="space-y-1">
            {mostWorn.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            ) : (
              mostWorn.map((row: any) => (
                <Link
                  key={row.item_id}
                  href={`/closet/${row.item_id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-foreground/5 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-foreground/8 shrink-0">
                    {row.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground/85 truncate">{row.name}</p>
                    <p className="text-[11px] text-muted-foreground">Worn {row.wear_count}× total</p>
                  </div>
                  <div className="text-right shrink-0">
                    {row.cost_per_wear && (
                      <p className="text-xs font-bold text-foreground/70">₹{Number(row.cost_per_wear).toFixed(0)}</p>
                    )}
                    <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                      ACTIVE
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">

        {/* Never Worn */}
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-bold text-foreground mb-4">Never Worn</h2>
          {neverWorn.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Every item has been worn.</p>
          ) : (
            <div className="space-y-3">
              {neverWorn.slice(0, 4).map((row: any) => (
                <div key={row.item_id} className="flex items-center justify-between">
                  <p className="text-sm text-foreground/75 truncate">{row.name}</p>
                  <span className="text-[10px] font-bold text-amber-500 ml-2 shrink-0">UNWORN</span>
                </div>
              ))}
              {neverWorn.length > 4 && (
                <p className="text-xs text-muted-foreground">+{neverWorn.length - 4} more</p>
              )}
            </div>
          )}
        </div>

        {/* Cost per wear */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Cost per Wear</h2>
            <span className="text-[10px] font-mono text-muted-foreground">v_cost_per_wear</span>
          </div>
          <CostPerWearTable rows={costPerWear} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, trend, trendUp, icon,
}: {
  label: string; value: string; sub?: string; trend?: string; trendUp?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="glass-well rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-4 right-4 opacity-50">{icon}</div>
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground mb-3">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-foreground mb-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mb-2">{sub}</p>}
      {trend && (
        <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full
          ${trendUp ? "bg-emerald-500/12 text-emerald-500" : "bg-red-500/12 text-red-500"}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      )}
      <div className="mt-3 h-0.5 bg-foreground/8 rounded-full overflow-hidden">
        <div className="h-full w-3/4 rounded-full" style={{ background: "var(--gold)" }} />
      </div>
    </div>
  );
}
