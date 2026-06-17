"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      label,
      description,
      disabled = false,
      id: externalId,
      className,
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;

    return (
      <div className={cn("flex items-start justify-between gap-4", className)}>
        <div className="min-w-0 flex-1">
          <label
            id={labelId}
            htmlFor={id}
            className="block cursor-pointer text-base font-medium text-foreground"
          >
            {label}
          </label>
          {description ? (
            <p id={descriptionId} className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <button
          ref={ref}
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={labelId}
          aria-describedby={description ? descriptionId : undefined}
          disabled={disabled}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            "relative inline-flex h-12 w-[4.5rem] shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
            checked ? "bg-success" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block size-9 rounded-full bg-background shadow transition-transform",
              checked ? "translate-x-8" : "translate-x-1",
            )}
          />
        </button>
      </div>
    );
  },
);

Switch.displayName = "Switch";
