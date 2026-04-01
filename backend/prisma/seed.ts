/**
 * Database Seed Script
 *
 * Creates demo data for the hackathon prototype:
 * - 1 Client user (client@demo.com / password123)
 * - 1 Freelancer user (freelancer@demo.com / password123)
 * - 1 Active project with 3 milestones (1 approved, 1 under review, 1 pending)
 * - A funded escrow wallet with ledger entries
 * - Some dispute message history
 *
 * Run: npx prisma db seed
 */

import { PrismaClient, UserRole, ProjectStatus, MilestoneStatus, LedgerEntryType, DisputeStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (order matters due to foreign keys)
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

  // ─── Create Users ───────────────────────────
  const passwordHash = await hash("password123", 12);

  const client = await prisma.user.create({
    data: {
      email: "client@demo.com",
      passwordHash,
      role: UserRole.CLIENT,
      displayName: "Arjun Mehta",
      upiHandle: "arjun@upi",
      avatarUrl: null,
    },
  });
  console.log(`  ✅ Client: ${client.email} (${client.id})`);

  const freelancer = await prisma.user.create({
    data: {
      email: "freelancer@demo.com",
      passwordHash,
      role: UserRole.FREELANCER,
      displayName: "Ragini Sharma",
      upiHandle: "ragini@upi",
      avatarUrl: null,
    },
  });
  console.log(`  ✅ Freelancer: ${freelancer.email} (${freelancer.id})`);

  // ─── Create Project ─────────────────────────
  const project = await prisma.project.create({
    data: {
      title: "Social Media Brand Kit",
      description:
        "Design a complete brand identity for my bakery Instagram. Needs logo, 3 color palette options, font pairing, and 10 post templates in Canva.",
      totalBudget: 12000,
      currency: "INR",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: ProjectStatus.ACTIVE,
      clientId: client.id,
      freelancerId: freelancer.id,
    },
  });
  console.log(`  ✅ Project: ${project.title} (${project.id})`);

  // ─── Create Contract ────────────────────────
  const contract = await prisma.contract.create({
    data: {
      projectId: project.id,
      clauses: [
        {
          title: "Scope of Work",
          body: "The Freelancer agrees to deliver a complete brand identity package including logo design (3 concepts), color palette, font pairing, and 10 Instagram post templates in Canva format.",
        },
        {
          title: "Payment Terms",
          body: "Total project fee of ₹12,000 INR is held in escrow. Funds are released milestone-by-milestone upon Client approval. No advance payment outside escrow.",
        },
        {
          title: "Revision Policy",
          body: "Each milestone includes up to 2 rounds of revisions at no additional cost. Additional revisions beyond 2 rounds require mutual agreement on adjusted timeline and compensation.",
        },
        {
          title: "Intellectual Property",
          body: "All intellectual property rights transfer to the Client upon final payment release. Until final payment, the Freelancer retains ownership of all deliverables.",
        },
        {
          title: "Confidentiality",
          body: "Both parties agree to keep project details, business information, and communications confidential. Neither party shall disclose project specifics without written consent.",
        },
        {
          title: "Termination",
          body: "Either party may terminate the contract. If the Client terminates, payment is due for all approved milestones. If the Freelancer terminates, all deposits for unapproved milestones are refunded.",
        },
      ],
    },
  });

  // Sign the contract for both parties
  await prisma.contractSignature.createMany({
    data: [
      {
        contractId: contract.id,
        userId: client.id,
        ipHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      },
      {
        contractId: contract.id,
        userId: freelancer.id,
        ipHash: "f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5",
      },
    ],
  });
  console.log("  ✅ Contract created and signed by both parties");

  // ─── Create Milestones ──────────────────────
  const milestones = await Promise.all([
    prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "Logo Design & Brand Concepts",
        description: "Deliver 3 logo concept variations with rationale for each design direction.",
        budgetPercent: 30,
        amount: 3600,
        estimatedDays: 3,
        verificationCriteria: "Client receives 3 distinct logo PNGs with source files and selects preferred direction.",
        sequenceOrder: 1,
        status: MilestoneStatus.FUNDS_RELEASED,
        deliverableUrl: "https://drive.google.com/folder/logo-concepts-v3",
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "Color Palette & Typography System",
        description: "Finalize brand color palette (primary + 2 accents) and paired font system.",
        budgetPercent: 20,
        amount: 2400,
        estimatedDays: 2,
        verificationCriteria: "Brand style guide PDF shared; client approves hex codes and font names.",
        sequenceOrder: 2,
        status: MilestoneStatus.UNDER_REVIEW,
        deliverableUrl: "https://drive.google.com/folder/brand-guide-v1",
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "Post Template Set (10 Templates)",
        description: "Deliver 10 ready-to-use Canva Instagram post templates using approved brand identity.",
        budgetPercent: 40,
        amount: 4800,
        estimatedDays: 6,
        verificationCriteria: "Canva folder shared with edit access; all 10 templates visible and functional.",
        sequenceOrder: 3,
        status: MilestoneStatus.PENDING,
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: project.id,
        title: "Final Handoff & Revisions",
        description: "Incorporate up to 2 rounds of feedback and deliver all final source files.",
        budgetPercent: 10,
        amount: 1200,
        estimatedDays: 3,
        verificationCriteria: "Google Drive link with all source files (AI, PNG, PDF) confirmed by client.",
        sequenceOrder: 4,
        status: MilestoneStatus.PENDING,
      },
    }),
  ]);
  console.log(`  ✅ ${milestones.length} milestones created`);

  // ─── Create Escrow Wallet & Ledger ──────────
  const wallet = await prisma.escrowWallet.create({
    data: {
      projectId: project.id,
      totalDeposited: 12000,
      totalReleased: 3600,
      totalRefunded: 0,
    },
  });

  // Create immutable ledger entries (audit trail)
  await prisma.walletLedger.createMany({
    data: [
      {
        walletId: wallet.id,
        milestoneId: null,
        entryType: LedgerEntryType.DEPOSIT,
        amount: 12000,
        direction: "CREDIT",
        actorId: client.id,
        memo: "Initial escrow deposit for project: Social Media Brand Kit",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        walletId: wallet.id,
        milestoneId: milestones[0].id,
        entryType: LedgerEntryType.MILESTONE_LOCK,
        amount: 3600,
        direction: "DEBIT",
        actorId: client.id,
        memo: "Funds locked for milestone: Logo Design & Brand Concepts",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        walletId: wallet.id,
        milestoneId: milestones[0].id,
        entryType: LedgerEntryType.RELEASE,
        amount: 3600,
        direction: "DEBIT",
        actorId: client.id,
        memo: "Funds released to freelancer for: Logo Design & Brand Concepts",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        walletId: wallet.id,
        milestoneId: milestones[1].id,
        entryType: LedgerEntryType.MILESTONE_LOCK,
        amount: 2400,
        direction: "DEBIT",
        actorId: client.id,
        memo: "Funds locked for milestone: Color Palette & Typography System",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log("  ✅ Escrow wallet created with 4 ledger entries");

  // ─── Create Notifications ──────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: client.id,
        title: "Milestone Submitted",
        body: "Ragini has submitted \"Color Palette & Typography System\" for your review.",
        type: "MILESTONE_SUBMITTED",
        linkPath: `/projects/${project.id}`,
        isRead: false,
      },
      {
        userId: freelancer.id,
        title: "Funds Released",
        body: "₹3,600 has been released to your wallet for \"Logo Design & Brand Concepts\".",
        type: "FUNDS_RELEASED",
        linkPath: `/projects/${project.id}`,
        isRead: true,
      },
      {
        userId: freelancer.id,
        title: "Milestone Approved",
        body: "Arjun approved your submission for \"Logo Design & Brand Concepts\".",
        type: "MILESTONE_APPROVED",
        linkPath: `/projects/${project.id}`,
        isRead: true,
      },
    ],
  });
  console.log("  ✅ 3 notifications created");

  console.log("\n🎉 Seed complete! Demo accounts:");
  console.log("   Client:     client@demo.com / password123");
  console.log("   Freelancer: freelancer@demo.com / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
