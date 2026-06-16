"use client";

import { ArrowRight } from "lucide-react";
import { markSplashSeen } from "@/lib/splash-storage";

const SPLASH_HERO_IMAGE =
  "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80";

interface SplashScreenProps {
  storeId: string;
  tableId: string;
  storeName: string;
  onContinue: () => void;
}

function splitStoreName(name: string): { primary: string; secondary: string } {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) {
    return { primary: name, secondary: "" };
  }

  const midpoint = Math.ceil(words.length / 2);
  return {
    primary: words.slice(0, midpoint).join(" "),
    secondary: words.slice(midpoint).join(" "),
  };
}

export function SplashScreen({
  storeId,
  tableId,
  storeName,
  onContinue,
}: SplashScreenProps) {
  const { primary, secondary } = splitStoreName(storeName);

  function handleContinue() {
    markSplashSeen(storeId, tableId);
    onContinue();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element -- external hero */}
      <img
        src={SPLASH_HERO_IMAGE}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: "var(--customer-splash-gradient)" }}
      />

      <div className="relative flex flex-1 flex-col px-6 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="customer-brand-badge rounded-full px-4 py-2 text-sm font-extrabold tracking-tight">
              {primary}
            </span>
            {secondary ? (
              <span className="text-lg font-light text-white/90">{secondary}</span>
            ) : null}
          </div>
          <h1 className="text-4xl font-extrabold leading-none tracking-tight text-white">
            Taste Coffee
          </h1>
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="customer-floating-label absolute left-3 top-[38%] -rotate-90 rounded-full px-4 py-2 text-xs font-semibold tracking-wide">
            Amazing
          </span>
          <span className="customer-floating-label absolute right-4 top-[32%] rounded-full px-4 py-2 text-xs font-semibold tracking-wide">
            Fantastic
          </span>
          <span className="customer-floating-label absolute bottom-[28%] left-6 rounded-full px-4 py-2 text-xs font-semibold tracking-wide">
            Perfect
          </span>
        </div>

        <div className="mt-auto flex justify-center pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            onClick={handleContinue}
            className="customer-splash-cta flex items-center gap-3 rounded-full py-3.5 pl-6 pr-2 text-base font-bold transition-transform active:scale-[0.98]"
          >
            Get Started
            <span className="customer-splash-cta-icon flex size-10 items-center justify-center rounded-full">
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
