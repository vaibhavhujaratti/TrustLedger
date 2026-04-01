import request from "supertest";
import { app } from "../../src/app";
import { prisma, cleanupTestData, seedTestProject } from "../helpers/seed";

describe("Escrow API", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it("allows a client to deposit into their project escrow", async () => {
    const { clientToken, project } = await seedTestProject();
    
    // Attempt funding
    const res = await request(app)
      .post(`/api/escrow/${project.id}/deposit`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ amount: 15000 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    
    // Ledger confirmation (processEscrowEvent)
    const wallet = await prisma.escrowWallet.findFirst({ where: { projectId: project.id } });
    expect(wallet?.totalDeposited.toNumber()).toBe(15000);

    const ledger = await prisma.walletLedger.findMany({ where: { walletId: wallet!.id } });
    expect(ledger.some((e: any) => e.entryType === "DEPOSIT")).toBe(true);
    expect(ledger.some((e: any) => e.entryType === "MILESTONE_LOCK")).toBe(true);
  });
});
