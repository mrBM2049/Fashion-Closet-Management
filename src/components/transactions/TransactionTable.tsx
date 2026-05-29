"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTransactionStatus } from "@/lib/actions/transactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";

interface TxnRow {
  txn_id: number;
  txn_type: "Sale" | "Borrow";
  status: "Pending" | "Completed" | "Cancelled";
  amount: number | null;
  txn_date: string;
  item_name: string;
  item_id: number;
  seller: string;
  seller_id: number;
  buyer: string;
  buyer_id: number;
  notes: string | null;
}

const statusColor: Record<string, string> = {
  Pending:   "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100  text-green-800",
  Cancelled: "bg-red-100    text-red-800",
};

const typeColor: Record<string, string> = {
  Sale:   "bg-blue-100  text-blue-800",
  Borrow: "bg-purple-100 text-purple-800",
};

export default function TransactionTable({
  rows,
  currentUserId,
}: {
  rows: TxnRow[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [updating, setUpdating] = useState<number | null>(null);

  const handleStatus = (txnId: number, status: "Completed" | "Cancelled") => {
    setUpdating(txnId);
    startTransition(async () => {
      try {
        await updateTransactionStatus(txnId, status);
        toast.success(`Transaction marked as ${status}.`);
      } catch {
        toast.error("Failed to update transaction.");
      }
      setUpdating(null);
    });
  };

  if (rows.length === 0) {
    return (
      <div className="glass rounded-2xl flex flex-col items-center justify-center py-16 text-center">
        <ArrowLeftRight className="w-10 h-10 mb-3 text-foreground/20" />
        <p className="font-semibold text-foreground/50">No transactions yet</p>
        <p className="text-sm text-foreground/30 mt-1">Create your first sale or borrow record below.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="border-b border-border/40">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground/40">Item</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground/40">Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground/40 hidden sm:table-cell">Parties</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground/40">Amount</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground/40 hidden sm:table-cell">Date</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground/40">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground/40">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSeller = String(row.seller_id) === String(currentUserId);
            const canUpdate = isSeller && row.status === "Pending";
            const isUpdating = updating === row.txn_id && pending;

            return (
              <tr key={row.txn_id} className="border-t border-border/40 hover:bg-foreground/3 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground/85 max-w-[120px] truncate">{row.item_name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[row.txn_type]}`}>
                    {row.txn_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                  <span className="text-foreground font-medium">{row.seller}</span>
                  <span className="mx-1">→</span>
                  <span className="text-foreground font-medium">{row.buyer}</span>
                </td>
                <td className="px-4 py-3">
                  {row.amount != null ? `₹${Number(row.amount).toFixed(2)}` : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {new Date(row.txn_date).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {canUpdate ? (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50"
                        disabled={isUpdating}
                        onClick={() => handleStatus(row.txn_id, "Completed")}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-700 border-red-200 hover:bg-red-50"
                        disabled={isUpdating}
                        onClick={() => handleStatus(row.txn_id, "Cancelled")}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
