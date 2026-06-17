"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  scriptProps,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  const resolvedScriptProps =
    typeof window === "undefined"
      ? scriptProps
      : { ...scriptProps, type: "application/json" as const };

  return (
    <NextThemesProvider {...props} scriptProps={resolvedScriptProps}>
      {children}
    </NextThemesProvider>
  );
}
