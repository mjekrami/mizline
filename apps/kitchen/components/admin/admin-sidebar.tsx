"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  QrCode,
  SlidersHorizontal,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSection =
  | "overview"
  | "orders"
  | "products"
  | "categories"
  | "modifiers"
  | "tables";

interface AdminSidebarProps {
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  counts: {
    orders: number;
    products: number;
    categories: number;
    modifiers: number;
    tables: number;
  };
}

const navItems: {
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
  countKey?: keyof AdminSidebarProps["counts"];
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ClipboardList, countKey: "orders" },
  { id: "products", label: "Products", icon: UtensilsCrossed, countKey: "products" },
  { id: "categories", label: "Categories", icon: FolderTree, countKey: "categories" },
  { id: "modifiers", label: "Modifiers", icon: SlidersHorizontal, countKey: "modifiers" },
  { id: "tables", label: "Tables", icon: QrCode, countKey: "tables" },
];

export function AdminSidebar({
  section,
  onSectionChange,
  counts,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border/60 bg-card/50">
      <div className="border-b border-border/60 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Mizline
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">Admin Console</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ id, label, icon: Icon, countKey }) => {
          const active = section === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSectionChange(id)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <span className="inline-flex items-center gap-2.5">
                <Icon className="size-4" />
                {label}
              </span>
              {countKey ? (
                <span className="rounded-full bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {counts[countKey]}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <Link
          href="/kitchen"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/kitchen")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <ChefHat className="size-4" />
          Kitchen display
        </Link>
      </div>
    </aside>
  );
}
