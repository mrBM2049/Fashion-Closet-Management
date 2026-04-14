import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ outfitId: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { outfitId } = await props.params;
  const userId = (session.user as any).userId;

  const [[outfitRows], [itemRows]] = await Promise.all([
    db.execute(
      `SELECT * FROM Outfits WHERE outfit_id = ? AND user_id = ?`,
      [outfitId, userId]
    ),
    db.execute(
      `SELECT ii.item_id, ii.name, ii.brand, ii.image_url, oi.position
       FROM   Outfit_Items oi
       JOIN   Inventory_Items ii ON ii.item_id = oi.item_id
       WHERE  oi.outfit_id = ?
       ORDER  BY oi.position`,
      [outfitId]
    ),
  ]);

  const outfit = (outfitRows as any[])[0];
  if (!outfit) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ outfit, items: itemRows });
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ outfitId: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { outfitId } = await props.params;
  const userId = (session.user as any).userId;

  await db.execute(
    `DELETE FROM Outfits WHERE outfit_id = ? AND user_id = ?`,
    [outfitId, userId]
  );

  return Response.json({ success: true });
}
