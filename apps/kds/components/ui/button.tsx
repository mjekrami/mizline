"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
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
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
      },
      size: {
        sm: "h-10 min-h-10 px-3 text-sm",
        md: "h-12 min-h-12 px-4 text-base",
        lg: "h-14 min-h-14 px-5 text-lg",
        xl: "h-16 min-h-16 px-6 text-xl",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      icon: Icon,
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const iconSize =
      size === "xl" ? "size-6" : size === "sm" ? "size-4" : "size-5";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {loading ? (
          <Loader2 className={cn(iconSize, "shrink-0 animate-spin")} aria-hidden />
        ) : Icon ? (
          <Icon className={cn(iconSize, "shrink-0")} aria-hidden />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
