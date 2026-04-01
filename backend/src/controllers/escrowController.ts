import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processEscrowEvent } from "../services/escrow/walletAgent";
import { AppError } from "../lib/AppError";

export const depositEscrow = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { amount } = req.body;
  const userId = req.user!.userId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { escrowWallet: true },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // Only the assigned client can deposit
  if (project.clientId !== userId) {
    throw new AppError("You do not have permission to deposit into this escrow", 403);
  }

  // Ensure an escrow wallet exists
  let walletId = project.escrowWallet?.id;
  if (!walletId) {
    const newWallet = await prisma.escrowWallet.create({
      data: { projectId },
    });
    walletId = newWallet.id;
  }

  await processEscrowEvent(walletId, "DEPOSIT", amount, userId, null, "User Deposit");

  const finalWallet = await prisma.escrowWallet.findUnique({
    where: { id: walletId },
  });

  const newBalance = finalWallet!.totalDeposited.minus(finalWallet!.totalReleased).toString();

  res.status(201).json({
    success: true,
    data: { newBalance },
  });
};
