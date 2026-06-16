"use client";

import { Heart, Home, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type BottomTab = "home" | "favorites" | "profile";

interface BottomTabBarProps {
  active: BottomTab;
  storeId: string;
  tableId: string;
  onTabChange?: (tab: BottomTab) => void;
}

const tabs: {
  id: BottomTab;
  label: string;
  icon: typeof Home;
  href?: (storeId: string, tableId: string) => string;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "favorites", label: "Favorites", icon: Heart },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    href: (storeId, tableId) =>
      `/store/${storeId}/table/${tableId}/orders`,
  },
];

export function BottomTabBar({
  active,
  storeId,
  tableId,
  onTabChange,
}: BottomTabBarProps) {
  return (
    <nav
      className="customer-bottom-nav fixed inset-x-0 bottom-0 z-30 px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-center gap-3">
        {tabs.map(({ id, label, icon: Icon, href }) => {
          const isActive = active === id;
          const className = cn(
            "flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
            isActive
              ? "customer-bottom-nav-item-active px-5"
              : "size-12 bg-card text-muted-foreground shadow-sm",
          );

          if (href && id !== "home") {
            return (
              <Link
                key={id}
                href={href(storeId, tableId)}
                className={className}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.25 : 2} />
                {isActive ? <span>{label}</span> : null}
              </Link>
            );
          }

          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange?.(id)}
              className={className}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.25 : 2} />
              {isActive ? <span>{label}</span> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
