import { StaffNav } from "@/components/staff-nav";

export default function KitchenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <StaffNav />
      {children}
    </div>
  );
}
