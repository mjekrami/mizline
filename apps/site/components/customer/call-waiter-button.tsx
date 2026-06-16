"use client";

import { WAITER_BUZZ_COOLDOWN_SECONDS } from "@mizline/shared";
import { BellRing, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { callWaiter } from "@/lib/api/customer";
import { cn } from "@/lib/utils";

interface CallWaiterButtonProps {
  storeId: string;
  tableId: string;
  className?: string;
}

export function CallWaiterButton({
  storeId,
  tableId,
  className,
}: CallWaiterButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const handleCall = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await callWaiter(storeId, tableId);
      setMessage("Waiter notified");
      setCooldownSeconds(WAITER_BUZZ_COOLDOWN_SECONDS);
      setConfirming(false);
    } catch (callError) {
      if (callError instanceof Error) {
        try {
          const parsed = JSON.parse(callError.message) as {
            message?: string;
            retryAfterSeconds?: number;
          };
          if (parsed.retryAfterSeconds) {
            setCooldownSeconds(parsed.retryAfterSeconds);
          }
          setError(parsed.message ?? callError.message);
        } catch {
          setError(callError.message);
        }
      } else {
        setError("Could not reach a waiter");
      }
    } finally {
      setLoading(false);
    }
  }, [storeId, tableId]);

  const disabled = loading || cooldownSeconds > 0;

  return (
    <div
      className={cn(
        "fixed inset-x-4 bottom-24 z-40 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4",
        className,
      )}
    >
      {message ? (
        <p className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-success shadow-sm">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="max-w-xs rounded-2xl bg-card px-3 py-2 text-xs text-error shadow-sm">
          {error}
        </p>
      ) : null}

      {confirming ? (
        <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1 shadow-lg">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => void handleCall()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirm
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <BellRing className="size-4" />
          )}
          {cooldownSeconds > 0
            ? `Wait ${cooldownSeconds}s`
            : "Call waiter"}
        </button>
      )}
    </div>
  );
}
