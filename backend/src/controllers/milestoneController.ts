import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processEscrowEvent } from "../services/escrow/walletAgent";
import { AppError } from "../lib/AppError";
import { notify } from "../services/notifications/notifier";

/**
 * Submits a milestone for review after freelancer completes the work.
 * Only the assigned freelancer can submit their own milestones.
 * @param req - Express request with milestone ID in params and deliverable URL in body
 * @param res - Express response
 * @throws {AppError} 404 if milestone not found
 * @throws {AppError} 403 if not the assigned freelancer
 * @throws {AppError} 422 if milestone is not in PENDING state
 */
export const submitMilestone = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { url } = req.body;

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!milestone) throw new AppError("Milestone not found", 404);

  if (req.user!.userId !== milestone.project.freelancerId) {
    throw new AppError("Unauthorized action", 403);
  }

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

  await notify({
    userId: milestone.project.clientId,
    title: "Milestone Submitted",
    body: `A milestone was submitted for review: "${milestone.title}".`,
    type: "MILESTONE_SUBMITTED",
    linkPath: `/projects/${milestone.projectId}`,
  });

  res.status(200).json({ success: true, data: updated });
};

/**
 * Moves a submitted milestone to under review state.
 * Only the client who commissioned the project can review milestones.
 * @param req - Express request with milestone ID in params
 * @param res - Express response
 * @throws {AppError} 404 if milestone not found
 * @throws {AppError} 403 if not the project client
 * @throws {AppError} 422 if milestone is not in SUBMITTED state
 */
export const reviewMilestone = async (req: Request, res: Response) => {
  const id = req.params.id as string;

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

/**
 * Approves a milestone and releases escrow funds to the freelancer.
 * Uses optimistic locking to prevent race conditions from double-approval.
 * @param req - Express request with milestone ID in params
 * @param res - Express response
 * @throws {AppError} 404 if milestone not found
 * @throws {AppError} 403 if not the project client
 * @throws {AppError} 422 if milestone status doesn't allow approval or wallet missing
 */
export const approveMilestone = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { project: { include: { escrowWallet: true, milestones: true, invoices: true } } },
  });

  if (!milestone) throw new AppError("Milestone not found", 404);

  if (req.user!.userId !== milestone.project.clientId) {
    throw new AppError("Unauthorized action", 403);
  }

  if (milestone.status !== "UNDER_REVIEW" && milestone.status !== "SUBMITTED") {
    throw new AppError(`Cannot approve milestone in ${milestone.status} state`, 422);
  }

  const walletId = milestone.project.escrowWallet?.id;
  if (!walletId) throw new AppError("Project has no funded escrow wallet", 422);

  // Optimistic locking: use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Re-fetch with lock to prevent race condition
    const lockedMilestone = await tx.milestone.findUnique({
      where: { id },
      select: { status: true, amount: true },
    });

    if (!lockedMilestone || (lockedMilestone.status !== "UNDER_REVIEW" && lockedMilestone.status !== "SUBMITTED")) {
      throw new AppError("Milestone was already processed by another request", 409);
    }

    await processEscrowEvent(
      walletId,
      "RELEASE",
      Number(lockedMilestone.amount),
      req.user!.userId,
      id,
      "Payment release for milestone approval"
    );

    return tx.milestone.update({
      where: { id },
      data: {
        status: "FUNDS_RELEASED",
        approvedAt: new Date(),
      },
    });
  });

  // Check if all milestones are released and trigger completion
  const projectData = await prisma.project.findUnique({
    where: { id: milestone.projectId },
    include: { milestones: true, invoices: true },
  });

  const allReleased = projectData?.milestones.every((m) => m.status === "FUNDS_RELEASED");

  if (allReleased) {
    await prisma.project.update({
      where: { id: milestone.projectId },
      data: { status: "COMPLETED" },
    });

    const existingInvoice = projectData?.invoices[0];
    if (!existingInvoice) {
      const invoiceNumber = `TB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const proj = await prisma.project.findUniqueOrThrow({
        where: { id: milestone.projectId },
        include: { milestones: true, client: true, freelancer: true },
      });
      const metadata = {
        amount: proj.totalBudget,
        client: proj.client.displayName,
        freelancer: proj.freelancer?.displayName,
        milestones: proj.milestones.map((m) => ({ title: m.title, amount: m.amount, approvedAt: m.approvedAt })),
      };
      await prisma.invoice.create({
        data: {
          projectId: proj.id,
          invoiceNumber,
          totalAmount: proj.totalBudget,
          metadata,
        },
      });

      await notify({
        userId: proj.clientId,
        title: "Invoice Generated",
        body: `Invoice ${invoiceNumber} is ready for download.`,
        type: "INVOICE_READY",
        linkPath: `/projects/${proj.id}/invoice`,
      });
      if (proj.freelancerId) {
        await notify({
          userId: proj.freelancerId,
          title: "Invoice Generated",
          body: `Invoice ${invoiceNumber} was generated for the completed project.`,
          type: "INVOICE_READY",
          linkPath: `/projects/${proj.id}/invoice`,
        });
      }
    }
  }

  notify({
    userId: milestone.project.freelancerId ?? "",
    title: "Funds Released",
    body: `Funds were released for milestone: "${milestone.title}".`,
    type: "FUNDS_RELEASED",
    linkPath: `/projects/${milestone.projectId}`,
  }).catch((err) => console.error("Failed to send notification:", err));

  res.status(200).json({ success: true, data: result });
};
