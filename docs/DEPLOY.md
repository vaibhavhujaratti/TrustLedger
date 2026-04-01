# DEPLOY.md — Docker & Cloud Deployment Guide

> **Purpose:** Complete containerization and deployment playbook for Trust-Bound. Covers local Docker Compose setup, production build strategy, and cloud deployment to Render.com. Written so that any team member can deploy from scratch in under 30 minutes.

---

## 1. Architecture Overview

The production deployment consists of four services that run as Docker containers:

The **frontend** is a Vite-built React app served via Nginx. The **backend** is a Node.js + Express API server. The **database** is PostgreSQL 15. The **Redis** instance is optional for the prototype (used for rate-limiting storage) but included for production-readiness. These four services communicate on a private Docker network and are exposed to the internet only through their defined ports.

```
Internet
    │
    ├──► Nginx (port 80/443)  ──►  React SPA (static files)
    │         │
    │         └──► /api/*     ──►  Express Backend (port 3001)
    │                                    │
    │                         ┌──────────┴──────────┐
    │                         ▼                     ▼
    │                    PostgreSQL           Redis (optional)
    │                    (port 5432)          (port 6379)
    │
    └─────────────────────────────── Private Docker Network
```

---

## 2. Environment Variables Reference

Create a `.env` file in the project root for local development. Never commit this file (it is in `.gitignore`). In production, these are set as environment variables in the cloud platform's dashboard.

```env
# ─── Backend ───────────────────────────────────
NODE_ENV=development          # or 'production'
PORT=3001
DATABASE_URL=postgresql://trustbound:trustbound_pass@db:5432/trust_bound
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=replace_with_64_char_random_string
JWT_REFRESH_SECRET=replace_with_another_64_char_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Gemini AI
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-1.5-flash

# Email (use Ethereal for development, Gmail SMTP for production)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass
EMAIL_FROM="Trust-Bound <no-reply@trustbound.dev>"

# CORS
FRONTEND_URL=http://localhost:5173

# ─── Frontend ─────────────────────────────────
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

---

## 3. Docker Configuration Files

### 3.1 Backend Dockerfile

```dockerfile
# backend/Dockerfile

# Stage 1 — Build: compile TypeScript to JavaScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false  # Include devDeps for TypeScript
COPY . .
RUN npm run build                   # Outputs to /app/dist

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
```

The two-stage build is critical: the builder stage installs dev dependencies and TypeScript, but the runner stage copies only the compiled JavaScript. This makes the production image roughly 5x smaller and eliminates attack surface from unused packages.

### 3.2 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile

# Stage 1 — Build: Vite production build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build    # Outputs to /app/dist (static HTML/JS/CSS)

# Stage 2 — Runtime: Nginx serves static files
FROM nginx:1.25-alpine AS runner

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config: enable gzip, handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 Nginx Config (SPA Routing)

This is the most commonly forgotten file when deploying React apps. Without it, refreshing a page at `/projects/abc123` returns a 404 from Nginx because that path is not a real file — React Router handles it client-side.

```nginx
# frontend/nginx.conf

server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression for text assets
    gzip on;
    gzip_types text/html text/css application/javascript application/json;

    # Cache static assets (JS, CSS, images) aggressively
    location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API calls to the backend container
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket proxying (for Socket.io)
    location /socket.io/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # SPA fallback: send all other routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3.4 Docker Compose (Local Development)

```yaml
# docker-compose.yml

version: "3.9"

services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: trustbound
      POSTGRES_PASSWORD: trustbound_pass
      POSTGRES_DB: trust_bound
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"       # Expose for local Prisma Studio / debugging
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U trustbound"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: .env
    environment:
      DATABASE_URL: postgresql://trustbound:trustbound_pass@db:5432/trust_bound
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy   # Wait for Postgres to be ready
      redis:
        condition: service_started
    volumes:
      - ./backend:/app               # Hot-reload in dev (override with dev compose)
      - /app/node_modules            # Prevent host node_modules from overwriting

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file: .env
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 3.5 Docker Compose Override (Development Hot-Reload)

```yaml
# docker-compose.override.yml (auto-merged with docker-compose.yml by Docker)

version: "3.9"

services:
  backend:
    command: npm run dev          # nodemon with ts-node for hot-reload
    environment:
      NODE_ENV: development

  frontend:
    build:
      target: builder            # Stop at build stage, don't use Nginx
    command: npm run dev         # Vite dev server with HMR
    ports:
      - "5173:5173"              # Vite's default port
```

This override pattern means `docker compose up` runs the full development environment with hot-reload, while `docker compose -f docker-compose.yml up` runs the production build.

---

## 4. Local Quick-Start

```bash
# 1. Clone the repo
git clone https://github.com/your-team/trust-bound && cd trust-bound

# 2. Copy example env and fill in your values (at minimum, the Gemini API key)
cp .env.example .env

# 3. Build and start all services
docker compose up --build

# 4. In a separate terminal, seed the database with demo data
docker compose exec backend npx prisma db seed

# 5. Open the app
open http://localhost:5173
```

After step 3, the app is fully running. Prisma migrations are automatically applied by the backend container's startup command. The seed data in step 4 creates two demo accounts: `client@demo.com / password123` and `freelancer@demo.com / password123`.

---

## 5. Cloud Deployment — Render.com

Render.com is chosen because it has a free tier that supports PostgreSQL, Node.js web services, and static site hosting simultaneously — making it ideal for a hackathon demo with no budget.

### 5.1 Setup Steps

First, create a PostgreSQL database on Render (free tier gives 90 days). Copy the "Internal Database URL" — this is used for the backend service's `DATABASE_URL` environment variable (internal URLs are faster than external ones within Render's network).

Second, create a new "Web Service" for the backend. Connect the GitHub repo, set the root directory to `backend/`, build command to `npm ci && npm run build && npx prisma migrate deploy`, and start command to `node dist/index.js`. Add all environment variables from the `.env` reference in Section 2. Set the instance type to "Free."

Third, create a "Static Site" for the frontend. Connect the same repo, set the root directory to `frontend/`, build command to `npm ci && npm run build`, publish directory to `dist`. Add the rewrite rule: source `/*`, destination `/index.html`, HTTP status 200 (this is Render's equivalent of the Nginx SPA fallback).

### 5.2 Continuous Deployment

After initial setup, every push to the `main` branch automatically triggers a redeploy. This means the demo URL is always live and current — useful for sharing with hackathon judges before the presentation.

---

## 6. Health Check Endpoint

The backend exposes a `/api/health` endpoint that returns system status. Render uses this to determine if the service is healthy and to route traffic accordingly.

```typescript
// The health endpoint checks DB connectivity and returns uptime
app.get("/api/health", async (req, res) => {
  const dbHealthy = await checkDatabaseConnection();
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
```

---

## 7. Database Backup (Hackathon Demo Safety)

Before the demo, export the seeded database state so it can be restored instantly if something goes wrong:

```bash
# Export (run this after seeding)
docker compose exec db pg_dump -U trustbound trust_bound > backup_demo_state.sql

# Restore (run this if the demo database gets corrupted)
docker compose exec -T db psql -U trustbound trust_bound < backup_demo_state.sql
```

This 60-second step has saved many hackathon demos.

---

*With this deployment setup, the Trust-Bound prototype can go from zero to a live, publicly accessible URL in under 30 minutes. This is the deployment standard for the hackathon.*