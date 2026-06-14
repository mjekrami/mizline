export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex min-h-full flex-col">{children}</div>;
}
