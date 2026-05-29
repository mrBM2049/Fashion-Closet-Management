"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setTimeout(() => router.push("/signin"), 1500);
    }
    if (state?.error) toast.error(state.error);
  }, [state, router]);

  return (
    <>
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an account</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Join ThreadShare to manage your wardrobe</p>
      </div>

      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-center">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-center">
            {state.success}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="username" className="block text-xs font-bold tracking-[0.12em] uppercase text-muted-foreground">
            Username
          </label>
          <Input
            id="username"
            name="username"
            placeholder="your_username"
            required
            className="h-11 rounded-xl bg-input border-border text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-bold tracking-[0.12em] uppercase text-muted-foreground">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-11 rounded-xl bg-input border-border text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-bold tracking-[0.12em] uppercase text-muted-foreground">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            minLength={6}
            required
            className="h-11 rounded-xl bg-input border-border text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full h-12 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Creating account..." : "Sign Up →"}
        </button>

        <p className="text-sm text-center text-muted-foreground pt-1">
          Already have an account?{" "}
          <Link href="/signin" className="text-foreground font-semibold hover:opacity-80 transition-opacity">
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}
