import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  connected: boolean;
  className?: string;
}

export function LiveIndicator({ connected, className }: LiveIndicatorProps) {
  return (
    <span
      role="status"
      aria-label={
        connected
          ? "Live — realtime updates connected"
          : "Offline — realtime updates disconnected"
      }
      className={cn(
        "inline-flex h-12 items-center gap-2 rounded-full border px-4 text-base font-medium",
        connected
          ? "border-success/30 bg-success/10 text-success"
          : "border-error/30 bg-error/10 text-error",
        className,
      )}
    >
      {connected ? (
        <>
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-success" />
          </span>
          <Wifi className="size-4" aria-hidden />
          Live
        </>
      ) : (
        <>
          <WifiOff className="size-4" aria-hidden />
          Offline
        </>
      )}
    </span>
  );
}
