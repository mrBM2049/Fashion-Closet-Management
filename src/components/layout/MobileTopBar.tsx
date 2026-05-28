"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";

interface Props {
  username?: string | null;
  signOutAction: () => Promise<void>;
}

export default function MobileTopBar({ username, signOutAction }: Props) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const onScroll = () => {
      if (!mounted.current) return;
      const y = window.scrollY;
      if (y < 10) {
        setVisible(true);
      } else if (y < lastY.current) {
        setVisible(true);
      } else if (y > lastY.current + 4) {
        setVisible(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mounted.current = false;
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`md:hidden fixed top-0 inset-x-0 z-50 px-3 pt-2 pb-1.5
                  transition-transform duration-300 ease-in-out
                  ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="glass-nav rounded-2xl px-3 h-12 flex items-center">

        {/* LEFT — theme toggle */}
        <div className="flex-1 flex items-center justify-start">
          <ThemeToggle />
        </div>

        {/* CENTER — logo */}
        <div className="flex items-center justify-center">
          <Link href="/closet" aria-label="Home">
            <Logo className="h-6 w-auto" />
          </Link>
        </div>

        {/* RIGHT — username + sign out */}
        <div className="flex-1 flex items-center justify-end gap-1.5">
          {username && (
            <span className="text-xs text-foreground/50 font-medium truncate max-w-[80px]">
              {username}
            </span>
          )}
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         text-foreground/45 hover:text-foreground
                         border border-border/50 hover:bg-foreground/6
                         transition-all duration-150"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </header>
  );
}
