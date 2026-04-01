import request from "supertest";
import { app } from "../../src/app";
import { prisma, cleanupTestData, seedTestProject } from "../helpers/seed";

describe("Projects API", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  const rawProject = {
    title: "Awesome App",
    description: "Build something cool",
    totalBudget: 15000,
    deadline: new Date().toISOString(),
  };

  it("permits client to create a draft project", async () => {
    const { clientToken } = await seedTestProject();
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(rawProject);

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("DRAFT");
    expect(Number(res.body.data.totalBudget)).toBe(15000);
  });

  it("links freelance developer by email shifting to CONTRACT_REVIEW", async () => {
    const { clientToken, project, freelancerToken } = await seedTestProject();

    // extract standard freelancer email from manual user query since it's hardcoded in seedTestProject
    const f = await prisma.user.findFirst({ where: { role: "FREELANCER" }});
    
    const res = await request(app)
      .post(`/api/projects/${project.id}/link`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ email: f!.email });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CONTRACT_REVIEW");
    expect(res.body.data.freelancerId).toBe(f!.id);
  });
});
