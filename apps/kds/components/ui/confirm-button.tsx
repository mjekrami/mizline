"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmButtonProps extends Omit<ButtonProps, "onClick" | "variant"> {
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  cancelMs?: number;
}

export function ConfirmButton({
  confirmLabel = "Tap to confirm",
  onConfirm,
  cancelMs = 4000,
  children,
  className,
  disabled,
  size = "md",
  ...props
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        setConfirming(false);
        timerRef.current = null;
      }, cancelMs);
      return;
    }

    clearTimer();
    setConfirming(false);
    void onConfirm();
  };

  return (
    <Button
      type="button"
      variant={confirming ? "danger" : "secondary"}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      onBlur={() => {
        if (confirming) {
          clearTimer();
          setConfirming(false);
        }
      }}
      className={cn(className)}
      {...props}
    >
      {confirming ? confirmLabel : children}
    </Button>
  );
}
