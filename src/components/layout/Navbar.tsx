import Link from "next/link";
import { auth, signOut } from "@/auth";
import { LogOut } from "lucide-react";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";
import MobileTopBar from "@/components/layout/MobileTopBar";

const NAV_LINKS = [
  { href: "/closet",       label: "Browse"       },
  { href: "/outfits",      label: "Outfits"      },
  { href: "/analytics",    label: "Analytics"    },
  { href: "/transactions", label: "Transactions" },
];

export default async function Navbar() {
  const session = await auth();

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/signin" });
  };

  return (
    <>
      {/* ── Mobile top bar (scroll-aware, client component) ── */}
      <MobileTopBar
        username={session?.user?.name}
        signOutAction={signOutAction}
      />

      {/* ── Desktop top bar ── */}
      <header className="hidden md:block sticky top-0 z-50 px-4 pt-3 pb-2">
        <nav className="glass-nav max-w-7xl mx-auto rounded-2xl px-5 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/closet" className="flex items-center shrink-0 mr-2">
            <Logo className="h-7 w-auto" />
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-foreground/75
                           hover:text-foreground hover:bg-foreground/8
                           transition-all duration-150"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-foreground/55 hidden lg:block font-medium px-1">
              {session?.user?.name}
            </span>
            <ThemeToggle />
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           text-foreground/50 hover:text-foreground border border-border/60
                           hover:bg-foreground/5 transition-all duration-150 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign out</span>
              </button>
            </form>
          </div>
        </nav>
      </header>
    </>
  );
}
