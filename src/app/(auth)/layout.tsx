import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 gap-6">
      <Link href="/">
        <Logo className="h-12 w-auto" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
