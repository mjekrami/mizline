# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/kds/package.json apps/kds/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:3003
ARG NEXT_PUBLIC_KITCHEN_STORE_ID=
ARG NEXT_PUBLIC_STAFF_PATH=
ARG NEXT_PUBLIC_CUSTOMER_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_KITCHEN_STORE_ID=$NEXT_PUBLIC_KITCHEN_STORE_ID
ENV NEXT_PUBLIC_STAFF_PATH=$NEXT_PUBLIC_STAFF_PATH
ENV NEXT_PUBLIC_CUSTOMER_URL=$NEXT_PUBLIC_CUSTOMER_URL

COPY packages/shared packages/shared
COPY apps/kds apps/kds
RUN pnpm --filter @mizline/kds build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 mizline

COPY --from=build /app/apps/kds/public ./apps/kds/public
COPY --from=build /app/apps/kds/.next/standalone ./
COPY --from=build /app/apps/kds/.next/static ./apps/kds/.next/static

USER mizline
EXPOSE 3000
CMD ["node", "apps/kds/server.js"]
