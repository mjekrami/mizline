"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  parseSitePath,
  type ParsedSitePath,
  type SiteSection,
} from "@/lib/site-path";

interface PathContextValue extends ParsedSitePath {
  pathname: string;
  isAdmin: boolean;
  isKitchen: boolean;
  isStaff: boolean;
  isCustomer: boolean;
}

const PathContext = createContext<PathContextValue | null>(null);

export function PathProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const value = useMemo<PathContextValue>(() => {
    const parsed = parseSitePath(pathname);

    return {
      pathname,
      ...parsed,
      isAdmin: parsed.section === "admin",
      isKitchen: parsed.section === "kitchen",
      isStaff: parsed.section === "kitchen" || parsed.section === "admin",
      isCustomer: parsed.section === "customer",
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

export function useSiteSection(): SiteSection {
  return usePathContext().section;
}

export function useIsAdmin(): boolean {
  return usePathContext().isAdmin;
}
