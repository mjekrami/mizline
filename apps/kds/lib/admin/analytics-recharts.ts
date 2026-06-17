export const ANALYTICS_CHART_MARGIN = {
  top: 8,
  right: 8,
  left: 0,
  bottom: 0,
} as const;

export const analyticsAxisTickStyle = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
} as const;

export const analyticsGridStroke = "color-mix(in srgb, var(--border) 70%, transparent)";

export const analyticsAccentStroke = "var(--accent)";

export const analyticsDotProps = {
  r: 4,
  fill: "var(--background)",
  stroke: "var(--accent)",
  strokeWidth: 2,
} as const;
