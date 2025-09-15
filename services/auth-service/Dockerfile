# Auth Service Dockerfile
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files and workspace configuration
COPY services/auth-service/package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy workspace packages
COPY packages/ ./packages/

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm install --prod


# Build packages first
RUN pnpm --filter "@workspace/*" build

# Build the auth service
RUN pnpm --filter "@services/auth-service" build

COPY services/auth-service/dist ./dist

# Production stage
FROM node:20-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/pnpm-workspace.yaml ./

# Copy built packages
COPY --from=base --chown=nodejs:nodejs /app/packages/ ./packages/

# Switch to nodejs user
USER nodejs

# Expose port
EXPOSE 6001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:6001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]
