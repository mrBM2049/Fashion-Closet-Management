import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [rows] = await db.execute(
    `SELECT cat_id, name, slug, parent_id FROM Categories ORDER BY parent_id IS NOT NULL, name`
  );

  return Response.json(rows);
}
