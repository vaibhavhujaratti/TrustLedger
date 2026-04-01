# SCHEMA.md — Data Modeling & Database Schema

> **Purpose:** Complete reference for the Trust-Bound PostgreSQL schema, including entity relationships, field constraints, index strategies, and the reasoning behind each design decision.

---

## 1. Design Philosophy

The schema is designed around three core invariants that must never be violated:

**Invariant 1 — Escrow Integrity:** The sum of all `wallet_ledger` entries for a project must always equal zero (debits + credits cancel out). Money never appears or disappears; it only moves between participants and the escrow pool.

**Invariant 2 — Immutable Audit Trail:** Ledger entries, contract signatures, and dispute records are never updated or deleted. All state changes append new rows. This mirrors the behavior of a real blockchain ledger and provides a trustworthy audit trail.

**Invariant 3 — Milestone Monotonicity:** Milestone states can only advance forward (`PENDING → SUBMITTED → UNDER_REVIEW → APPROVED`). The only allowed backward transition is `UNDER_REVIEW → DISPUTED`, and even that creates a new dispute record rather than mutating the milestone itself.

---

## 2. Full Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// USERS & AUTH
// ─────────────────────────────────────────

enum UserRole {
  FREELANCER
  CLIENT
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          UserRole
  displayName   String
  upiHandle     String?   // Simulated payout identifier
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  clientProjects    Project[]       @relation("ClientProjects")
  freelancerProjects Project[]      @relation("FreelancerProjects")
  walletEntries     WalletLedger[]
  sentMessages      DisputeMessage[]
  notifications     Notification[]
  signatures        ContractSignature[]

  @@index([email])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([token])
  @@map("refresh_tokens")
}

// ─────────────────────────────────────────
// PROJECTS & CONTRACTS
// ─────────────────────────────────────────

enum ProjectStatus {
  DRAFT           // Created by client, not yet accepted by freelancer
  CONTRACT_REVIEW // Freelancer reviewing; AI contract generated
  AWAITING_DEPOSIT // Both signed; client must deposit escrow
  ACTIVE          // Escrow funded; work in progress
  COMPLETED       // All milestones approved
  DISPUTED        // One or more unresolved disputes
  CANCELLED       // Terminated before completion
}

model Project {
  id             String        @id @default(cuid())
  title          String
  description    String        @db.Text
  totalBudget    Decimal       @db.Decimal(12, 2)
  currency       String        @default("INR")
  deadline       DateTime
  status         ProjectStatus @default(DRAFT)
  clientId       String
  freelancerId   String?       // Null until freelancer accepts
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Relations
  client         User          @relation("ClientProjects", fields: [clientId], references: [id])
  freelancer     User?         @relation("FreelancerProjects", fields: [freelancerId], references: [id])
  milestones     Milestone[]
  contract       Contract?
  escrowWallet   EscrowWallet?
  invoices       Invoice[]
  disputes       Dispute[]

  @@index([clientId])
  @@index([freelancerId])
  @@index([status])
  @@map("projects")
}

model Contract {
  id          String   @id @default(cuid())
  projectId   String   @unique
  clauses     Json     // Array of { title, body } objects from Gemini
  createdAt   DateTime @default(now())

  // Relations
  project     Project  @relation(fields: [projectId], references: [id])
  signatures  ContractSignature[]

  @@map("contracts")
}

model ContractSignature {
  id          String   @id @default(cuid())
  contractId  String
  userId      String
  ipHash      String   // SHA-256 of user's IP — lightweight audit trail
  signedAt    DateTime @default(now())

  // Relations
  contract    Contract @relation(fields: [contractId], references: [id])
  user        User     @relation(fields: [userId], references: [id])

  @@unique([contractId, userId]) // Each user can only sign once
  @@map("contract_signatures")
}

// ─────────────────────────────────────────
// MILESTONES
// ─────────────────────────────────────────

enum MilestoneStatus {
  PENDING         // Not yet started
  SUBMITTED       // Freelancer marked as done; awaiting client review
  UNDER_REVIEW    // Client is reviewing
  APPROVED        // Client approved; fund release triggered
  DISPUTED        // Client disputed; dispute record created
  FUNDS_RELEASED  // Terminal state: escrow funds moved to freelancer
}

model Milestone {
  id                   String          @id @default(cuid())
  projectId            String
  title                String
  description          String          @db.Text
  budgetPercent        Int             // 0-100; all milestones in project must sum to 100
  amount               Decimal         @db.Decimal(12, 2) // Computed: project.totalBudget * budgetPercent / 100
  estimatedDays        Int
  verificationCriteria String          @db.Text
  sequenceOrder        Int             // 1-based ordering
  status               MilestoneStatus @default(PENDING)
  deliverableUrl       String?         // Link submitted by freelancer
  submittedAt          DateTime?
  approvedAt           DateTime?
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt

  // Relations
  project              Project         @relation(fields: [projectId], references: [id])
  disputes             Dispute[]
  walletEntries        WalletLedger[]

  @@index([projectId, sequenceOrder])
  @@index([status])
  @@map("milestones")
}

// ─────────────────────────────────────────
// ESCROW WALLET & LEDGER
// ─────────────────────────────────────────

// One wallet per project — holds the escrow funds
model EscrowWallet {
  id              String   @id @default(cuid())
  projectId       String   @unique
  totalDeposited  Decimal  @db.Decimal(12, 2) @default(0)
  totalReleased   Decimal  @db.Decimal(12, 2) @default(0)
  totalRefunded   Decimal  @db.Decimal(12, 2) @default(0)
  // Computed: balance = totalDeposited - totalReleased - totalRefunded
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  project         Project  @relation(fields: [projectId], references: [id])
  ledgerEntries   WalletLedger[]

  @@map("escrow_wallets")
}

enum LedgerEntryType {
  DEPOSIT       // Client funds the escrow
  MILESTONE_LOCK // Funds earmarked for a specific milestone
  RELEASE       // Funds released to freelancer on milestone approval
  REFUND        // Funds returned to client (cancellation or partial dispute)
  DISPUTE_HOLD  // Funds frozen during active dispute
  DISPUTE_RESOLVE // Dispute resolved; funds distributed
}

// Immutable — rows are NEVER updated or deleted
model WalletLedger {
  id           String          @id @default(cuid())
  walletId     String
  milestoneId  String?         // Null for project-level entries (DEPOSIT, REFUND)
  entryType    LedgerEntryType
  amount       Decimal         @db.Decimal(12, 2) // Always positive
  direction    String          // "CREDIT" (in) or "DEBIT" (out)
  actorId      String          // Who triggered this entry
  memo         String?         // Human-readable description
  createdAt    DateTime        @default(now())

  // Relations — no updates, so no updatedAt
  wallet       EscrowWallet    @relation(fields: [walletId], references: [id])
  milestone    Milestone?      @relation(fields: [milestoneId], references: [id])
  actor        User            @relation(fields: [actorId], references: [id])

  @@index([walletId, createdAt])
  @@index([milestoneId])
  @@map("wallet_ledger")
}

// ─────────────────────────────────────────
// DISPUTES
// ─────────────────────────────────────────

enum DisputeStatus {
  OPEN
  AWAITING_RESPONSE  // Other party has been notified
  IN_MEDIATION       // AI summary generated; resolution proposed
  RESOLVED
  ESCALATED          // Manual review required (future feature)
}

model Dispute {
  id                   String        @id @default(cuid())
  projectId            String
  milestoneId          String
  raisedByUserId       String
  reason               String        @db.Text
  status               DisputeStatus @default(OPEN)
  aiSummary            Json?         // Cached Gemini dispute summary
  proposedFreelancerPct Int?         // 0-100: freelancer share in resolution
  proposedClientPct     Int?         // 0-100: client share in resolution
  resolvedAt            DateTime?
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  // Relations
  project              Project       @relation(fields: [projectId], references: [id])
  milestone            Milestone     @relation(fields: [milestoneId], references: [id])
  messages             DisputeMessage[]

  @@index([projectId])
  @@index([status])
  @@map("disputes")
}

model DisputeMessage {
  id        String   @id @default(cuid())
  disputeId String
  senderId  String
  body      String   @db.Text
  createdAt DateTime @default(now())

  // Relations — immutable, no updatedAt
  dispute   Dispute  @relation(fields: [disputeId], references: [id])
  sender    User     @relation(fields: [senderId], references: [id])

  @@index([disputeId, createdAt])
  @@map("dispute_messages")
}

// ─────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────

model Invoice {
  id          String   @id @default(cuid())
  projectId   String
  invoiceNumber String @unique // Format: TB-YYYY-NNNN
  pdfUrl      String?  // Path to generated PDF in storage
  issuedAt    DateTime @default(now())
  totalAmount Decimal  @db.Decimal(12, 2)
  metadata    Json     // Snapshot of project + milestones at time of invoice

  // Relations
  project     Project  @relation(fields: [projectId], references: [id])

  @@index([projectId])
  @@map("invoices")
}

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  body      String
  type      String   // e.g., "MILESTONE_SUBMITTED", "FUNDS_RELEASED"
  linkPath  String?  // Frontend route to navigate to on click
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  // Relations
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId, isRead])
  @@map("notifications")
}
```

---

## 3. Entity Relationship Overview

The schema has a clear hub-and-spoke structure centered on the `Project` model. A project belongs to exactly one client and optionally one freelancer. It has one `Contract` (with `ContractSignature` records per signer), one `EscrowWallet` (with an immutable `WalletLedger`), multiple `Milestone` records, zero or more `Dispute` records, and ultimately one `Invoice`.

The most complex join is between `Dispute`, `Milestone`, and `WalletLedger` — when a dispute resolves, a `DISPUTE_RESOLVE` ledger entry is created that references both the wallet and the milestone, closing the financial loop.

---

## 4. Computed Fields (Not Stored)

Several important values are computed on the fly rather than stored to avoid synchronization bugs:

The **escrow balance** is always `totalDeposited - totalReleased - totalRefunded` on the `EscrowWallet` row (these three columns are updated atomically within transactions). The **milestone amount** is `project.totalBudget * milestone.budgetPercent / 100`, computed at query time using Prisma's `$queryRaw` or application-layer math. The **freelancer earnings** are the sum of all `RELEASE` ledger entries where the actor is the project's freelancer.

---

## 5. Index Strategy

Indexes are placed where the application's most frequent query patterns demand them. The `wallet_ledger` table has a compound index on `(walletId, createdAt)` because the audit log UI paginates ledger entries chronologically. The `milestones` table is indexed on `(projectId, sequenceOrder)` for the milestone list view. The `notifications` table is indexed on `(userId, isRead)` because the unread notification count badge queries this on every page load.

---

## 6. Seed Data

A seed file at `prisma/seed.ts` creates two demo users (one freelancer, one client), one complete project in `ACTIVE` status with three milestones (one approved, one in review, one pending), a funded escrow wallet, and some dispute message history. This ensures the hackathon demo has interesting data from the first load.

---

*This schema is the ground truth. When AGENTS.md refers to models, it refers to these definitions. When TDD.md writes test fixtures, they must conform to these field names and types.*