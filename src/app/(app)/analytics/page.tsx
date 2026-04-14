import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { BarChart2, TrendingUp, PackageX } from "lucide-react";
import CostPerWearTable from "@/components/analytics/CostPerWearTable";

async function getAnalytics(userId: string) {
  const [cpwRows, mostWornRows, neverWornRows] = await Promise.all([
    db.execute(
      `SELECT item_id, name, brand, purchase_price, wear_count, cost_per_wear
       FROM   v_cost_per_wear
       WHERE  user_id = ?
       ORDER  BY cost_per_wear ASC`,
      [userId]
    ),
    db.execute(
      `SELECT item_id, name, brand, wear_count,
              ROUND(purchase_price / NULLIF(wear_count, 0), 2) AS cost_per_wear
       FROM   Inventory_Items
       WHERE  user_id = ?
       ORDER  BY wear_count DESC
       LIMIT  5`,
      [userId]
    ),
    db.execute(
      `SELECT item_id, name, brand, created_at
       FROM   Inventory_Items
       WHERE  user_id = ?
         AND  item_id NOT IN (SELECT DISTINCT item_id FROM Wear_Log)
       ORDER  BY created_at DESC`,
      [userId]
    ),
  ]);

  return {
    costPerWear: cpwRows[0]    as any[],
    mostWorn:    mostWornRows[0] as any[],
    neverWorn:   neverWornRows[0] as any[],
  };
}

export default async function AnalyticsPage() {
  const session = await auth();
  const userId  = (session?.user as any)?.userId as string;

  const { costPerWear, mostWorn, neverWorn } = await getAnalytics(userId);

  // Summary stats
  const totalItems  = costPerWear.length;
  const totalWears  = costPerWear.reduce((s: number, r: any) => s + Number(r.wear_count), 0);
  const avgCpw      = costPerWear.length
    ? costPerWear.reduce((s: number, r: any) => s + (r.cost_per_wear ? Number(r.cost_per_wear) : 0), 0) / costPerWear.filter((r: any) => r.cost_per_wear).length
    : null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart2 className="w-6 h-6" /> Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Insights from your wardrobe data
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Items tracked" value={String(totalItems)} />
        <StatCard label="Total wears logged" value={String(totalWears)} />
        <StatCard
          label="Avg cost / wear"
          value={avgCpw != null && !isNaN(avgCpw) ? `₹${avgCpw.toFixed(2)}` : "—"}
        />
      </div>

      {/* Section 1 — Cost per wear (view) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-muted-foreground" />
          Cost per Wear
          <span className="text-xs font-normal text-muted-foreground ml-1">
            — from <code className="bg-muted px-1 rounded">v_cost_per_wear</code> view
          </span>
        </h2>
        <CostPerWearTable rows={costPerWear} />
      </section>

      {/* Section 2 — Most worn */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          Most Worn
          <span className="text-xs font-normal text-muted-foreground ml-1">
            — top 5 by wear count
          </span>
        </h2>
        {mostWorn.length === 0 ? (
          <p className="text-sm text-muted-foreground">No wear entries logged yet.</p>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Item</th>
                  <th className="text-left px-4 py-2.5 font-medium">Times Worn</th>
                  <th className="text-left px-4 py-2.5 font-medium">Cost / Wear</th>
                </tr>
              </thead>
              <tbody>
                {mostWorn.map((row: any, i: number) => (
                  <tr key={row.item_id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-muted-foreground mr-2 text-xs">#{i + 1}</span>
                      <span className="font-medium">{row.name}</span>
                      {row.brand && (
                        <span className="text-xs text-muted-foreground ml-1">{row.brand}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-medium">{row.wear_count}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {row.cost_per_wear != null ? `₹${Number(row.cost_per_wear).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 3 — Never worn (subquery) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PackageX className="w-5 h-5 text-muted-foreground" />
          Never Worn
          <span className="text-xs font-normal text-muted-foreground ml-1">
            — items not in Wear_Log
          </span>
        </h2>
        {neverWorn.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Every item has been worn at least once.
          </p>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Item</th>
                  <th className="text-left px-4 py-2.5 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {neverWorn.map((row: any) => (
                  <tr key={row.item_id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{row.name}</p>
                      {row.brand && (
                        <p className="text-xs text-muted-foreground">{row.brand}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-xl px-4 py-4 bg-card">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
