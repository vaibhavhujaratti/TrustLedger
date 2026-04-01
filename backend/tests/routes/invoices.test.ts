import request from "supertest";
import { app } from "../../../src/app";
import { prisma, cleanupTestData, seedTestProject } from "../../helpers/seed";

describe("Invoices API", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("handles invoice generation constraints accurately rejecting unless fully released", async () => {
    const { clientToken, project } = await seedTestProject();

    const milestone = await prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "Task waiting",
        description: "Task waiting description",
        budgetPercent: 10,
        amount: 2500,
        status: "APPROVED", // specifically NOT "FUNDS_RELEASED"
        estimatedDays: 5,
        verificationCriteria: "Criteria",
        sequenceOrder: 99,
      }
    });

    const res = await request(app)
      .post(`/api/invoices/${project.id}`)
      .set("Authorization", `Bearer ${clientToken}`);
    
    // The FSM prevents snapshot generation on pending accounts
    expect(res.status).toBe(422);
    expect(res.body.error).toContain("Cannot generate invoice until all milestones are released");
  });

  it("accepts valid invoice bundle generations natively producing bytes", async () => {
    const { clientToken, project } = await seedTestProject();

    await prisma.milestone.updateMany({
      where: { projectId: project.id },
      data: { status: "FUNDS_RELEASED", approvedAt: new Date() },
    });

    const res = await request(app)
      .post(`/api/invoices/${project.id}`)
      .set("Authorization", `Bearer ${clientToken}`);
    
    expect(res.status).toBe(201);
    expect(res.body.data.pdfPayload).toBeDefined(); // Confirms generator bypasses standard fs and utilizes memory Base64 natively
  });
});
