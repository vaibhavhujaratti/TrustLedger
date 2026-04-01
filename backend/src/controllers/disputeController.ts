import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/AppError";
import { generateDisputeSummary } from "../services/gemini/disputeSummarizer";
import { processEscrowEvent } from "../services/escrow/walletAgent";
import { notify } from "../services/notifications/notifier";

export const raiseDispute = async (req: Request, res: Response) => {
  const { projectId, milestoneId } = req.body;
  const reason = req.body.reason;
  const userId = req.user!.userId;

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });

  if (!milestone) throw new AppError("Milestone not found", 404);

  if (milestone.project.clientId !== userId && milestone.project.freelancerId !== userId) {
    throw new AppError("Access denied", 403);
  }

  // Guards: Can only dispute UNDER_REVIEW or PENDING, not after release.
  if (milestone.status === "FUNDS_RELEASED" || milestone.status === "APPROVED") {
    throw new AppError("Cannot reverse approved milestones", 422);
  }

  const dispute = await prisma.dispute.create({
    data: {
      projectId,
      milestoneId,
      raisedByUserId: userId,
      reason,
      status: "OPEN",
    },
  });

  // Lock the actual milestone logically to prevent release attempts
  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: "DISPUTED" },
  });

  const otherUserId =
    milestone.project.clientId === userId ? milestone.project.freelancerId : milestone.project.clientId;
  if (otherUserId) {
    await notify({
      userId: otherUserId,
      title: "Dispute Raised",
      body: `A dispute was raised on milestone: "${milestone.title}".`,
      type: "DISPUTE_RAISED",
      linkPath: `/projects/${projectId}`,
    });
  }

  res.status(201).json({ success: true, data: dispute });
};

export const getDispute = async (req: Request, res: Response) => {
  const disputeId = req.params.id as string;
  const userId = req.user!.userId;

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      project: true,
      milestone: true,
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!dispute) throw new AppError("Dispute not found", 404);
  if (dispute.project.clientId !== userId && dispute.project.freelancerId !== userId) {
    throw new AppError("Access denied", 403);
  }

  res.status(200).json({ success: true, data: dispute });
};

export const generateAiSummary = async (req: Request, res: Response) => {
  const disputeId = req.params.id as string;
  const userId = req.user!.userId;

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { project: true, messages: { include: { sender: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!dispute) throw new AppError("Dispute not found", 404);
  if (dispute.project.clientId !== userId && dispute.project.freelancerId !== userId) {
    throw new AppError("Access denied", 403);
  }

  const chatLog = dispute.messages
    .map((m) => `${m.sender.role}: ${m.body}`)
    .join("\n")
    .slice(0, 4000);

  if (!chatLog.trim()) throw new AppError("No messages to summarize", 422);

  const summary = await generateDisputeSummary(chatLog);
  const freelancerPct = Number(summary?.suggestedSplit?.freelancer ?? 50);
  const clientPct = Number(summary?.suggestedSplit?.client ?? 50);

  const updated = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      aiSummary: summary,
      proposedFreelancerPct: freelancerPct,
      proposedClientPct: clientPct,
      status: "IN_MEDIATION",
    },
  });

  res.status(200).json({ success: true, data: updated });
};

export const resolveDispute = async (req: Request, res: Response) => {
  const disputeId = req.params.id as string;
  const userId = req.user!.userId;
  const { freelancerPct, clientPct } = req.body as { freelancerPct: number; clientPct: number };

  if (freelancerPct + clientPct !== 100) throw new AppError("Split must sum to 100", 422);

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { project: { include: { escrowWallet: true } }, milestone: true },
  });
  if (!dispute) throw new AppError("Dispute not found", 404);
  if (dispute.project.clientId !== userId && dispute.project.freelancerId !== userId) {
    throw new AppError("Access denied", 403);
  }
  if (dispute.status === "RESOLVED") throw new AppError("Dispute already resolved", 422);

  const walletId = dispute.project.escrowWallet?.id;
  if (!walletId) throw new AppError("Project has no escrow wallet", 422);

  const amount = Number(dispute.milestone.amount);
  const freelancerAmount = (amount * freelancerPct) / 100;
  const clientAmount = (amount * clientPct) / 100;

  // Prototype ledger entries: one resolve entry for each side of the split.
  // Funds always leave escrow (DEBIT); payout accounting is simulated in ledger.
  if (freelancerAmount > 0) {
    await processEscrowEvent(
      walletId,
      "DISPUTE_RESOLVE",
      freelancerAmount,
      userId,
      dispute.milestoneId,
      `Dispute resolved: ${freelancerPct}% to freelancer`,
      "RELEASE"
    );
  }
  if (clientAmount > 0) {
    await processEscrowEvent(
      walletId,
      "DISPUTE_RESOLVE",
      clientAmount,
      userId,
      dispute.milestoneId,
      `Dispute resolved: ${clientPct}% refunded to client`,
      "REFUND"
    );
  }

  // Mark dispute resolved; milestone becomes FUNDS_RELEASED (terminal) for demo flow continuity.
  const updated = await prisma.$transaction(async (tx) => {
    const d = await tx.dispute.update({
      where: { id: disputeId },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
    await tx.milestone.update({
      where: { id: dispute.milestoneId },
      data: { status: "FUNDS_RELEASED", approvedAt: new Date() },
    });
    return d;
  });

  if (dispute.project.clientId) {
    await notify({
      userId: dispute.project.clientId,
      title: "Dispute Resolved",
      body: "A dispute was resolved and funds were distributed.",
      type: "DISPUTE_RESOLVED",
      linkPath: `/projects/${dispute.projectId}`,
    });
  }
  if (dispute.project.freelancerId) {
    await notify({
      userId: dispute.project.freelancerId,
      title: "Dispute Resolved",
      body: "A dispute was resolved and funds were distributed.",
      type: "DISPUTE_RESOLVED",
      linkPath: `/projects/${dispute.projectId}`,
    });
  }

  res.status(200).json({ success: true, data: updated });
};
