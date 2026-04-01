# TrustLedger - Freelance Escrow Platform

> Smart-contract-inspired milestone-based escrow for freelancers and clients. Clients deposit funds into milestone-locked digital wallets before work begins. Funds release only on mutual milestone approval.

## Features

- **Escrow System**: Secure milestone-based fund management with real-time wallet tracking
- **AI-Powered**: Gemini-powered milestone generation and dispute resolution
- **Real-time Chat**: Socket.io powered mediation channel for dispute resolution
- **Modern UI**: Production-ready React frontend with responsive design
- **Invoice Generation**: Automated PDF invoice generation upon project completion

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 15 + Prisma ORM |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| AI | Gemini 1.5 Flash |
| Deploy | Docker + Vercel |

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL, JWT secrets, and Gemini API key

# Start development servers
npm run dev

# Run tests
npm test
```

### Manual Backend Setup

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend Only

```bash
cd frontend
npm run dev
```

## 🏗️ Project Structure

```
trust-bound/
├── backend/                    # Express + Prisma + TypeScript API
│   ├── src/
│   │   ├── routes/             # Express routers (one per resource)
│   │   ├── controllers/        # Business logic
│   │   ├── services/           # External integrations (Gemini, email, PDF)
│   │   │   └── gemini/         # All Gemini API calls
│   │   ├── middleware/         # Auth, error handling, rate limiting
│   │   ├── lib/                # Prisma client, Socket.io, utilities
│   │   └── types/              # Shared TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # Auto-generated migrations
│   └── tests/                  # Jest tests
├── frontend/                   # React 18 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── pages/              # Route-level page components
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand state stores
│   │   ├── api/                # React Query hooks + Axios client
│   │   └── types/              # Frontend TypeScript types
│   └── tests/                  # Vitest + React Testing Library
├── docs/                       # All project documentation
│   ├── PRD.md                  # Product Requirements Document
│   ├── WIREFRAMES.md           # UI specifications for all 11 screens
│   ├── SCHEMA.md               # Database design & invariants
│   ├── GEMINI.md               # AI integration guide
│   ├── AGENTS.md               # AI agent coding conventions
│   ├── TDD.md                  # Testing & security audit guide
│   ├── SCAFFOLD.md             # Scaffolding & code generation guide
│   └── DEPLOY.md               # Docker & cloud deployment guide
├── docker-compose.yml          # Full-stack local development
├── docker-compose.override.yml # Dev hot-reload overrides
└── .env.example                # Environment variable template
```

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd trust-bound
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your Gemini API key and JWT secrets

# 3. Start with Docker (recommended)
docker compose up --build

# 4. Seed the database
docker compose exec backend npx prisma db seed

# 5. Open the app
open http://localhost:5173
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [PRD.md](docs/PRD.md) | Product vision, user personas, feature specs |
| [WIREFRAMES.md](docs/WIREFRAMES.md) | UI specs for all 11 screens |
| [SCHEMA.md](docs/SCHEMA.md) | Database models & financial invariants |
| [GEMINI.md](docs/GEMINI.md) | AI feature prompts & integration |
| [AGENTS.md](docs/AGENTS.md) | Coding conventions for AI assistants |
| [TDD.md](docs/TDD.md) | Test strategy & security audit checklist |
| [SCAFFOLD.md](docs/SCAFFOLD.md) | Step-by-step build guide |
| [DEPLOY.md](docs/DEPLOY.md) | Docker & Render.com deployment |

## 🛡️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 15 + Prisma ORM |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| AI | Gemini 1.5 Flash |
| Deploy | Docker + Render.com |

## 👥 Team

Built for hackathon prototype — see [PRD.md](docs/PRD.md) for the 7-step build plan.
