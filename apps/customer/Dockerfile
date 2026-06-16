# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/customer/package.json apps/customer/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:3003
ARG NEXT_PUBLIC_DEMO_STORE_ID=
ARG NEXT_PUBLIC_DEMO_TABLE_ID=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DEMO_STORE_ID=$NEXT_PUBLIC_DEMO_STORE_ID
ENV NEXT_PUBLIC_DEMO_TABLE_ID=$NEXT_PUBLIC_DEMO_TABLE_ID

COPY packages/shared packages/shared
COPY apps/customer apps/customer
RUN pnpm --filter @mizline/customer build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 mizline

COPY --from=build /app/apps/customer/public ./apps/customer/public
COPY --from=build /app/apps/customer/.next/standalone ./
COPY --from=build /app/apps/customer/.next/static ./apps/customer/.next/static

USER mizline
EXPOSE 3001
CMD ["node", "apps/customer/server.js"]
