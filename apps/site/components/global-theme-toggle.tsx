"use client";

import { usePathContext } from "@/components/path-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export function GlobalThemeToggle() {
  const { isStaff, isCustomer } = usePathContext();

  if (isStaff || isCustomer) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <ThemeToggle />
    </div>
  );
}
