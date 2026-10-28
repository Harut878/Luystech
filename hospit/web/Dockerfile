# syntax=docker/dockerfile:1
# HospIT website — production image (Next.js standalone server + PostgreSQL)
#
#   docker compose up -d --build          (reads ./.env — see README.md)
#
# Nothing secret is baked into the image: DATABASE_URL etc. are read at RUNTIME.
# On every start the container runs db/schema.sql + db/seed.sql (idempotent, never overwrites
# existing content) and, if ADMIN_EMAIL/ADMIN_PASSWORD are set and no admin exists yet, creates one.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# DB maintenance scripts (they use the "pg" package already present in the standalone node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/scripts/_env.mjs /app/scripts/db-setup.mjs /app/scripts/create-admin.mjs /app/scripts/import-supabase.mjs ./scripts/
USER nextjs
EXPOSE 3000
CMD ["sh", "-c", "node scripts/db-setup.mjs && node scripts/create-admin.mjs --if-missing && exec node server.js"]
