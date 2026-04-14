import Link from "next/link";
import { auth } from "@/auth";
import { signOut } from "@/auth";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/closet" className="font-semibold text-lg tracking-tight">
          ThreadShare
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/closet" className="text-muted-foreground hover:text-foreground transition-colors">
            Closet
          </Link>
          <Link href="/outfits" className="text-muted-foreground hover:text-foreground transition-colors">
            Outfits
          </Link>
          <Link href="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
            Analytics
          </Link>
          <Link href="/transactions" className="text-muted-foreground hover:text-foreground transition-colors">
            Transactions
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {session?.user?.name}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/signin" });
            }}
          >
            <Button variant="outline" size="sm" type="submit">
              <LogOut className="w-4 h-4 mr-1" />Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
