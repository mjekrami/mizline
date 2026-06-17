import { StaffNav } from "@/components/staff-nav";

export default function KitchenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="kitchen-shell flex min-h-dvh flex-col">
      <StaffNav />
      {children}
    </div>
  );
}
