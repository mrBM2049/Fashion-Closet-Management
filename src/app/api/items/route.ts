import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const catId  = searchParams.get("cat_id")  || null;
  const color  = searchParams.get("color")   || null;
  const size   = searchParams.get("size")    || null;
  const status = searchParams.get("status")  || null;
  const search = searchParams.get("search")  || null;
  const userId = (session.user as any).userId;

  let rows;

  if (search) {
    [rows] = await db.execute(
      `SELECT ii.*, c.name AS category_name,
              MATCH(ii.name, ii.brand, ii.description) AGAINST(? IN BOOLEAN MODE) AS relevance
       FROM   Inventory_Items ii
       LEFT JOIN Categories c ON c.cat_id = ii.cat_id
       WHERE  ii.user_id = ?
         AND  MATCH(ii.name, ii.brand, ii.description) AGAINST(? IN BOOLEAN MODE)
       ORDER  BY relevance DESC`,
      [search, userId, search]
    );
  } else {
    [rows] = await db.execute(
      `SELECT ii.*, c.name AS category_name
       FROM   Inventory_Items ii
       LEFT JOIN Categories c ON c.cat_id = ii.cat_id
       WHERE  ii.user_id = ?
         AND  (? IS NULL OR ii.cat_id = ?)
         AND  (? IS NULL OR ii.color  = ?)
         AND  (? IS NULL OR ii.size   = ?)
         AND  (? IS NULL OR ii.status = ?)
       ORDER  BY ii.created_at DESC`,
      [userId, catId, catId, color, color, size, size, status, status]
    );
  }

  return Response.json(rows);
}
