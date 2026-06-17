const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

export function getCorsOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGINS;
  if (!fromEnv) {
    return DEFAULT_CORS_ORIGINS;
  }

  return fromEnv
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
