import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processEscrowEvent } from "../services/escrow/walletAgent";
import { AppError } from "../lib/AppError";

export const createProject = async (req: Request, res: Response) => {
  const { title, description, totalBudget, deadline } = req.body;
  const userId = req.user!.userId;
  const role = req.user!.role;

  if (role !== "CLIENT") throw new AppError("Only clients can create projects", 403);

  const project = await prisma.project.create({
    data: {
      title,
      description,
      totalBudget,
      deadline: new Date(deadline),
      clientId: userId,
      status: "DRAFT",
    },
  });

  res.status(201).json({ success: true, data: project });
};

export const linkFreelancer = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { email } = req.body;

  const freelancer = await prisma.user.findUnique({ where: { email } });
  if (!freelancer || freelancer.role !== "FREELANCER") {
    throw new AppError("Freelancer not found", 404);
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      freelancerId: freelancer.id,
      status: "CONTRACT_REVIEW",
    },
  });

  res.status(200).json({ success: true, data: project });
};
