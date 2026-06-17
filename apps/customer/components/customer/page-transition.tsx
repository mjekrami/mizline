"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomerPageTransitionProps {
  transitionKey: string;
  children: ReactNode;
  className?: string;
}

export function CustomerPageTransition({
  transitionKey,
  children,
  className,
}: CustomerPageTransitionProps) {
  return (
    <div key={transitionKey} className={cn("customer-page-enter", className)}>
      {children}
    </div>
  );
}
