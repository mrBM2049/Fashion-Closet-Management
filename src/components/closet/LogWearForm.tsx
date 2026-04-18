"use client";
import { useTransition, useRef } from "react";
import { toast } from "sonner";
import { logWear } from "@/lib/actions/items";
import { ArrowRight } from "lucide-react";

export default function LogWearForm({ itemId }: { itemId: number }) {
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const occasion = formData.get("occasion") as string;
    startTransition(async () => {
      try {
        await logWear(itemId, occasion);
        toast.success("Wear logged.");
        ref.current?.reset();
      } catch {
        toast.error("Failed to log wear.");
      }
    });
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-2">
      <input
        name="occasion"
        placeholder="Occasion — e.g. College, Work, Party"
        className="w-full h-10 rounded-xl px-4 text-sm
                   bg-foreground/6 border border-border
                   text-foreground placeholder:text-foreground/30
                   focus:outline-none focus:ring-1 focus:ring-ring focus:bg-foreground/8
                   transition-all"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full h-12 flex items-center justify-center gap-2 text-sm"
      >
        {pending ? "Logging..." : <><span>Log Wear</span> <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}
