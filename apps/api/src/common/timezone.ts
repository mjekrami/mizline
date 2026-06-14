function localTimeInZoneToUtc(
  ymd: string,
  hour: number,
  minute: number,
  second: number,
  ms: number,
  timeZone: string,
): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  let utc = Date.UTC(year, month - 1, day, hour, minute, second, ms);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    }).formatToParts(new Date(utc));

    const get = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value ?? 0);

    const targetMs = Date.UTC(year, month - 1, day, hour, minute, second, ms);
    const actualMs = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second"),
      0,
    );

    utc += targetMs - actualMs;
  }

  return new Date(utc);
}

export function getStoreDayBounds(timezone: string, reference = new Date()) {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);

  return {
    start: localTimeInZoneToUtc(ymd, 0, 0, 0, 0, timezone),
    end: localTimeInZoneToUtc(ymd, 23, 59, 59, 999, timezone),
  };
}
