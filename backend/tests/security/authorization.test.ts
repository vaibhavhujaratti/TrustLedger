import request from "supertest";
import { app } from "../../src/app";
import { seedTestProject, cleanupTestData, prisma } from "../helpers/seed";

describe("Escrow: Authorization", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  // 1. Client deposit block (from specific freelancer token)
  it("blocks freelancer from depositing into escrow", async () => {
    const { freelancerToken, project } = await seedTestProject();
    const res = await request(app)
      .post(`/api/escrow/${project.id}/deposit`)
      .set("Authorization", `Bearer ${freelancerToken}`)
      .send({ amount: 5000 });
    expect(res.status).toBe(403); // Written first; feature doesn't exist yet
  });

  // 2. Unauthenticated deposit block
  it("blocks unauthenticated deposit attempt", async () => {
    const { project } = await seedTestProject();
    const res = await request(app)
      .post(`/api/escrow/${project.id}/deposit`)
      .send({ amount: 5000 }); // No Authorization header
    expect(res.status).toBe(401);
  });

  // 3. Validation negative amount block
  it("rejects negative deposit amount at validation layer", async () => {
    const { clientToken, project } = await seedTestProject();
    const res = await request(app)
      .post(`/api/escrow/${project.id}/deposit`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ amount: -500 });
    expect(res.status).toBe(422);
  });

  // 4. Incorrect Client deposit block (another project)
  it("blocks User A (client) from depositing into User B's escrow", async () => {
    const { project: projectA } = await seedTestProject();
    const { clientToken: tokenB } = await seedTestProject(); // Seed another full project and extract B's token

    const res = await request(app)
      .post(`/api/escrow/${projectA.id}/deposit`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ amount: 5000 });
    expect(res.status).toBe(403);
  });

  // 5. Freelancer cannot approve/release their own milestone
  it("blocks freelancer from triggering their own fund release", async () => {
    const { freelancerToken } = await seedTestProject();
    
    // Attempting an action only a client can do
    const res = await request(app)
      .post(`/api/milestones/dummy-id/release`)
      .set("Authorization", `Bearer ${freelancerToken}`);
    expect(res.status).toBe(403);
  });

  // 6. Client cannot submit a milestone as a freelancer
  it("blocks client from submitting a milestone on behalf of freelancer", async () => {
    const { clientToken } = await seedTestProject();
    
    // Attempting an action only a freelancer can do
    const res = await request(app)
      .post(`/api/milestones/dummy-id/submit`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ url: "http://deliverable.zip" });
    expect(res.status).toBe(403);
  });
});
