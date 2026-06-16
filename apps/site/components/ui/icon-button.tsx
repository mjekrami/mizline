"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80",
        secondary:
          "border border-border bg-card text-foreground hover:bg-muted active:bg-muted/80",
        ghost:
          "text-foreground hover:bg-muted active:bg-muted/80",
        danger:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: LucideIcon;
  "aria-label": string;
  loading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      icon: Icon,
      loading = false,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(iconButtonVariants({ variant, className }))}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <Icon className="size-5" aria-hidden />
        )}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
