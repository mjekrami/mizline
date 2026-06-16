export type WaitUrgency = "normal" | "warning" | "critical";

export interface WaitUrgencyThresholds {
  warningMinutes: number;
  criticalMinutes: number;
}

export function getWaitUrgency(
  createdAt: string | Date,
  now: number,
  thresholds: WaitUrgencyThresholds,
): WaitUrgency {
  const createdMs =
    typeof createdAt === "string"
      ? new Date(createdAt).getTime()
      : createdAt.getTime();
  const minutes = (now - createdMs) / 60_000;

  if (minutes >= thresholds.criticalMinutes) return "critical";
  if (minutes >= thresholds.warningMinutes) return "warning";
  return "normal";
}
