import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

const customerSans = Plus_Jakarta_Sans({
  variable: "--font-customer",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function CustomerTableLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`customer-app ${customerSans.variable} min-h-dvh w-full font-[family-name:var(--font-customer)]`}
    >
      {children}
    </div>
  );
}
