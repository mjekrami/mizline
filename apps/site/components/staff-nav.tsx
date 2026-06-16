"use client";

import Link from "next/link";
import { usePathContext } from "@/components/path-provider";
import { staffHref } from "@/lib/site-path";
import { cn } from "@/lib/utils";

const links = [
  { section: "kitchen" as const, label: "Kitchen" },
  { section: "admin" as const, label: "Admin" },
];

export function StaffNav() {
  const { pathname, staffPath, isAdmin, isKitchen } = usePathContext();
  const basePath = staffPath ?? "";

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center gap-6 px-4 py-3 md:px-6">
        <span className="text-sm font-semibold tracking-tight">
          Mizline Staff
        </span>
        <div className="flex gap-1">
          {links.map(({ section, label }) => {
            const href = staffHref(section, basePath);

            return (
              <Link
                key={section}
                href={href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  (section === "admin" ? isAdmin : isKitchen) ||
                    pathname.startsWith(href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
