import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";

export function initSocketIO(server: HttpServer) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "*" },
  });

  io.on("connection", (socket: Socket) => {
    const token = (socket.handshake.auth as any)?.token as string | undefined;
    const decoded = (() => {
      try {
        if (!token) return null;
        return jwt.verify(token, process.env.JWT_SECRET as string) as {
          userId: string;
          role: string;
        };
      } catch {
        return null;
      }
    })();

    if (!decoded) {
      socket.disconnect(true);
      return;
    }

    // Both freelancer and client join the shared channel upon entering frontend page
    socket.on("join_dispute", async (disputeId: string) => {
      try {
        const dispute = await prisma.dispute.findUnique({
          where: { id: disputeId },
          include: { project: true },
        });
        if (!dispute) return;
        if (dispute.project.clientId !== decoded.userId && dispute.project.freelancerId !== decoded.userId) return;
        socket.join(`dispute-${disputeId}`);
      } catch {
        return;
      }
    });

    socket.on("send_message", async (data: { disputeId: string; body: string }) => {
      const { disputeId, body } = data;

      try {
        const dispute = await prisma.dispute.findUnique({
          where: { id: disputeId },
          include: { project: true },
        });
        if (!dispute) return;
        if (dispute.project.clientId !== decoded.userId && dispute.project.freelancerId !== decoded.userId) return;

        // Guarantee History Storage DB Backup
        const msg = await prisma.disputeMessage.create({
          data: {
            disputeId,
            senderId: decoded.userId,
            body,
          },
          include: { sender: true },
        });

        // Push via Socket.io to identical namespace targeting frontends actively listening
        io.to(`dispute-${disputeId}`).emit("receive_message", msg);
      } catch (error) {
        console.error("Socket error processing dispute message:", error);
      }
    });

    socket.on("disconnect", () => {});
  });

  return io;
}
