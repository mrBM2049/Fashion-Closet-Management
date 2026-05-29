import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).userId;

  const [cpwRows, mostWornRows, neverWornRows] = await Promise.all([
    // Cost-per-wear from view
    db.execute(
      `SELECT item_id, name, brand, purchase_price, wear_count, cost_per_wear
       FROM   v_cost_per_wear
       WHERE  user_id = ?
       ORDER  BY cost_per_wear ASC`,
      [userId]
    ),
    // Most worn — aggregate + ORDER BY
    db.execute(
      `SELECT item_id, name, brand, wear_count,
              ROUND(purchase_price / NULLIF(wear_count, 0), 2) AS cost_per_wear
       FROM   Inventory_Items
       WHERE  user_id = ?
       ORDER  BY wear_count DESC
       LIMIT  5`,
      [userId]
    ),
    // Never worn — subquery
    db.execute(
      `SELECT item_id, name, brand, created_at
       FROM   Inventory_Items
       WHERE  user_id = ?
         AND  item_id NOT IN (SELECT DISTINCT item_id FROM Wear_Log)
       ORDER  BY created_at DESC`,
      [userId]
    ),
  ]);

  return Response.json({
    costPerWear: cpwRows[0],
    mostWorn:    mostWornRows[0],
    neverWorn:   neverWornRows[0],
  });
}
