# SCAFFOLD.md — Scaffolding & Code Generation Guide

> **Purpose:** A step-by-step guide for bootstrapping the Trust-Bound codebase from zero to a fully wired prototype. This document doubles as a runbook for AI-assisted code generation — feed this file to Claude Code or Cursor to get working, project-consistent code.

---

## 1. Bootstrap Order

Scaffolding must happen in dependency order. Generating the frontend before the backend types exist leads to import errors and API mismatches. Follow this sequence precisely:

**Phase A — Foundation:** Initialize monorepo structure, install root tooling (ESLint, Prettier, Husky, lint-staged), set up the Docker Compose network, and create the PostgreSQL database and Prisma schema.

**Phase B — Backend Core:** Generate the Express app skeleton, wire up middleware (auth, error handler, rate limiter), implement the Prisma client singleton, and run the first migration.

**Phase C — Backend Features:** Scaffold each feature module in order: Auth → Projects → Milestones → Escrow Wallet → Disputes → Invoices → AI Features. Each module follows the same internal structure.

**Phase D — Frontend Shell:** Initialize the React + Vite + TypeScript app, configure Tailwind + shadcn/ui, set up React Router, Zustand, and React Query.

**Phase E — Frontend Features:** Build pages and components in the same order as the backend features — Auth → Dashboard → Project Wizard → Project Detail → Dispute Chat → Invoice.

**Phase F — Integration & Polish:** Connect the frontend to the backend, implement Socket.io real-time updates, add loading/error states everywhere, and run the full test suite.

---

## 2. Repository Init Commands

```bash
# Root project structure
mkdir trust-bound && cd trust-bound
git init
mkdir backend frontend docs

# Root-level tooling
cat > .gitignore << 'EOF'
node_modules/
.env
*.env.local
dist/
coverage/
.DS_Store
EOF

# Initialize each workspace
cd backend && npm init -y
cd ../frontend && npm init -y
cd ..
```

---

## 3. Backend Scaffolding

### 3.1 Install Dependencies

```bash
cd backend

# Core runtime dependencies
npm install express cors helmet morgan express-rate-limit
npm install @prisma/client jsonwebtoken bcryptjs zod
npm install socket.io nodemailer puppeteer
npm install @google/generative-ai

# Development dependencies
npm install -D typescript ts-node nodemon jest ts-jest supertest
npm install -D @types/express @types/node @types/jsonwebtoken
npm install -D @types/bcryptjs @types/nodemailer @types/jest @types/supertest
npm install -D prisma
```

### 3.2 TypeScript Configuration

```json
// backend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"]        // Path alias for cleaner imports
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3.3 Express App Skeleton

```typescript
// src/app.ts — The Express application factory
// This is separate from src/index.ts (which starts the server)
// so tests can import the app without starting the HTTP server.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { projectsRouter } from "./routes/projects";
import { milestonesRouter } from "./routes/milestones";
import { escrowRouter } from "./routes/escrow";
import { disputesRouter } from "./routes/disputes";
import { invoicesRouter } from "./routes/invoices";
import { aiRouter } from "./routes/ai";

export function createApp() {
  const app = express();

  // Security headers (Helmet sets sane defaults like HSTS, XSS protection)
  app.use(helmet());

  // CORS — only allow requests from our frontend
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,            // Allow cookies/auth headers
  }));

  // Request body parsing (10kb limit prevents oversized payload attacks)
  app.use(express.json({ limit: "10kb" }));

  // Request logging (use 'combined' format in production for Apache-style logs)
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  // Global rate limiter (100 requests per 15 minutes per IP)
  // Individual endpoints have stricter limits applied in their route files
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Too many requests, please try again later." },
  }));

  // Health check (no auth required — used by Docker and Render.com)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Feature routers
  app.use("/api/auth", authRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/milestones", milestonesRouter);
  app.use("/api/escrow", escrowRouter);
  app.use("/api/disputes", disputesRouter);
  app.use("/api/invoices", invoicesRouter);
  app.use("/api/ai", aiRouter);

  // Global error handler — MUST be last middleware
  app.use(errorHandler);

  return app;
}
```

### 3.4 Standard Route Module Template

Every backend resource follows this exact pattern. When asking an AI agent to generate a new route, provide this template as context:

```typescript
// src/routes/[resource].ts — Template for any new resource

import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import * as controller from "../controllers/[resource]Controller";

export const [resource]Router = Router();

// Define Zod schema for request body validation
const createSchema = z.object({
  // ... fields
});

// All sensitive routes require authentication
[resource]Router.use(authenticate);

// GET /api/[resource] — List resources owned by the authenticated user
[resource]Router.get("/", asyncHandler(controller.list));

// GET /api/[resource]/:id — Get a single resource (with ownership check)
[resource]Router.get("/:id", asyncHandler(controller.getById));

// POST /api/[resource] — Create a new resource
[resource]Router.post("/", validateBody(createSchema), asyncHandler(controller.create));

// PATCH /api/[resource]/:id — Update a resource
[resource]Router.patch("/:id", asyncHandler(controller.update));

// DELETE /api/[resource]/:id — Soft delete (set deletedAt timestamp)
[resource]Router.delete("/:id", asyncHandler(controller.remove));
```

---

## 4. Frontend Scaffolding

### 4.1 Init and Install

```bash
cd frontend

# Scaffold a Vite + React + TypeScript project
npm create vite@latest . -- --template react-ts

# Core dependencies
npm install react-router-dom @tanstack/react-query zustand
npm install axios socket.io-client
npm install class-variance-authority clsx tailwind-merge

# shadcn/ui (run init, then add components as needed)
npx shadcn-ui@latest init

# Add the shadcn components needed for the prototype
npx shadcn-ui@latest add button card badge dialog
npx shadcn-ui@latest add input textarea label
npx shadcn-ui@latest add tabs progress toast
```

### 4.2 Axios API Client

```typescript
// src/api/client.ts — Centralized Axios instance
// All API calls go through this; token injection happens here automatically.

import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  headers: { "Content-Type": "application/json" },
});

// Intercept every request to inject the current JWT
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to handle 401 (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 4.3 React Query Custom Hook Template

```typescript
// src/api/useProject.ts — Example React Query hook for the Project resource

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Project, CreateProjectInput } from "@/types/project";

// Fetch a single project by ID
export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Project }>(`/projects/${projectId}`);
      return data.data;
    },
    enabled: !!projectId,           // Don't fetch if no ID provided
    staleTime: 30_000,              // Treat data as fresh for 30 seconds
  });
}

// Create a new project (mutation with cache invalidation)
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const { data } = await apiClient.post<{ data: Project }>("/projects", input);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate the projects list so the new project appears immediately
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

### 4.4 Zustand Auth Store

```typescript
// src/stores/authStore.ts — Global auth state with persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "trust-bound-auth",    // localStorage key
      partialize: (state) => ({    // Only persist token and user, not functions
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

## 5. AI-Assisted Code Generation Protocol

When using Claude Code or Cursor to generate new feature code, always provide these context files in this order to get the most accurate output:

1. `AGENTS.md` — Architecture rules, folder structure, import conventions.
2. `SCHEMA.md` — Database models the generated code will interact with.
3. `TDD.md` — Testing conventions so tests are generated alongside code.
4. The specific section of `PRD.md` describing the feature.

Example prompt pattern for generating a new feature:

> "Using the architecture in AGENTS.md and the database models in SCHEMA.md, implement the `POST /api/disputes` endpoint that creates a new dispute for a milestone. Write the route, controller, and Zod validation schema. Then write the Jest test as described in TDD.md Section 3.1, covering the happy path, wrong role, and unauthenticated cases."

This prompt pattern consistently produces code that integrates without conflicts because the model has the full project context, not just a partial requirement.

---

## 6. Package Scripts Reference

```json
// Root package.json (if using npm workspaces)
{
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=backend\" \"npm run dev --workspace=frontend\"",
    "build": "npm run build --workspace=backend && npm run build --workspace=frontend",
    "test": "npm run test --workspace=backend && npm run test --workspace=frontend",
    "docker:up": "docker compose up --build",
    "docker:down": "docker compose down -v",
    "db:migrate": "npm run prisma migrate dev --workspace=backend",
    "db:seed": "npm run prisma db seed --workspace=backend",
    "db:studio": "npm run prisma studio --workspace=backend"
  }
}
```

---

*This scaffold guide, combined with AGENTS.md, gives any AI coding assistant everything it needs to generate working, consistent, integration-ready code for Trust-Bound without manual correction.*