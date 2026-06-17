"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  canAccessAdmin,
  canAccessKitchen,
  type StaffRole,
} from "@mizline/shared";
import { usePathContext } from "@/components/path-provider";
import { staffHref } from "@/lib/staff-path";
import { loadAuthSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const links = [
  { section: "kitchen" as const, label: "Kitchen", canAccess: canAccessKitchen },
  { section: "admin" as const, label: "Admin", canAccess: canAccessAdmin },
];

export function StaffNav() {
  const { pathname, staffPath, isAdmin, isKitchen } = usePathContext();
  const basePath = staffPath ?? "";
  const [role, setRole] = useState<StaffRole | null>(null);

  useEffect(() => {
    void loadAuthSession().then((user) => {
      setRole(user?.role ?? null);
    });
  }, []);

  const visibleLinks = role
    ? links.filter((link) => link.canAccess(role))
    : links;

  if (visibleLinks.length === 0) {
    return null;
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center gap-6 px-4 py-3 md:px-6">
        <span className="text-sm font-semibold tracking-tight">
          Mizline Staff
        </span>
        <div className="flex gap-1">
          {visibleLinks.map(({ section, label }) => {
            const href = staffHref(section, basePath);
            const active =
              (section === "admin" && isAdmin) ||
              (section === "kitchen" && isKitchen) ||
              pathname.startsWith(href);

            return (
              <Link
                key={section}
                href={href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
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
