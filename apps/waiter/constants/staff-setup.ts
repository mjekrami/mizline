export const STAFF_SETUP_INSTRUCTIONS = `cp apps/waiter/.env.example apps/waiter/.env.local
# Set NEXT_PUBLIC_KITCHEN_STORE_ID from prisma db seed output
# Set KITCHEN_DEV_TOKEN to match apps/api/.env
# Restart dev servers after changing .env.local
# Waiter app: /{NEXT_PUBLIC_STAFF_PATH} and /{NEXT_PUBLIC_STAFF_PATH}/login
# Sign in with a waiter-role user (seed prints emails; password: demo1234)`;

export const STAFF_SETUP_MESSAGES = {
  missingStoreId:
    "Set NEXT_PUBLIC_KITCHEN_STORE_ID in apps/waiter/.env.local to the demo store ID printed by prisma db seed.",
  loadFailed: "Could not load the waiter board. Is the API running?",
} as const;
