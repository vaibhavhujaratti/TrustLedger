# PRD — Trust-Bound Freelance Escrow & Invoicing Platform

> **Version:** 1.0.0 · **Status:** Hackathon Prototype · **Last Updated:** 2026-04-01

---

## 1. Executive Summary

Student freelancers and independent gig workers lose thousands of dollars annually to delayed payments, scope creep, and client default. Trust-Bound solves this with a smart-contract-inspired escrow platform where clients deposit funds into milestone-locked wallets before any work begins. Funds release only on mutual milestone approval, creating a tamper-resistant financial bridge between worker and client.

This document serves as the single source of truth for all product, engineering, and design decisions during the hackathon prototype phase.

---

## 2. Problem Statement

### The Pain Points

**For Freelancers:**
- Clients delay or refuse final payment after delivery ("delivery trap").
- Scope creep — clients expand requirements without agreeing to additional pay.
- No formal contract means no legal recourse for student freelancers.
- Invoice follow-up is humiliating, time-consuming, and often fruitless.

**For Clients:**
- No guarantee that freelancers will deliver on time or to specification.
- No structured way to break a project into checkable stages.
- Paying upfront feels risky without trust signals.

### Why Existing Solutions Fail

Platforms like PayPal invoices, Fiverr, and WhatsApp agreements either take large commissions, require both parties to be on the same platform, or offer zero dispute resolution. There is no lightweight, neutral, escrow-first solution built specifically for the student-freelancer economy.

---

## 3. Target Users

### Primary Persona — "The Student Freelancer"
Ragini, 20, Computer Science sophomore. Takes web-dev and graphic design gigs via Instagram and LinkedIn DMs. Has been ghosted after delivery three times. Earns ₹8,000–₹25,000 per project.

### Secondary Persona — "The Micro-Business Client"
Arjun, 34, runs a small clothing brand. Hires students for social media creatives and website work. Has had freelancers disappear mid-project twice. Wants accountability without paying Fiverr fees.

---

## 4. Goals & Success Metrics

| Goal | Metric | Target (Demo) |
|---|---|---|
| Zero payment disputes | % of projects completing without manual dispute | ≥ 85% |
| Fast onboarding | Time from signup to first milestone created | < 3 minutes |
| Trust signal | Client satisfaction score after payment release | ≥ 4.5 / 5 |
| Adoption | Projects created during hackathon demo | ≥ 10 live projects |

---

## 5. Scope

### In Scope (Hackathon Prototype)

The prototype must demonstrate end-to-end flow: contract creation → escrow deposit → milestone submission → approval/dispute → fund release → invoice download. All escrow logic will be **simulated** (no real blockchain or bank integration) using an in-app wallet system backed by a PostgreSQL ledger.

### Out of Scope (Post-Hackathon)

Real payment gateway integration (Razorpay, Stripe), actual smart contract deployment on Ethereum/Solana, KYC verification, tax computation, and mobile native apps are explicitly deferred.

---

## 6. Feature Specifications

### 6.1 Auth & Onboarding
Users register as either **Freelancer** or **Client** with email + password. A simple profile captures name, skill tags (freelancer) or company name (client), and a UPI handle for simulated payouts. JWT-based sessions with 7-day refresh tokens.

### 6.2 Project & Contract Creation
The client creates a project by filling in title, description, total budget, and deadline. The **Milestone Breakdown Generator** (AI-assisted) suggests 3–5 milestone splits with budget proportions based on project description. Both parties digitally sign by clicking "Accept Contract" — this is recorded with a timestamp and IP hash as a lightweight audit trail.

### 6.3 Simulated Escrow Wallet
Upon contract acceptance, the client is prompted to "deposit" the total project amount into the platform wallet. The wallet is a ledger table in PostgreSQL — no real money moves. Funds are shown as "locked" until milestone approval. This simulates the escrow hold convincingly for demo purposes.

### 6.4 Milestone Lifecycle
Each milestone has five states: `PENDING → SUBMITTED → UNDER_REVIEW → APPROVED → RELEASED` (or `DISPUTED`). The freelancer marks a milestone as submitted and optionally attaches a deliverable link. The client reviews and either approves (triggering automatic fund release to freelancer's simulated wallet) or opens a dispute.

### 6.5 Dispute Resolution Chat
A real-time chat room (Socket.io) is created automatically when a dispute is raised. Both parties can communicate, share screenshots, and propose revised terms. A neutral "resolution" button allows either party to propose a split, which both must confirm.

### 6.6 Automated Invoice Generation
On full project completion (all milestones approved), the system auto-generates a PDF invoice with project name, milestone breakdown, amounts, dates, and both party names. The invoice is downloadable and emailed to both parties.

### 6.7 Dashboard & Analytics
The freelancer dashboard shows: active projects, pending milestones, wallet balance, and earnings chart. The client dashboard shows: active contracts, total locked funds, released funds, and project completion rate.

---

## 7. User Flows

### Core Happy Path
```
Client signs up → Creates project → AI generates milestones →
Freelancer accepts → Client deposits escrow →
[For each milestone] Freelancer submits → Client approves → Funds released →
All milestones done → Invoice auto-generated → Project archived
```

### Dispute Path
```
Freelancer submits milestone → Client disputes →
Dispute chat opens → Parties negotiate →
Resolution proposed → Both confirm → Funds split per agreement
```

---

## 8. Non-Functional Requirements

**Performance:** Dashboard loads in under 2 seconds on a 4G connection. Real-time milestone updates via WebSocket with < 500ms latency.

**Security:** All passwords bcrypt-hashed (cost 12). JWT secrets in environment variables only. SQL queries parameterized (no raw interpolation). Rate limiting on auth endpoints (5 req/min per IP). Escrow wallet mutations require re-authentication (fresh token check).

**Accessibility:** WCAG 2.1 AA compliance. All interactive elements keyboard-navigable. Color contrast ratio ≥ 4.5:1.

**Reliability:** Zero-downtime deployment via Docker rolling update. Database migrations are reversible.

---

## 9. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Fast HMR, strong typing |
| Styling | Tailwind CSS + shadcn/ui | Rapid prototyping, consistent components |
| Backend | Node.js + Express + TypeScript | Uniform language across stack |
| Database | PostgreSQL 15 + Prisma ORM | Relational integrity for financial ledger |
| Real-time | Socket.io | Dispute chat, live milestone updates |
| Auth | JWT + bcrypt | Stateless, portable |
| PDF Generation | Puppeteer / pdf-lib | Invoice rendering |
| AI Features | Gemini 1.5 Flash API | Milestone suggestions, contract drafting |
| Containerization | Docker + Docker Compose | Reproducible local and cloud environments |
| Cloud | Render.com / Railway | Free-tier friendly for hackathon demo |

---

## 10. Prototype Milestones (7-Step Plan)

| Step | Deliverable | Owner | ETA |
|---|---|---|---|
| 1 | Planning & Wireframes (Figma low-fi + this PRD) | Product | Day 1 |
| 2 | Database schema + Prisma migrations | Backend | Day 1–2 |
| 3 | Markdown context files (GEMINI.md, AGENTS.md, SCHEMA.md) | All | Day 2 |
| 4 | TDD setup + Security audit checklist | Backend | Day 2–3 |
| 5 | Feature-by-feature build (Auth → Escrow → Milestones → Chat → Invoice) | Full-stack | Day 3–5 |
| 6 | Scaffolding & code generation with AI agents | All | Day 5–6 |
| 7 | Docker Compose + cloud deploy + demo recording | DevOps | Day 6–7 |

---

## 11. Risks & Mitigations

**Risk:** Simulated escrow lacks credibility as a demo. **Mitigation:** Use animated wallet balance transfers, timestamped ledger entries, and a "blockchain explorer"-style audit log UI to make the simulation feel real and convincing.

**Risk:** Gemini API rate limits during demo. **Mitigation:** Cache AI responses for milestone suggestions. Prepare fallback static milestone templates.

**Risk:** Socket.io chat breaks under multiple concurrent connections. **Mitigation:** Test with at least 5 concurrent rooms in load test. Implement reconnection logic with exponential backoff.

---

## 12. Open Questions

1. Should the dispute resolution chat be mediated by an AI agent (Gemini), or kept human-only for the prototype?
2. Do we simulate actual UPI payout confirmation, or just show a "payout initiated" banner?
3. Should invoice numbers follow GST format (for Indian market credibility)?

---

*This document is a living artifact. All changes must be reviewed by the team lead and versioned with a changelog entry.*