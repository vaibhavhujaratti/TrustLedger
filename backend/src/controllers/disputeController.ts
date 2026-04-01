import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/AppError";

export const raiseDispute = async (req: Request, res: Response) => {
  const { projectId, milestoneId } = req.body;
  const reason = req.body.reason;
  const userId = req.user!.userId;

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });

  if (!milestone) throw new AppError("Milestone not found", 404);

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

  res.status(201).json({ success: true, data: dispute });
};
