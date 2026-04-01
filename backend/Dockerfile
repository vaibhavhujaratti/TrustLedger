# Stage 1 — Build: compile TypeScript to JavaScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — Runtime: lean production image with only compiled JS
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

# Entrypoint: run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
