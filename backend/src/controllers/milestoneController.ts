import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processEscrowEvent } from "../services/escrow/walletAgent";
import { AppError } from "../lib/AppError";

export const submitMilestone = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { url } = req.body;

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!milestone) throw new AppError("Milestone not found", 404);

  // Guard: Only the assigned freelancer can submit
  if (req.user!.userId !== milestone.project.freelancerId) {
    throw new AppError("Unauthorized action", 403);
  }

  // Guard: FSM transition check
  if (milestone.status !== "PENDING") {
    throw new AppError(`Cannot submit milestone in ${milestone.status} state`, 422);
  }

  const updated = await prisma.milestone.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      deliverableUrl: url,
      submittedAt: new Date(),
    },
  });

  res.status(200).json({ success: true, data: updated });
};

export const reviewMilestone = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!milestone) throw new AppError("Milestone not found", 404);
  if (req.user!.userId !== milestone.project.clientId) {
    throw new AppError("Unauthorized action", 403);
  }

  if (milestone.status !== "SUBMITTED") {
    throw new AppError(`Cannot review milestone in ${milestone.status} state`, 422);
  }

  const updated = await prisma.milestone.update({
    where: { id },
    data: { status: "UNDER_REVIEW" },
  });
  res.status(200).json({ success: true, data: updated });
};

export const approveMilestone = async (req: Request, res: Response) => {
  const { id } = req.params;

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { project: { include: { escrowWallet: true } } },
  });

  if (!milestone) throw new AppError("Milestone not found", 404);

  // Guard: Only Client can approve
  if (req.user!.userId !== milestone.project.clientId) {
    throw new AppError("Unauthorized action", 403);
  }

  // Finite state machine constraint:
  if (milestone.status !== "UNDER_REVIEW" && milestone.status !== "SUBMITTED") {
    throw new AppError(`Cannot approve milestone in ${milestone.status} state`, 422);
  }

  // Double-release guard
  if (milestone.status === "APPROVED" || milestone.status === "FUNDS_RELEASED") {
    throw new AppError(`Milestone already approved or released`, 422);
  }

  const walletId = milestone.project.escrowWallet?.id;
  if (!walletId) throw new AppError("Project has no funded escrow wallet", 422);

  // 1. Release the funds through the primitive (it holds the Atomic Prisma logic)
  await processEscrowEvent(
    walletId,
    "RELEASE",
    Number(milestone.amount),
    req.user!.userId,
    milestone.id,
    "Payment release for milestone approval"
  );

  // 2. Mark milestone as released in state
  const updated = await prisma.milestone.update({
    where: { id },
    data: {
      status: "FUNDS_RELEASED",
      approvedAt: new Date(),
    },
  });

  res.status(200).json({ success: true, data: updated });
};
