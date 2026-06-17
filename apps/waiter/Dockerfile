# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/waiter/package.json apps/waiter/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:3003
ARG NEXT_PUBLIC_KITCHEN_STORE_ID=
ARG NEXT_PUBLIC_STAFF_PATH=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_KITCHEN_STORE_ID=$NEXT_PUBLIC_KITCHEN_STORE_ID
ENV NEXT_PUBLIC_STAFF_PATH=$NEXT_PUBLIC_STAFF_PATH

COPY packages/shared packages/shared
COPY apps/waiter apps/waiter
RUN pnpm --filter @mizline/waiter build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 mizline

COPY --from=build /app/apps/waiter/public ./apps/waiter/public
COPY --from=build /app/apps/waiter/.next/standalone ./
COPY --from=build /app/apps/waiter/.next/static ./apps/waiter/.next/static

USER mizline
EXPOSE 3002
CMD ["node", "apps/waiter/server.js"]
