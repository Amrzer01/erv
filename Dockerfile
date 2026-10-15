# ==========================================
# Multi-stage Dockerfile for Next.js 16 (Standalone)
# ==========================================

# Base image with Node 22 Alpine
FROM node:22-alpine AS base

# Stage 1: Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Stage 2: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry disable
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Pass build-time environment variables for Next.js client bundling
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BOT_API_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_BOT_API_URL=$NEXT_PUBLIC_BOT_API_URL

# Build Next.js application
RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create unprivileged user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

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
