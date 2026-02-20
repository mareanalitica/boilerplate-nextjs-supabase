# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Declare build-time args (NEXT_PUBLIC_* must be available during next build)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Force development during install so devDependencies are included (Next.js, TypeScript, etc.)
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies needed for next build)
RUN npm ci

# Copy source code
COPY . .

# Build the application (NODE_ENV will be set to production in the runtime stage)
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy built application from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]
