import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { processEscrowEvent } from "../services/escrow/walletAgent";
import { AppError } from "../lib/AppError";
import { notify } from "../services/notifications/notifier";

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

  await processEscrowEvent(
    walletId,
    "RELEASE",
    Number(milestone.amount),
    req.user!.userId,
    milestone.id,
    "Payment release for milestone approval"
  );

  const updated = await prisma.milestone.update({
    where: { id },
    data: {
      status: "FUNDS_RELEASED",
      approvedAt: new Date(),
    },
  });

  // If all milestones are released, mark project completed and auto-create invoice (if missing)
  const allReleased = milestone.project.milestones.every((m) =>
    m.id === updated.id ? true : m.status === "FUNDS_RELEASED"
  );

  if (allReleased) {
    await prisma.project.update({
      where: { id: milestone.projectId },
      data: { status: "COMPLETED" },
    });

    const existingInvoice = milestone.project.invoices[0];
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

  await notify({
    userId: milestone.project.freelancerId ?? "",
    title: "Funds Released",
    body: `Funds were released for milestone: "${milestone.title}".`,
    type: "FUNDS_RELEASED",
    linkPath: `/projects/${milestone.projectId}`,
  }).catch(() => {});

  res.status(200).json({ success: true, data: updated });
};
