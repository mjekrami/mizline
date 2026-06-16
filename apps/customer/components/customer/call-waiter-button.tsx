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
      setMessage("Waiter notified — they'll be with you shortly.");
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
    <div className={cn("flex flex-col gap-2", className)}>
      {message ? (
        <p className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {confirming ? (
        <div className="customer-call-waiter-confirm px-4 py-4">
          <p className="text-sm font-semibold">Call a waiter to your table?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Someone from the floor will be notified right away.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="customer-nav-link flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => void handleCall()}
              className="customer-btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="customer-nav-link customer-call-waiter py-3"
        >
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin" />
          ) : (
            <BellRing className="size-4 shrink-0" />
          )}
          <span>
            {cooldownSeconds > 0
              ? `Call again in ${cooldownSeconds}s`
              : "Call waiter"}
          </span>
        </button>
      )}
    </div>
  );
}
