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
      <div className="text-center py-16 text-muted-foreground border rounded-xl">
        <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No transactions yet</p>
        <p className="text-sm mt-1">Create your first sale or borrow record below.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-2.5 font-medium">Item</th>
            <th className="text-left px-4 py-2.5 font-medium">Type</th>
            <th className="text-left px-4 py-2.5 font-medium">Parties</th>
            <th className="text-left px-4 py-2.5 font-medium">Amount</th>
            <th className="text-left px-4 py-2.5 font-medium">Date</th>
            <th className="text-left px-4 py-2.5 font-medium">Status</th>
            <th className="text-left px-4 py-2.5 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSeller = String(row.seller_id) === String(currentUserId);
            const canUpdate = isSeller && row.status === "Pending";
            const isUpdating = updating === row.txn_id && pending;

            return (
              <tr key={row.txn_id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{row.item_name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[row.txn_type]}`}>
                    {row.txn_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  <span className="text-foreground font-medium">{row.seller}</span>
                  <span className="mx-1">→</span>
                  <span className="text-foreground font-medium">{row.buyer}</span>
                </td>
                <td className="px-4 py-3">
                  {row.amount != null ? `₹${Number(row.amount).toFixed(2)}` : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
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
