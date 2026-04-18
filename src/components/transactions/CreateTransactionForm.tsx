"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createTransaction } from "@/lib/actions/transactions";
import { Input } from "@/components/ui/input";
import GlassSelect from "@/components/ui/glass-select";
import { ArrowRight } from "lucide-react";
import { InventoryItem } from "@/types";

interface OtherUser { user_id: number; username: string; }
type State = { error?: string; success?: boolean } | null;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-foreground/35 mb-1.5">{children}</p>;
}

async function action(_prev: State, formData: FormData): Promise<State> {
  return createTransaction(formData);
}

export default function CreateTransactionForm({ items, users }: { items: InventoryItem[]; users: OtherUser[] }) {
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.error)   toast.error(state.error);
    if (state?.success) toast.success("Transaction created.");
  }, [state]);

  const itemOptions = items.map((i) => ({ value: String(i.item_id), label: i.brand ? `${i.name} — ${i.brand}` : i.name }));
  const userOptions = users.map((u) => ({ value: String(u.user_id), label: u.username }));
  const typeOptions = [{ value: "Sale", label: "Sale" }, { value: "Borrow", label: "Borrow" }];

  return (
    <form action={formAction} className="glass rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/35 mb-1">NEW TRANSACTION</p>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Record Exchange</h2>
      </div>

      {state?.error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Item *</FieldLabel>
          <GlassSelect name="item_id" placeholder="Select item" options={itemOptions} required />
        </div>
        <div>
          <FieldLabel>Buyer *</FieldLabel>
          <GlassSelect name="buyer_id" placeholder="Select buyer" options={userOptions} required />
        </div>
        <div>
          <FieldLabel>Type *</FieldLabel>
          <GlassSelect name="txn_type" placeholder="Select type" options={typeOptions} required />
        </div>
        <div>
          <FieldLabel>Amount (₹)</FieldLabel>
          <Input name="amount" type="number" min="0" step="0.01" placeholder="0.00"
            className="bg-foreground/6 border-border text-foreground placeholder:text-foreground/30 h-10 rounded-xl" />
        </div>
      </div>

      <div>
        <FieldLabel>Notes</FieldLabel>
        <textarea name="notes" rows={2} placeholder="Optional notes..."
          className="w-full rounded-xl px-3.5 py-2.5 text-sm resize-none
                     bg-foreground/6 border border-border text-foreground placeholder:text-foreground/30
                     focus:outline-none focus:ring-1 focus:ring-ring focus:bg-foreground/8 transition-all" />
      </div>

      <button type="submit" disabled={pending}
        className="btn-primary w-full h-12 flex items-center justify-center gap-2 text-sm">
        {pending ? "Creating..." : <><span>Create Transaction</span><ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}
