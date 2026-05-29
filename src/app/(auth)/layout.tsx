import Link from "next/link";
import Logo from "@/components/layout/Logo";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-8 relative">
      {/* Theme toggle — top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Logo className="h-9 w-auto" />
      </Link>

      {/* Glass card */}
      <div className="w-full max-w-[400px] glass rounded-3xl p-8 shadow-2xl">
        {children}
      </div>

      <p className="text-xs text-foreground/20">
        ThreadShare · Fashion Closet Management
      </p>
    </div>
  );
}
