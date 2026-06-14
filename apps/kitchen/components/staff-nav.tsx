"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/kitchen", label: "Kitchen" },
  { href: "/admin", label: "Admin" },
] as const;

export function StaffNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center gap-6 px-4 py-3 md:px-6">
        <span className="text-sm font-semibold tracking-tight">
          Mizline Staff
        </span>
        <div className="flex gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
