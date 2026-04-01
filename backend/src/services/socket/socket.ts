import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { prisma } from "../../lib/prisma";

export function initSocketIO(server: HttpServer) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "*" },
  });

  io.on("connection", (socket: Socket) => {
    // Both freelancer and client join the shared channel upon entering frontend page
    socket.on("join_dispute", (disputeId: string) => {
      socket.join(`dispute-${disputeId}`);
    });

    socket.on("send_message", async (data: { disputeId: string; senderId: string; body: string }) => {
      const { disputeId, senderId, body } = data;

      try {
        // Guarantee History Storage DB Backup
        const msg = await prisma.disputeMessage.create({
          data: {
            disputeId,
            senderId,
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
