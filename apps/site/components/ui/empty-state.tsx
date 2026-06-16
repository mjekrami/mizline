import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4 text-center",
        compact ? "py-6" : "gap-3 px-6 py-12",
        className,
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted",
            compact ? "size-10" : "size-14",
          )}
        >
          <Icon
            className={cn(
              "text-muted-foreground",
              compact ? "size-5" : "size-7",
            )}
            aria-hidden
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-0.5">
        <p
          className={cn(
            "font-semibold text-foreground",
            compact ? "text-sm" : "text-lg",
          )}
        >
          {title}
        </p>
        {description ? (
          <p
            className={cn(
              "max-w-sm text-muted-foreground",
              compact ? "text-sm" : "text-base",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={compact ? "mt-1" : "mt-2"}>{action}</div> : null}
    </div>
  );
}
