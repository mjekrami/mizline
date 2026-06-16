# Mizline API

NestJS backend for the Mizline vertical slice (ordering + kitchen realtime).

## Prerequisites

- Node.js 20+
- pnpm
- Docker (for PostgreSQL and Redis)

## Local setup

```bash
# From repo root
docker compose up -d

# Copy env and adjust if needed
cp apps/api/.env.example apps/api/.env

# Install dependencies
pnpm install

# Run migrations and seed demo data
pnpm --filter @mizline/api prisma:migrate
pnpm --filter @mizline/api exec prisma db seed

# Start API (port 3003)
pnpm dev:api
```

# Demo seed IDs

After running `pnpm exec prisma db seed`, the script prints tenant, store, and table IDs. Example:

```
Store:  cmqeaokbt0002ughaj681elcs
Table:  cmqeaokbv0004ughaa9lhlpcf — Table 1 (demo-table-1)
```

Use the printed store/table IDs in API calls below.

## Endpoints

### Public (customer)

- `GET /api/health` — health + DB ping
- `GET /api/stores/:storeId` — store info
- `GET /api/stores/:storeId/menu` — menu
- `GET /api/stores/:storeId/menu/popular?limit=8` — most ordered items
- `POST /api/stores/:storeId/tables/:tableId/orders` — submit order
- `GET /api/orders/:orderId` — order tracking

### Kitchen (temporary dev auth)

Send header `x-kitchen-dev-token: <KITCHEN_DEV_TOKEN>`:

- `GET /api/stores/:storeId/orders?status=new,preparing,ready`
- `PATCH /api/orders/:orderId/status` — body `{ "status": "preparing" | "ready" | "fulfilled" }`

### Admin (temporary dev auth)

Same `x-kitchen-dev-token` header until JWT auth lands:

- `GET /api/stores/:storeId/admin/catalog` — categories + products (includes unavailable)
- `GET /api/stores/:storeId/admin/tables`
- `POST /api/stores/:storeId/admin/categories` — body `{ "name": "..." }`
- `PATCH /api/stores/:storeId/admin/categories/:categoryId`
- `DELETE /api/stores/:storeId/admin/categories/:categoryId`
- `POST /api/stores/:storeId/admin/products` — body `{ "categoryId", "name", "price", ... }`
- `PATCH /api/stores/:storeId/admin/products/:productId`
- `DELETE /api/stores/:storeId/admin/products/:productId`
- `POST /api/stores/:storeId/admin/tables` — body `{ "name", "qrCode" }`
- `PATCH /api/stores/:storeId/admin/tables/:tableId`

## Socket.IO

Connect to namespace `/realtime`:

- Pass `storeId` in handshake query to join `store:{storeId}` room
- Emit `joinOrder` with `{ orderId }` to track a specific order

Events: `order.created`, `order.preparing`, `order.ready`, `order.fulfilled`

## Notes

- Kitchen dev token auth is temporary until JWT + role guards land in Phase 2.
- Redis is included in Docker Compose for future BullMQ / Socket.IO scaling; not required for local single-instance dev.
