# ==========================================
# Multi-stage Dockerfile for Next.js 16 (Standalone)
# Base: Debian Bookworm Slim for 100% glibc & native package compatibility
# ==========================================

FROM node:22-bookworm-slim AS base
WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Use --legacy-peer-deps to avoid React 19 peer dependency conflicts
RUN npm install --legacy-peer-deps --ignore-scripts

# Stage 2: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Pass build-time environment variables for Next.js client bundling
ARG NEXT_PUBLIC_SUPABASE_URL=https://aglfqnppqnhdbrugupjg.supabase.co
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_qhbL3kQU4nTpZZW7VfjDgA_lGS8SOvf
ARG NEXT_PUBLIC_BOT_API_URL=http://localhost:3001

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_BOT_API_URL=$NEXT_PUBLIC_BOT_API_URL

RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

# Copy static assets and public files
COPY --from=builder /app/public ./public

# Setup permission for Next.js cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
