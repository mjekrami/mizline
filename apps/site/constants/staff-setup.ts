export const STAFF_SETUP_INSTRUCTIONS = `cp apps/site/.env.example apps/site/.env.local
# Set NEXT_PUBLIC_KITCHEN_STORE_ID from prisma db seed output
# Set KITCHEN_DEV_TOKEN to match apps/api/.env
# Staff dashboard: /{NEXT_PUBLIC_STAFF_PATH}/kitchen and /{NEXT_PUBLIC_STAFF_PATH}/admin`;

export const STAFF_SETUP_MESSAGES = {
  missingStoreId:
    "Set NEXT_PUBLIC_KITCHEN_STORE_ID in apps/site/.env.local to the demo store ID printed by prisma db seed.",
  missingDevToken:
    "Set KITCHEN_DEV_TOKEN in apps/site/.env.local to match apps/api/.env.",
  kitchenLoadFailed: "Could not load the kitchen board. Is the API running?",
  adminLoadFailed: "Could not load the admin dashboard. Is the API running?",
} as const;

export const DEFAULT_CUSTOMER_BASE_URL = "";
