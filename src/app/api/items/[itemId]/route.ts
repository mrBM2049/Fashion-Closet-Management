import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await props.params;
  const userId = (session.user as any).userId;

  const [[items], [logs]] = await Promise.all([
    db.execute(
      `SELECT ii.*, c.name AS category_name
       FROM   Inventory_Items ii
       LEFT JOIN Categories c ON c.cat_id = ii.cat_id
       WHERE  ii.item_id = ? AND ii.user_id = ?`,
      [itemId, userId]
    ),
    db.execute(
      `SELECT worn_on, occasion FROM Wear_Log WHERE item_id = ? ORDER BY worn_on DESC`,
      [itemId]
    ),
  ]);

  const item = (items as any[])[0];
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ item, wearLog: logs });
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await props.params;
  const userId = (session.user as any).userId;
  const body = await req.json();

  const { name, brand, cat_id, color, size, condition_grade, purchase_price, description, status } = body;

  await db.execute(
    `UPDATE Inventory_Items
     SET name=?, brand=?, cat_id=?, color=?, size=?, condition_grade=?, purchase_price=?, description=?, status=?
     WHERE item_id=? AND user_id=?`,
    [name, brand || null, cat_id || null, color || null, size || null,
     condition_grade || "Good", purchase_price || null, description || null,
     status || "Available", itemId, userId]
  );

  return Response.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await props.params;
  const userId = (session.user as any).userId;

  await db.execute(
    `DELETE FROM Inventory_Items WHERE item_id = ? AND user_id = ?`,
    [itemId, userId]
  );

  return Response.json({ success: true });
}
