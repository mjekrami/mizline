# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/site/package.json apps/site/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:3003
ARG NEXT_PUBLIC_DEMO_STORE_ID=
ARG NEXT_PUBLIC_DEMO_TABLE_ID=
ARG NEXT_PUBLIC_KITCHEN_STORE_ID=
ARG NEXT_PUBLIC_STAFF_PATH=
ARG NEXT_PUBLIC_SITE_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DEMO_STORE_ID=$NEXT_PUBLIC_DEMO_STORE_ID
ENV NEXT_PUBLIC_DEMO_TABLE_ID=$NEXT_PUBLIC_DEMO_TABLE_ID
ENV NEXT_PUBLIC_KITCHEN_STORE_ID=$NEXT_PUBLIC_KITCHEN_STORE_ID
ENV NEXT_PUBLIC_STAFF_PATH=$NEXT_PUBLIC_STAFF_PATH
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

COPY packages/shared packages/shared
COPY apps/site apps/site
RUN pnpm --filter @mizline/site build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 mizline

COPY --from=build /app/apps/site/public ./apps/site/public
COPY --from=build /app/apps/site/.next/standalone ./
COPY --from=build /app/apps/site/.next/static ./apps/site/.next/static

USER mizline
EXPOSE 3000
CMD ["node", "apps/site/server.js"]
