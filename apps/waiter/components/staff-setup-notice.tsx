import { ThemeToggle } from "@/components/theme-toggle";
import { STAFF_SETUP_INSTRUCTIONS } from "@/constants/staff-setup";

interface StaffSetupNoticeProps {
  title: string;
  message: string;
}

export function StaffSetupNotice({ title, message }: StaffSetupNoticeProps) {
  return (
    <main className="flex min-h-full items-center justify-center p-8">
      <div className="relative max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Setup required
        </h1>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-xs">
          {STAFF_SETUP_INSTRUCTIONS}
        </pre>
      </div>
    </main>
  );
}
