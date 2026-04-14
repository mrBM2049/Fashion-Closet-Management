import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).userId;

  // 3-table JOIN: Transactions + Inventory_Items + Users (seller) + Users (buyer)
  const [rows] = await db.execute(
    `SELECT t.txn_id, t.txn_type, t.status, t.amount, t.txn_date, t.notes, t.created_at,
            ii.name  AS item_name,
            ii.item_id,
            s.username AS seller,
            s.user_id  AS seller_id,
            b.username AS buyer,
            b.user_id  AS buyer_id
     FROM   Transactions t
     JOIN   Inventory_Items ii ON ii.item_id   = t.item_id
     JOIN   Users           s  ON s.user_id    = t.seller_id
     JOIN   Users           b  ON b.user_id    = t.buyer_id
     WHERE  t.seller_id = ? OR t.buyer_id = ?
     ORDER  BY t.created_at DESC`,
    [userId, userId]
  );

  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).userId;
  const { item_id, buyer_id, txn_type, amount, notes } = await req.json();

  if (!item_id || !buyer_id || !txn_type) {
    return Response.json({ error: "item_id, buyer_id and txn_type are required" }, { status: 400 });
  }

  if (String(userId) === String(buyer_id)) {
    return Response.json({ error: "Seller and buyer cannot be the same user" }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Atomic: insert transaction + mark item as Listed
    const [result] = await conn.execute(
      `INSERT INTO Transactions (item_id, seller_id, buyer_id, txn_type, amount, txn_date, notes)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`,
      [item_id, userId, buyer_id, txn_type, amount || null, notes || null]
    );
    await conn.execute(
      `UPDATE Inventory_Items SET status = 'Listed' WHERE item_id = ? AND user_id = ?`,
      [item_id, userId]
    );

    await conn.commit();
    return Response.json({ txn_id: (result as any).insertId }, { status: 201 });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
