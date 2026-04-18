"use client";
import { useActionState } from "react";
import Link from "next/link";
import { signInUser } from "@/lib/actions/auth";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const [state, action, pending] = useActionState(signInUser, null);

  return (
    <>
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Sign in to your ThreadShare account</p>
      </div>

      <form action={action} className="space-y-4">
        {state?.error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-center">
            {state.error}
          </div>
        )}

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
            placeholder="Your password"
            required
            className="h-11 rounded-xl bg-input border-border text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full h-12 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Signing in..." : "Sign In →"}
        </button>

        <p className="text-sm text-center text-muted-foreground pt-1">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground font-semibold hover:opacity-80 transition-opacity">
            Sign up
          </Link>
        </p>
      </form>
    </>
  );
}
