import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

const waiterSans = Plus_Jakarta_Sans({
  variable: "--font-customer",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function WaiterLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`customer-app ${waiterSans.variable} min-h-dvh w-full font-[family-name:var(--font-customer)]`}
    >
      {children}
    </div>
  );
}
