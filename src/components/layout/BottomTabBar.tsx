"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, Layers, BarChart2, ArrowLeftRight } from "lucide-react";

const TABS = [
  {
    href:  "/closet",
    label: "Closet",
    // Shirt/hanger icon — represents wardrobe
    icon:  Shirt,
  },
  {
    href:  "/outfits",
    label: "Outfits",
    // Stacked layers — represents a curated look/outfit
    icon:  Layers,
  },
  {
    href:  "/analytics",
    label: "Analytics",
    // Bar chart — represents data/insights
    icon:  BarChart2,
  },
  {
    href:  "/transactions",
    label: "Exchange",
    // Two arrows — represents buying/selling/borrowing
    icon:  ArrowLeftRight,
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    /* md:hidden — only visible on mobile */
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 px-3 pb-[env(safe-area-inset-bottom,12px)] pt-1.5"
      aria-label="Mobile navigation"
    >
      <div className="glass-nav rounded-2xl flex items-center justify-around px-2 h-16">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl
                          transition-all duration-200 min-w-[44px]
                          ${active
                            ? "text-foreground"
                            : "text-foreground/35 hover:text-foreground/65"
                          }`}
            >
              <div className={`relative flex items-center justify-center
                               w-10 h-7 rounded-xl transition-all duration-200
                               ${active ? "bg-foreground/10" : ""}`}>
                <Icon className={`transition-all duration-200 ${active ? "w-5 h-5" : "w-5 h-5"}`} />
                {/* Active dot indicator */}
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2
                                   w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all duration-200
                                ${active ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
