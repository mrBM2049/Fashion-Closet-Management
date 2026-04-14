"use client";
import { useTransition, useRef } from "react";
import { toast } from "sonner";
import { logWear } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";

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
        toast.success("Wear logged successfully.");
        ref.current?.reset();
      } catch {
        toast.error("Failed to log wear.");
      }
    });
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className="flex gap-2 pt-2">
      <input
        name="occasion"
        placeholder="Occasion (e.g. College)"
        className="flex-1 border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button type="submit" size="sm" disabled={pending}>
        <CalendarCheck className="w-4 h-4 mr-1" />
        {pending ? "Logging..." : "Log Wear"}
      </Button>
    </form>
  );
}
