import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/AppError";

export const myNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.status(200).json({ success: true, data: notifications });
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const id = req.params.id as string;

  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif) throw new AppError("Notification not found", 404);
  if (notif.userId !== userId) throw new AppError("Access denied", 403);

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  res.status(200).json({ success: true, data: updated });
};

