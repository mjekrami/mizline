"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  isStaffSection,
  parseStaffPath,
  type ParsedStaffPath,
} from "@/lib/staff-path";

interface PathContextValue extends ParsedStaffPath {
  pathname: string;
  isAdmin: boolean;
  isKitchen: boolean;
  isStaff: boolean;
}

const PathContext = createContext<PathContextValue | null>(null);

export function PathProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const value = useMemo<PathContextValue>(() => {
    const parsed = parseStaffPath(pathname);

    return {
      pathname,
      ...parsed,
      isAdmin: parsed.section === "admin",
      isKitchen: parsed.section === "kitchen",
      isStaff: isStaffSection(parsed.section),
    };
  }, [pathname]);

  return <PathContext.Provider value={value}>{children}</PathContext.Provider>;
}

export function usePathContext(): PathContextValue {
  const context = useContext(PathContext);

  if (!context) {
    throw new Error("usePathContext must be used within PathProvider");
  }

  return context;
}
