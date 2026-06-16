import type { ReactNode } from "react";

export default function CustomerTableLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="min-h-dvh w-full">{children}</div>;
}
