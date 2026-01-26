# Production-Ready Multi-Stage Dockerfile for SyncNexa Identity System
# Optimized for security, size, and performance

# ==========================================
# Stage 1: Builder - Compile TypeScript
# ==========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
# python3, make, g++ needed for native modules like bcrypt
RUN apk add --no-cache python3 make g++

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --include=dev

# Copy source code and configuration
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to JavaScript
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --production

# ==========================================
# Stage 2: Production - Lightweight Runtime
# ==========================================
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy migrations, docs, and startup script
COPY --chown=nodejs:nodejs migrations ./migrations
COPY --chown=nodejs:nodejs docs ./docs
COPY --chown=nodejs:nodejs start.sh ./start.sh

# Create necessary directories with proper permissions
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs logs uploads && \
    chmod +x start.sh

# Switch to non-root user
USER nodejs

# Expose application port (CloudRun uses 8080)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Set environment to production
ENV NODE_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with migrations
CMD ["sh", "start.sh"]
