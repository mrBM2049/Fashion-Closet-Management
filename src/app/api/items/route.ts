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
              ts_rank(ii.search_vector, websearch_to_tsquery('english', ?)) AS relevance
       FROM   Inventory_Items ii
       LEFT JOIN Categories c ON c.cat_id = ii.cat_id
       WHERE  ii.user_id = ?
         AND  ii.search_vector @@ websearch_to_tsquery('english', ?)
       ORDER  BY relevance DESC`,
      [search, userId, search]
    );
  } else {
    let sql = `
      SELECT ii.*, c.name AS category_name
      FROM   Inventory_Items ii
      LEFT JOIN Categories c ON c.cat_id = ii.cat_id
      WHERE  ii.user_id = ?
    `;
    const values: any[] = [userId];

    if (catId) {
      sql += ` AND ii.cat_id = ?`;
      values.push(catId);
    }
    if (color) {
      sql += ` AND ii.color = ?`;
      values.push(color);
    }
    if (size) {
      sql += ` AND ii.size = ?`;
      values.push(size);
    }
    if (status) {
      sql += ` AND ii.status = ?`;
      values.push(status);
    }

    sql += ` ORDER BY ii.created_at DESC`;
    [rows] = await db.execute(sql, values);
  }

  return Response.json(rows);
}
