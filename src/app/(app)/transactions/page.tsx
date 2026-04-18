import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { ArrowLeftRight } from "lucide-react";
import TransactionTable from "@/components/transactions/TransactionTable";
import CreateTransactionForm from "@/components/transactions/CreateTransactionForm";
import { InventoryItem } from "@/types";

async function getData(userId: string) {
  const [txnRows, itemRows, userRows] = await Promise.all([
    // 3-table JOIN: Transactions + Inventory_Items + Users (seller) + Users (buyer)
    db.execute(
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
    ),
    // Only user's own Available items can be listed for sale/borrow
    db.execute(
      `SELECT item_id, name, brand FROM Inventory_Items
       WHERE  user_id = ? AND status = 'Available'
       ORDER  BY name`,
      [userId]
    ),
    // All other users (potential buyers)
    db.execute(
      `SELECT user_id, username FROM Users WHERE user_id != ? ORDER BY username`,
      [userId]
    ),
  ]);

  return {
    transactions: txnRows[0]  as any[],
    items:        itemRows[0] as InventoryItem[],
    users:        userRows[0] as { user_id: number; username: string }[],
  };
}

export default async function TransactionsPage() {
  const session = await auth();
  const userId  = (session?.user as any)?.userId as string;

  const { transactions, items, users } = await getData(userId);

  // Summary counts
  const pending   = transactions.filter((t) => t.status === "Pending").length;
  const completed = transactions.filter((t) => t.status === "Completed").length;
  const total     = transactions.length;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/30 mb-1.5">EXCHANGE HISTORY</p>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-foreground/40" /> Transactions
        </h1>
        <p className="text-sm text-foreground/40 mt-1">Sales and borrows involving your items</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total"     value={String(total)} />
        <StatCard label="Pending"   value={String(pending)}   accent="yellow" />
        <StatCard label="Completed" value={String(completed)} accent="green" />
      </div>

      {/* History table */}
      <section className="space-y-3">
        <h2 className="font-semibold text-base">History</h2>
        <TransactionTable rows={transactions} currentUserId={userId} />
      </section>

      {/* Create form */}
      <section>
        <CreateTransactionForm items={items} users={users} />
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "yellow" | "green" }) {
  const color = accent === "yellow" ? "text-amber-500" : accent === "green" ? "text-emerald-500" : "";
  return (
    <div className="glass-well rounded-2xl px-5 py-5">
      <p className="text-xs font-semibold tracking-[0.12em] uppercase text-foreground/40 mb-2">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}
