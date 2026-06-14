"use client";

import type { ReactNode } from "react";

interface AdminShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}

export function AdminShell({ sidebar, header, children }: AdminShellProps) {
  return (
    <div className="admin-dashboard dark flex min-h-full bg-background text-foreground">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <main className="admin-grid-bg flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
