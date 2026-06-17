"use client";

import {
  MIZLINE_WORDMARK,
  mizlineWordmarkSplashClassName,
} from "@mizline/shared";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { markSplashSeen } from "@/lib/splash-storage";
import { cn } from "@/lib/utils";

const BRAND_LETTERS = [...MIZLINE_WORDMARK];
const LETTER_STAGGER_MS = 75;
const ENTRANCE_MS = MIZLINE_WORDMARK.length * LETTER_STAGGER_MS + 650;
const HOLD_MS = 900;
const EXIT_MS = 500;

interface SplashScreenProps {
  storeId: string;
  tableId: string;
  onContinue: () => void;
}

export function SplashScreen({
  storeId,
  tableId,
  onContinue,
}: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  const finishSplash = useCallback(() => {
    markSplashSeen(storeId, tableId);
    onContinue();
  }, [storeId, tableId, onContinue]);

  useEffect(() => {
    const exitTimer = window.setTimeout(
      () => setExiting(true),
      ENTRANCE_MS + HOLD_MS,
    );
    const doneTimer = window.setTimeout(
      finishSplash,
      ENTRANCE_MS + HOLD_MS + EXIT_MS,
    );

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [finishSplash]);

  return (
    <button
      type="button"
      className={cn(
        "customer-splash fixed inset-0 z-50 flex items-center justify-center",
        exiting && "customer-splash--exit",
      )}
      style={{ "--customer-splash-exit-ms": `${EXIT_MS}ms` } as CSSProperties}
      onClick={finishSplash}
      aria-label="Continue to menu"
    >
      <span className="customer-splash__glow" aria-hidden />
      <span className="customer-splash__ring" aria-hidden />
      <span
        className={cn("customer-splash__logo", mizlineWordmarkSplashClassName)}
        aria-hidden
      >
        {BRAND_LETTERS.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="customer-splash__letter"
            style={{ animationDelay: `${index * LETTER_STAGGER_MS}ms` }}
          >
            {letter}
          </span>
        ))}
      </span>
      <span className="sr-only">{MIZLINE_WORDMARK}</span>
    </button>
  );
}
