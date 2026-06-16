export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatOrderNumber(orderId: string): string {
  return orderId.slice(-6).toUpperCase();
}

export function formatWaitTime(createdAt: string, now = Date.now()): string {
  const elapsedMs = Math.max(0, now - new Date(createdAt).getTime());
  const totalMinutes = Math.floor(elapsedMs / 60_000);

  if (totalMinutes < 1) return "< 1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatPrepTime(seconds: number | null): string {
  if (seconds === null) return "—";

  const totalMinutes = Math.round(seconds / 60);

  if (totalMinutes < 1) return "< 1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatTimeOfDay(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatRelativeTime(timestamp: string, now = Date.now()): string {
  const elapsedMs = Math.max(0, now - new Date(timestamp).getTime());
  const totalSeconds = Math.floor(elapsedMs / 1000);

  if (totalSeconds < 60) return "just now";

  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}m ago`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    return `${totalHours}h ago`;
  }

  const totalDays = Math.floor(totalHours / 24);
  return `${totalDays}d ago`;
}
