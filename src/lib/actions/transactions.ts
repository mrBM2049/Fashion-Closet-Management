"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function createTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId   = (session.user as any).userId;
  const itemId   = formData.get("item_id")  as string;
  const buyerId  = formData.get("buyer_id") as string;
  const txnType  = formData.get("txn_type") as string;
  const amount   = formData.get("amount")   as string;
  const notes    = formData.get("notes")    as string;

  if (!itemId || !buyerId || !txnType) {
    return { error: "Item, buyer and type are required." };
  }
  if (String(userId) === String(buyerId)) {
    return { error: "You cannot create a transaction with yourself." };
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO Transactions (item_id, seller_id, buyer_id, txn_type, amount, txn_date, notes)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`,
      [itemId, userId, buyerId, txnType, amount || null, notes || null]
    );
    await conn.execute(
      `UPDATE Inventory_Items SET status = 'Listed' WHERE item_id = ? AND user_id = ?`,
      [itemId, userId]
    );

    await conn.commit();
  } catch (e: any) {
    await conn.rollback();
    return { error: e.message ?? "Failed to create transaction." };
  } finally {
    conn.release();
  }

  revalidatePath("/transactions");
  return { success: true };
}

export async function updateTransactionStatus(txnId: number, status: "Completed" | "Cancelled") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).userId;

  // Verify ownership
  const [rows] = await db.execute(
    `SELECT txn_id FROM Transactions WHERE txn_id = ? AND seller_id = ?`,
    [txnId, userId]
  );
  if ((rows as any[]).length === 0) throw new Error("Not found or not authorized");

  await db.execute(
    `UPDATE Transactions SET status = ? WHERE txn_id = ?`,
    [status, txnId]
  );
  // trg_update_item_status_on_sale fires automatically for Sale + Completed

  revalidatePath("/transactions");
}
