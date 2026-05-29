import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";

// PATCH — update status (Pending → Completed | Cancelled)
// Completing a Sale triggers trg_update_item_status_on_sale → sets item status = 'Sold'
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ txnId: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { txnId } = await props.params;
  const userId = (session.user as any).userId;
  const { status } = await req.json();

  if (!["Completed", "Cancelled"].includes(status)) {
    return Response.json({ error: "status must be Completed or Cancelled" }, { status: 400 });
  }

  // Only seller can update status
  const [rows] = await db.execute(
    `SELECT txn_id FROM Transactions WHERE txn_id = ? AND seller_id = ?`,
    [txnId, userId]
  );
  if ((rows as any[]).length === 0) {
    return Response.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  await db.execute(
    `UPDATE Transactions SET status = ? WHERE txn_id = ?`,
    [status, txnId]
  );
  // trg_update_item_status_on_sale fires automatically when status = 'Completed' AND txn_type = 'Sale'

  return Response.json({ success: true });
}
