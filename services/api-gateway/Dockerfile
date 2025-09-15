# API Gateway Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy root package files for workspace setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy workspace packages
COPY packages/ ./packages/

# Copy the api-gateway service
COPY services/api-gateway/ ./services/api-gateway/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages first
RUN pnpm --filter "@workspace/*" build

# Build the api-gateway service
RUN pnpm --filter "@services/api-gateway" build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN corepack enable

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/pnpm-workspace.yaml ./

# Copy built packages
COPY --from=base --chown=nodejs:nodejs /app/packages/ ./packages/

# Copy built api-gateway service
COPY --from=base --chown=nodejs:nodejs /app/services/api-gateway/dist/ ./services/api-gateway/dist/
COPY --from=base --chown=nodejs:nodejs /app/services/api-gateway/package.json ./services/api-gateway/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Switch to nodejs user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "services/api-gateway/dist/index.js"]
