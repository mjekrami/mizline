# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/kitchen/package.json apps/kitchen/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:3003
ARG NEXT_PUBLIC_CUSTOMER_URL=http://localhost:3000
ARG NEXT_PUBLIC_KITCHEN_STORE_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CUSTOMER_URL=$NEXT_PUBLIC_CUSTOMER_URL
ENV NEXT_PUBLIC_KITCHEN_STORE_ID=$NEXT_PUBLIC_KITCHEN_STORE_ID

COPY packages/shared packages/shared
COPY apps/kitchen apps/kitchen
RUN pnpm --filter @mizline/staff build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 mizline

COPY --from=build /app/apps/kitchen/public ./apps/kitchen/public
COPY --from=build /app/apps/kitchen/.next/standalone ./
COPY --from=build /app/apps/kitchen/.next/static ./apps/kitchen/.next/static

USER mizline
EXPOSE 3001
CMD ["node", "apps/kitchen/server.js"]
