import request from "supertest";
import { app } from "../../../src/app";
import { prisma, cleanupTestData, seedTestProject } from "../../helpers/seed";

describe("Milestones FSM API", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("walks the full happy path: PENDING -> SUBMITTED -> UNDER_REVIEW -> RELEASED", async () => {
    const { clientToken, freelancerToken, project } = await seedTestProject();
    
    // Create wallet and deposit funds before proceeding
    const wallet = await prisma.escrowWallet.create({ data: { projectId: project.id } });
    await prisma.walletLedger.create({ data: { walletId: wallet.id, entryType: "DEPOSIT", amount: 10000, direction: "CREDIT", actorId: "dummy" }});
    await prisma.escrowWallet.update({ where: { id: wallet.id }, data: { totalDeposited: 10000 }});

    // Create a pending milestone properly bound
    const milestone = await prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "Test Task",
        description: "Task description",
        amount: 5000,
        status: "PENDING",
        estimatedDays: 5,
      }
    });

    // Step 1: Freelancer submits
    const subRes = await request(app)
      .post(`/api/milestones/${milestone.id}/submit`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send({ url: "https://drive.google.com/test" });
    expect(subRes.status).toBe(200);
    expect(subRes.body.data.status).toBe("SUBMITTED");

    // Step 2: Client reviews
    const revRes = await request(app)
      .post(`/api/milestones/${milestone.id}/review`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(revRes.status).toBe(200);
    expect(revRes.body.data.status).toBe("UNDER_REVIEW");

    // Step 3: Client approves & atomic funds release triggers
    const appRes = await request(app)
      .post(`/api/milestones/${milestone.id}/release`)
      .set("Authorization", `Bearer ${clientToken}`);
    expect(appRes.status).toBe(200);
    expect(appRes.body.data.status).toBe("FUNDS_RELEASED");

    // Recheck the wallet explicitly
    const finalWallet = await prisma.escrowWallet.findUnique({ where: { id: wallet.id } });
    expect(finalWallet?.totalReleased.toNumber()).toBe(5000);
  });
});
