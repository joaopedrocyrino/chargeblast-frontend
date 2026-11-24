# syntax=docker/dockerfile:1.7
# Multi-stage build for the Chargeblast dashboard (Next.js + @chargeblast/ui workspace).
#   dev      – `next dev` with the source bind-mounted (used by chargeblast-infra/compose.yaml)
#   runtime  – minimal production image using Next's standalone output

ARG NODE_VERSION=24.11-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false NPM_CONFIG_FUND=false NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
# The workspace manifest must exist before `npm ci` so the @chargeblast/ui link is created.
COPY package.json package-lock.json ./
COPY packages/ui/package.json ./packages/ui/package.json
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npx", "next", "dev", "-p", "3000", "-H", "0.0.0.0"]

FROM deps AS build
# Public URL the browser uses for the API (inlined into the client bundle).
# Empty = same-origin `/api/v1`, proxied to BACKEND_INTERNAL_URL by next.config.ts.
ARG NEXT_PUBLIC_API_URL=
ARG BACKEND_INTERNAL_URL=http://backend:4000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL} NODE_ENV=production
COPY . .
RUN npm run build

FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/payments').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
