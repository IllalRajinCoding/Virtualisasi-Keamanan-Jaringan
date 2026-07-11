FROM node:20-alpine

LABEL maintainer="VDKJ Kelompok"
LABEL app="product-store"
LABEL version="1.0.0"

# Security: Buat non-root user (wajib per modul)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files dulu untuk layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/    ./src/
COPY views/  ./views/
COPY public/ ./public/

# Set ownership ke non-root user
RUN chown -R appuser:appgroup /app

# Switch ke non-root user
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
