import request from "supertest";
import { app } from "../../src/app";
import { prisma, cleanupTestData, seedTestProject } from "../helpers/seed";
import { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "test-secret-key-for-testing-only";

describe("Disputes API", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("allows raising a dispute which logically locks the milestone", async () => {
    const { clientToken, project } = await seedTestProject();
    
    // Create milestone to dispute
    const milestone = await prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "Disputable Deliverable",
        description: "Task description",
        budgetPercent: 10,
        amount: 5000,
        status: "PENDING",
        estimatedDays: 5,
        verificationCriteria: "Client verifies",
        sequenceOrder: 99,
      }
    });

    const res = await request(app)
      .post("/api/disputes")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        projectId: project.id,
        milestoneId: milestone.id,
        reason: "The design is completely wrong and not according to spec.",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Verify milestone locked to DISPUTED
    const finalMilestone = await prisma.milestone.findUnique({ where: { id: milestone.id }});
    expect(finalMilestone?.status).toBe("DISPUTED");
  });

  it("resolves a dispute and writes dispute-resolve ledger entries", async () => {
    const { clientToken, project } = await seedTestProject();

    await request(app)
      .post(`/api/escrow/${project.id}/deposit`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ amount: 10000 });

    const milestone = await prisma.milestone.findFirstOrThrow({
      where: { projectId: project.id },
      orderBy: { sequenceOrder: "asc" },
    });

    const raise = await request(app)
      .post("/api/disputes")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        projectId: project.id,
        milestoneId: milestone.id,
        reason: "The deliverable does not meet the verification criteria.",
      });
    expect(raise.status).toBe(201);

    const disputeId = raise.body.data.id as string;
    const resolve = await request(app)
      .post(`/api/disputes/${disputeId}/resolve`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ freelancerPct: 50, clientPct: 50 });

    expect(resolve.status).toBe(200);
    expect(resolve.body.data.status).toBe("RESOLVED");

    const wallet = await prisma.escrowWallet.findFirstOrThrow({ where: { projectId: project.id } });
    const ledger = await prisma.walletLedger.findMany({ where: { walletId: wallet.id, entryType: "DISPUTE_RESOLVE" } });
    expect(ledger.length).toBeGreaterThanOrEqual(1);
  });

  describe("POST /api/disputes - Authorization Matrix", () => {
    it("returns 201 when authorized client raises dispute", async () => {
      const { clientToken, project } = await seedTestProject();

      const milestone = await prisma.milestone.create({
        data: {
          projectId: project.id,
          title: "Test Milestone",
          description: "Test description",
          budgetPercent: 25,
          amount: 2500,
          status: "PENDING",
          estimatedDays: 3,
          verificationCriteria: "Test verification",
          sequenceOrder: 1,
        },
      });

      const res = await request(app)
        .post("/api/disputes")
        .set("Authorization", `Bearer ${clientToken}`)
        .send({
          projectId: project.id,
          milestoneId: milestone.id,
          reason: "This is a valid dispute reason from the client.",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projectId).toBe(project.id);
      expect(res.body.data.milestoneId).toBe(milestone.id);
    });

    it("returns 201 when authorized freelancer raises dispute", async () => {
      const { freelancerToken, project } = await seedTestProject();

      const milestone = await prisma.milestone.create({
        data: {
          projectId: project.id,
          title: "Test Milestone",
          description: "Test description",
          budgetPercent: 25,
          amount: 2500,
          status: "PENDING",
          estimatedDays: 3,
          verificationCriteria: "Test verification",
          sequenceOrder: 1,
        },
      });

      const res = await request(app)
        .post("/api/disputes")
        .set("Authorization", `Bearer ${freelancerToken}`)
        .send({
          projectId: project.id,
          milestoneId: milestone.id,
          reason: "Dispute raised by freelancer on the project.",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("returns 403 when unauthorized user (not client or freelancer) raises dispute", async () => {
      const { project } = await seedTestProject();

      // Create a third user not part of the project
      const outsiderPasswordHash = await hash("testpass", 4);
      const outsider = await prisma.user.create({
        data: {
          email: `outsider-${Date.now()}@test.com`,
          passwordHash: outsiderPasswordHash,
          role: UserRole.FREELANCER,
          displayName: "Outsider User",
        },
      });

      const outsiderToken = jwt.sign(
        { userId: outsider.id, role: outsider.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      const milestone = await prisma.milestone.create({
        data: {
          projectId: project.id,
          title: "Test Milestone",
          description: "Test description",
          budgetPercent: 25,
          amount: 2500,
          status: "PENDING",
          estimatedDays: 3,
          verificationCriteria: "Test verification",
          sequenceOrder: 1,
        },
      });

      const res = await request(app)
        .post("/api/disputes")
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({
          projectId: project.id,
          milestoneId: milestone.id,
          reason: "Unauthorized user trying to raise a dispute.",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Not authorized to raise a dispute on this project");
    });

    it("returns 401 when unauthenticated user tries to raise dispute", async () => {
      const { project } = await seedTestProject();

      const milestone = await prisma.milestone.create({
        data: {
          projectId: project.id,
          title: "Test Milestone",
          description: "Test description",
          budgetPercent: 25,
          amount: 2500,
          status: "PENDING",
          estimatedDays: 3,
          verificationCriteria: "Test verification",
          sequenceOrder: 1,
        },
      });

      const res = await request(app)
        .post("/api/disputes")
        .send({
          projectId: project.id,
          milestoneId: milestone.id,
          reason: "Unauthenticated user trying to raise a dispute.",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
