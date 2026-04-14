import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await props.params;
  const { occasion } = await req.json();

  await db.execute("CALL sp_add_wear_entry(?, CURDATE(), ?)", [itemId, occasion || null]);

  return Response.json({ success: true });
}
