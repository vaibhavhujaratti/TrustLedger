import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateInvoicePdf } from "../services/invoice/generator";
import { AppError } from "../lib/AppError";

export const createInvoice = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      milestones: true,
      client: true,
      freelancer: true,
    },
  });

  if (!project) throw new AppError("Project not found", 404);

  // Guards: all milestones must be released to issue an invoice covering the whole project
  const allReleased = project.milestones.every((m: any) => m.status === "FUNDS_RELEASED");
  if (!allReleased) {
    throw new AppError("Cannot generate invoice until all milestones are released", 422);
  }

  // Invoice Number generator logic TB-YYYY-NNNN format snapshot
  const invoiceNumber = `TB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Snapshoting data statically
  const metadata = {
    amount: project.totalBudget,
    client: project.client.displayName,
    freelancer: project.freelancer?.displayName,
    milestones: project.milestones.map((m: any) => ({ title: m.title, amount: m.amount })),
  };

  const invoice = await prisma.invoice.create({
    data: {
      projectId,
      invoiceNumber,
      totalAmount: project.totalBudget,
      metadata
    },
  });

  // Call headless PDF generation via memory byte streaming simulated path
  const invoicePdfBase64 = await generateInvoicePdf(invoiceNumber, metadata);

  // Store the path later when cloud uploads are supported, return base64 for now
  res.status(201).json({
    success: true,
    data: {
      invoice,
      pdfPayload: invoicePdfBase64,
    },
  });
};
