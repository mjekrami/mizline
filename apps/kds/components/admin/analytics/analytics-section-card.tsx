import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnalyticsSectionCardProps {
  title: string;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function AnalyticsSectionCard({
  title,
  action,
  footer,
  children,
  className,
  bodyClassName,
}: AnalyticsSectionCardProps) {
  return (
    <section className={cn("admin-panel flex min-w-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      <div className={cn("flex flex-1 flex-col p-5", bodyClassName)}>{children}</div>
      {footer ? (
        <div className="border-t border-border/60 px-5 py-3">{footer}</div>
      ) : null}
    </section>
  );
}

export function AnalyticsSectionSelect({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function AnalyticsSectionLink({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-accent transition hover:opacity-80"
    >
      {label}
    </button>
  );
}
