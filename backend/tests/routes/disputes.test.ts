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
        amount: 5000,
        status: "PENDING",
        estimatedDays: 5,
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
});
