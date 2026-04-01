import request from "supertest";
import { app } from "../../../src/app";
import { prisma, cleanupTestData, seedTestProject } from "../../helpers/seed";

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
});
