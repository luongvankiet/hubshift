# API Gateway Dockerfile
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy root package files for workspace setup
COPY services/api-gateway/package.json ./
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy workspace packages
COPY packages/ ./packages/

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Install dependencies
RUN pnpm install --prod

# Build packages first
RUN pnpm --filter "@workspace/*" build

# Build the api-gateway service
RUN pnpm --filter "@services/api-gateway" build

# Copy the api-gateway service
COPY services/api-gateway/dist ./dist

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
EXPOSE 8080

CMD ["node", "dist/index.js"]
