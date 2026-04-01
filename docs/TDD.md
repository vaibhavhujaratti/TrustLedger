# TDD.md — Test-Driven Development & Security Audit Guide

> **Purpose:** Defines the testing philosophy, test structure, coverage targets, and security audit checklist for Trust-Bound. Every feature must have tests written alongside (or before) implementation.

---

## 1. Testing Philosophy

Trust-Bound handles simulated financial transactions. This means a bug in the escrow wallet logic is not just a software error — it is a trust violation. The test suite exists to make financial correctness provable and demonstrable to hackathon judges.

We follow a modified TDD cycle tailored for the hackathon timeline:

1. **Red:** Write a failing test that describes the desired behavior in plain English.
2. **Green:** Write the minimum code necessary to make the test pass.
3. **Refactor:** Clean up the code while keeping all tests green.
4. **Harden:** Add edge case tests and security-specific assertions.

The goal is not 100% code coverage for coverage's sake — it is to have every critical financial path (deposit, lock, release, refund, dispute resolution) covered by at least one happy-path test, one sad-path test (insufficient funds, wrong user, invalid state transition), and one security test (unauthorized access attempt).

---

## 2. Test Stack

The backend uses **Jest** with **ts-jest** for TypeScript compilation and **Supertest** for HTTP layer testing. The database is **PostgreSQL** running in Docker, with a dedicated `trust_bound_test` database that is migrated fresh before each test suite run.

The frontend uses **Vitest** (same API as Jest, but Vite-native) with **React Testing Library** for component tests and **MSW (Mock Service Worker)** to intercept API calls.

```json
// Relevant package.json test scripts
{
  "test": "jest --runInBand",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage --coverageThreshold={\"global\":{\"branches\":70,\"functions\":80,\"lines\":80}}",
  "test:security": "jest --testPathPattern=security",
  "test:integration": "jest --testPathPattern=integration"
}
```

---

## 3. Backend Test Structure

Each test file mirrors the source file it tests. A controller at `src/controllers/escrowController.ts` has a test at `tests/controllers/escrowController.test.ts`. Integration tests that exercise the full HTTP stack live in `tests/integration/`.

### 3.1 Example: Wallet Deposit Test (TDD Red-Green cycle)

Write the failing test first, before the controller exists:

```typescript
// tests/integration/escrow.test.ts

import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { seedTestProject } from "../helpers/seed";

describe("POST /api/escrow/:projectId/deposit", () => {
  let clientToken: string;
  let projectId: string;

  beforeEach(async () => {
    // Fresh test data before every test — no state leaks between tests
    const { project, clientToken: token } = await seedTestProject();
    projectId = project.id;
    clientToken = token;
  });

  afterEach(async () => {
    // Clean up all data created during this test
    await prisma.walletLedger.deleteMany();
    await prisma.escrowWallet.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  it("should deposit funds and create a CREDIT ledger entry", async () => {
    const response = await request(app)
      .post(`/api/escrow/${projectId}/deposit`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ amount: 10000 }); // ₹10,000

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.newBalance).toBe("10000.00");

    // Verify the immutable ledger entry was created
    const ledgerEntry = await prisma.walletLedger.findFirst({
      where: { wallet: { projectId }, entryType: "DEPOSIT" }
    });
    expect(ledgerEntry).not.toBeNull();
    expect(ledgerEntry?.direction).toBe("CREDIT");
    expect(ledgerEntry?.amount.toString()).toBe("10000.00");
  });

  it("should reject deposit from a freelancer (wrong role)", async () => {
    // Freelancer should NEVER be able to deposit into escrow
    const { freelancerToken } = await seedTestProject();
    const response = await request(app)
      .post(`/api/escrow/${projectId}/deposit`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send({ amount: 10000 });

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/not authorized/i);
  });

  it("should reject deposit of zero or negative amount", async () => {
    const response = await request(app)
      .post(`/api/escrow/${projectId}/deposit`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ amount: -500 });

    expect(response.status).toBe(422);
    expect(response.body.fields).toContainEqual(
      expect.objectContaining({ field: "amount" })
    );
  });

  it("should reject unauthenticated deposit", async () => {
    const response = await request(app)
      .post(`/api/escrow/${projectId}/deposit`)
      .send({ amount: 10000 }); // No Authorization header

    expect(response.status).toBe(401);
  });
});
```

### 3.2 Milestone State Machine Tests

The milestone lifecycle is a finite state machine. Every valid and invalid transition must be tested explicitly:

```typescript
// tests/unit/milestoneStateMachine.test.ts

describe("Milestone state transitions", () => {
  it("should allow PENDING → SUBMITTED by freelancer", () => { /* ... */ });
  it("should allow SUBMITTED → UNDER_REVIEW by client", () => { /* ... */ });
  it("should allow UNDER_REVIEW → APPROVED by client", () => { /* ... */ });
  it("should allow UNDER_REVIEW → DISPUTED by client", () => { /* ... */ });
  it("should BLOCK PENDING → APPROVED (skipping submission)", () => { /* ... */ });
  it("should BLOCK APPROVED → DISPUTED (cannot dispute after approval)", () => { /* ... */ });
  it("should BLOCK submission by client (wrong role)", () => { /* ... */ });
  it("should BLOCK approval by freelancer (wrong role)", () => { /* ... */ });
});
```

Notice that each invalid transition is its own dedicated test with a clear intention. When a transition is blocked, the test verifies both the HTTP 403/422 status code AND that the database state was not mutated.

---

## 4. Security Audit Checklist

This checklist must be reviewed before the final demo. Each item maps to a test or a manual verification step.

### 4.1 Authentication & Authorization

| Check | Test Type | Status |
|---|---|---|
| JWT secret is read from env, never hardcoded | Code review | ⬜ |
| Expired tokens are rejected (401) | Automated | ⬜ |
| Tampered tokens (wrong signature) are rejected | Automated | ⬜ |
| User A cannot read User B's project | Automated (auth matrix) | ⬜ |
| User A cannot deposit into User B's escrow | Automated | ⬜ |
| User A cannot approve milestones they did not commission | Automated | ⬜ |
| Freelancer cannot trigger their own fund release | Automated | ⬜ |
| Client cannot submit a milestone on freelancer's behalf | Automated | ⬜ |

The authorization matrix tests are structured as a grid: for every sensitive endpoint, a test exists that verifies each combination of (correct role, wrong role, unauthenticated) yields the correct HTTP status code.

### 4.2 Input Validation & Injection

| Check | Test Type | Status |
|---|---|---|
| All request bodies validated with Zod before processing | Code review | ⬜ |
| SQL injection via project description (Prisma parameterization) | Automated | ⬜ |
| XSS in project title rendered in React (React auto-escapes) | Code review | ⬜ |
| Prompt injection in AI feature inputs (see GEMINI.md §7) | Automated | ⬜ |
| Oversized payloads rejected (body-parser 10kb limit) | Automated | ⬜ |
| Negative amounts rejected at validation layer, not just DB | Automated | ⬜ |

### 4.3 Financial Logic Integrity

| Check | Test Type | Status |
|---|---|---|
| Escrow wallet balance is never negative | Automated | ⬜ |
| Total ledger entries balance to zero (credits = debits) | Automated | ⬜ |
| Milestone amounts sum to project total budget | Automated (DB constraint) | ⬜ |
| No double-release: approved milestone cannot release twice | Automated | ⬜ |
| Wallet operations are atomic (Prisma transaction) | Code review | ⬜ |
| Race condition: two simultaneous approvals don't double-pay | Automated (concurrent test) | ⬜ |

### 4.4 API Security

| Check | Test Type | Status |
|---|---|---|
| Rate limiting on `/api/auth/login` (5 req/min/IP) | Automated | ⬜ |
| Rate limiting on AI endpoints (10 req/min/user) | Automated | ⬜ |
| CORS configured to only allow frontend origin | Manual | ⬜ |
| HTTPS enforced in production (Render.com handles this) | Manual | ⬜ |
| API keys (Gemini) never logged or returned in responses | Code review | ⬜ |
| Error responses never expose stack traces in production | Automated | ⬜ |

---

## 5. Frontend Component Tests

Frontend tests focus on user interactions and their effects, not implementation details. We avoid testing internal state — we test what the user sees and can do.

```typescript
// frontend/tests/components/MilestoneCard.test.tsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MilestoneCard } from "@/components/MilestoneCard";
import { server } from "@/tests/mocks/server"; // MSW server
import { rest } from "msw";

describe("MilestoneCard", () => {
  it("shows Submit button to freelancer on PENDING milestone", () => {
    render(<MilestoneCard milestone={mockPendingMilestone} userRole="FREELANCER" />);
    expect(screen.getByRole("button", { name: /submit milestone/i })).toBeInTheDocument();
  });

  it("does NOT show Submit button to client", () => {
    render(<MilestoneCard milestone={mockPendingMilestone} userRole="CLIENT" />);
    expect(screen.queryByRole("button", { name: /submit/i })).not.toBeInTheDocument();
  });

  it("shows Approve and Dispute buttons to client when UNDER_REVIEW", () => {
    render(<MilestoneCard milestone={mockUnderReviewMilestone} userRole="CLIENT" />);
    expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dispute/i })).toBeInTheDocument();
  });

  it("shows success state and wallet balance update after approval", async () => {
    server.use(
      rest.patch("/api/milestones/:id/approve", (req, res, ctx) =>
        res(ctx.json({ success: true, data: { newBalance: "7500.00" } }))
      )
    );
    render(<MilestoneCard milestone={mockUnderReviewMilestone} userRole="CLIENT" />);
    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    await waitFor(() => {
      expect(screen.getByText(/funds released/i)).toBeInTheDocument();
    });
  });
});
```

---

## 6. Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every pull request:

1. Spin up PostgreSQL 15 as a service container.
2. Run database migrations.
3. Run the full backend test suite.
4. Run the frontend test suite.
5. Run ESLint and TypeScript type checking.
6. Block merge if any test fails or coverage drops below threshold.

For the hackathon, the CI pipeline serves as a live demonstration that the code is production-quality and not just "works on my machine."

---

*The tests in this project are not bureaucracy — they are the contractual proof that escrow logic is correct. Every failing test is a potential ₹10,000 lost by a real student freelancer.*