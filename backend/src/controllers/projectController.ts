import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processEscrowEvent } from "../services/escrow/walletAgent";
import { AppError } from "../lib/AppError";

export const getMyProjects = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;

  const projects = await prisma.project.findMany({
    where: role === "CLIENT" ? { clientId: userId } : { freelancerId: userId },
    include: { milestones: true, escrowWallet: true },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ success: true, data: projects });
};

export const getProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { milestones: { orderBy: { sequenceOrder: "asc" } }, escrowWallet: true, client: true, freelancer: true },
  });

  if (!project) throw new AppError("Project not found", 404);
  if (project.clientId !== userId && project.freelancerId !== userId) {
    throw new AppError("Access denied", 403);
  }

  res.status(200).json({ success: true, data: project });
};

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
