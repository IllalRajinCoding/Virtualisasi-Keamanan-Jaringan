FROM node:20-alpine

LABEL maintainer="VDKJ Kelompok"
LABEL app="employee-portal"
LABEL version="1.0.0"

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev && \
    npm cache clean --force

COPY src/ ./src/
COPY views/ ./views/
COPY public/ ./public/

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=5s \
            --retries=3 \
CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node","src/index.js"]
