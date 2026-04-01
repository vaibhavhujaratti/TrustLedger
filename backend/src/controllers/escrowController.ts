import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processEscrowEvent } from "../services/escrow/walletAgent";
import { AppError } from "../lib/AppError";

export const depositEscrow = async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;
  const { amount } = req.body;
  const userId = req.user!.userId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { escrowWallet: true, milestones: { orderBy: { sequenceOrder: "asc" } } },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // Only the assigned client can deposit
  if (project.clientId !== userId) {
    throw new AppError("You do not have permission to deposit into this escrow", 403);
  }

  if (project.status !== "AWAITING_DEPOSIT") {
    throw new AppError("Project is not ready for escrow deposit", 422);
  }

  if (!project.milestones.length) {
    throw new AppError("Project has no milestones to fund", 422);
  }

  // Ensure an escrow wallet exists
  let walletId = project.escrowWallet?.id;
  if (!walletId) {
    const newWallet = await prisma.escrowWallet.create({
      data: { projectId: projectId },
    });
    walletId = newWallet.id;
  }

  // 1) Deposit total funds
  await processEscrowEvent(walletId, "DEPOSIT", amount, userId, null, "Escrow deposit");

  // 2) Lock funds per milestone (audit trail). Locks do not change running totals.
  for (const m of project.milestones) {
    await processEscrowEvent(
      walletId,
      "MILESTONE_LOCK",
      Number(m.amount),
      userId,
      m.id,
      `Funds locked for milestone: ${m.title}`
    );
  }

  // 3) Activate project
  await prisma.project.update({
    where: { id: projectId },
    data: { status: "ACTIVE" },
  });

  const finalWallet = await prisma.escrowWallet.findUnique({
    where: { id: walletId },
  });

  const newBalance = finalWallet!.totalDeposited.minus(finalWallet!.totalReleased).toString();

  res.status(201).json({
    success: true,
    data: { newBalance },
  });
};
