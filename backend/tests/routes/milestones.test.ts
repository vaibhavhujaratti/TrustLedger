import request from "supertest";
import { app } from "../../../src/app";
import { prisma, cleanupTestData, seedTestProject } from "../../helpers/seed";

describe("Milestones FSM API", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("walks the full happy path: PENDING -> SUBMITTED -> UNDER_REVIEW -> RELEASED", async () => {
    const { clientToken, freelancerToken, project } = await seedTestProject();

    // Deposit funds via API (also locks milestones + activates project)
    await request(app)
      .post(`/api/escrow/${project.id}/deposit`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ amount: 10000 });

    const milestone = await prisma.milestone.findFirstOrThrow({
      where: { projectId: project.id, status: "PENDING" },
      orderBy: { sequenceOrder: "asc" },
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
    const finalWallet = await prisma.escrowWallet.findFirst({ where: { projectId: project.id } });
    expect(finalWallet?.totalReleased.toNumber()).toBe(Number(milestone.amount));
  });
});
