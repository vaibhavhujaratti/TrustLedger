/**
 * Test Seed Helpers
 *
 * Creates minimal test fixtures for integration tests.
 * Each helper returns the created entities + auth tokens.
 * Call in beforeEach() for isolation between tests.
 */

import { PrismaClient, UserRole, ProjectStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "test-secret-key-for-testing-only";

/**
 * Creates a test project with:
 * - 1 client user + JWT token
 * - 1 freelancer user + JWT token
 * - 1 project in ACTIVE status
 * - 3 milestones (PENDING)
 */
export async function seedTestProject() {
  const passwordHash = await hash("testpass", 4); // Low rounds for speed

  const client = await prisma.user.create({
    data: {
      email: `client-${Date.now()}@test.com`,
      passwordHash,
      role: UserRole.CLIENT,
      displayName: "Test Client",
    },
  });

  const freelancer = await prisma.user.create({
    data: {
      email: `freelancer-${Date.now()}@test.com`,
      passwordHash,
      role: UserRole.FREELANCER,
      displayName: "Test Freelancer",
    },
  });

  const project = await prisma.project.create({
    data: {
      title: "Test Project",
      description: "A test project for integration tests.",
      totalBudget: 10000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: ProjectStatus.AWAITING_DEPOSIT,
      clientId: client.id,
      freelancerId: freelancer.id,
    },
  });

  await prisma.contract.create({
    data: {
      projectId: project.id,
      clauses: [{ title: "Scope", body: "Test scope" }],
      signatures: {
        createMany: {
          data: [
            { userId: client.id, ipHash: "client-ip-hash-test" },
            { userId: freelancer.id, ipHash: "freelancer-ip-hash-test" },
          ],
        },
      },
    },
  });

  // Required milestones for escrow lock + FSM tests
  await prisma.milestone.createMany({
    data: [
      {
        projectId: project.id,
        title: "Milestone 1",
        description: "M1",
        budgetPercent: 30,
        amount: 3000,
        estimatedDays: 3,
        verificationCriteria: "Criteria",
        sequenceOrder: 1,
        status: "PENDING",
      },
      {
        projectId: project.id,
        title: "Milestone 2",
        description: "M2",
        budgetPercent: 50,
        amount: 5000,
        estimatedDays: 5,
        verificationCriteria: "Criteria",
        sequenceOrder: 2,
        status: "PENDING",
      },
      {
        projectId: project.id,
        title: "Milestone 3",
        description: "M3",
        budgetPercent: 20,
        amount: 2000,
        estimatedDays: 2,
        verificationCriteria: "Criteria",
        sequenceOrder: 3,
        status: "PENDING",
      },
    ],
  });

  const clientToken = jwt.sign(
    { userId: client.id, role: client.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const freelancerToken = jwt.sign(
    { userId: freelancer.id, role: freelancer.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { client, freelancer, project, clientToken, freelancerToken };
}

/**
 * Cleans up all test data. Call in afterEach().
 */
export async function cleanupTestData() {
  await prisma.walletLedger.deleteMany();
  await prisma.disputeMessage.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.contractSignature.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.escrowWallet.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

export { prisma };
