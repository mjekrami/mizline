"use client";

import { Volume2, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffLiveControlsProps {
  connected: boolean;
  audioEnabled: boolean;
  onEnableAudio: () => void;
  className?: string;
}

export function StaffLiveControls({
  connected,
  audioEnabled,
  onEnableAudio,
  className,
}: StaffLiveControlsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
          connected
            ? "border-success/30 bg-success/10 text-success"
            : "border-error/30 bg-error/10 text-error",
        )}
      >
        {connected ? (
          <Wifi className="size-3" />
        ) : (
          <WifiOff className="size-3" />
        )}
        {connected ? "Live" : "Offline"}
      </span>

      {!audioEnabled ? (
        <button
          type="button"
          onClick={onEnableAudio}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
        >
          <Volume2 className="size-4" />
          Enable alerts
        </button>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Volume2 className="size-3.5" />
          Alerts on
        </span>
      )}
    </div>
  );
}
