import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).userId;

  const [outfits] = await db.execute(
    `SELECT o.outfit_id, o.name, o.occasion_tag, o.created_at,
            COUNT(oi.item_id) AS item_count
     FROM   Outfits o
     LEFT JOIN Outfit_Items oi ON oi.outfit_id = o.outfit_id
     WHERE  o.user_id = ?
     GROUP  BY o.outfit_id
     ORDER  BY o.created_at DESC`,
    [userId]
  );

  return Response.json(outfits);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).userId;
  const { name, occasion_tag, item_ids } = await req.json();

  if (!name || !Array.isArray(item_ids) || item_ids.length === 0) {
    return Response.json({ error: "Name and at least one item required" }, { status: 400 });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO Outfits (user_id, name, occasion_tag) VALUES (?, ?, ?)`,
      [userId, name, occasion_tag || null]
    );
    const outfitId = (result as any).insertId;

    const values = item_ids.map((id: number, i: number) => [outfitId, id, i + 1]);
    for (const [oid, iid, pos] of values) {
      await conn.execute(
        `INSERT INTO Outfit_Items (outfit_id, item_id, position) VALUES (?, ?, ?)`,
        [oid, iid, pos]
      );
    }

    await conn.commit();
    return Response.json({ outfit_id: outfitId }, { status: 201 });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
