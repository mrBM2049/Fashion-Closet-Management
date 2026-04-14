"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createTransaction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "@/types";

interface OtherUser {
  user_id: number;
  username: string;
}

type State = { error?: string; success?: boolean } | null;

async function action(_prev: State, formData: FormData): Promise<State> {
  return createTransaction(formData);
}

export default function CreateTransactionForm({
  items,
  users,
}: {
  items: InventoryItem[];
  users: OtherUser[];
}) {
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.error)   toast.error(state.error);
    if (state?.success) toast.success("Transaction created successfully.");
  }, [state]);

  return (
    <form action={formAction} className="space-y-5 border rounded-xl p-5 bg-card">
      <h2 className="font-semibold text-base">New Transaction</h2>

      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          Transaction created successfully.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="item_id">Item *</Label>
          <select
            id="item_id"
            name="item_id"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select item</option>
            {items.map((i) => (
              <option key={i.item_id} value={i.item_id}>
                {i.name}{i.brand ? ` — ${i.brand}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="buyer_id">Buyer *</Label>
          <select
            id="buyer_id"
            name="buyer_id"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select buyer</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.username}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="txn_type">Type *</Label>
          <select
            id="txn_type"
            name="txn_type"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select type</option>
            <option value="Sale">Sale</option>
            <option value="Borrow">Borrow</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Optional notes..."
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create Transaction"}
      </Button>
    </form>
  );
}
