export const STAFF_SETUP_INSTRUCTIONS = `cp apps/kitchen/.env.example apps/kitchen/.env.local
# Set NEXT_PUBLIC_KITCHEN_STORE_ID from prisma db seed output
# Set KITCHEN_DEV_TOKEN to match apps/api/.env`;

export const STAFF_SETUP_MESSAGES = {
  missingStoreId:
    "Set NEXT_PUBLIC_KITCHEN_STORE_ID in apps/kitchen/.env.local to the demo store ID printed by prisma db seed.",
  missingDevToken:
    "Set KITCHEN_DEV_TOKEN in apps/kitchen/.env.local to match apps/api/.env.",
  adminLoadFailed: "Failed to load admin dashboard",
  kitchenLoadFailed: "Failed to load kitchen board",
} as const;

export const DEFAULT_CUSTOMER_BASE_URL = "http://localhost:3000";
