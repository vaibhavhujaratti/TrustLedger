import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { escrowRouter } from "./routes/escrow";
import { milestoneRouter } from "./routes/milestones";
import { disputeRouter } from "./routes/disputes";
import { invoiceRouter } from "./routes/invoices";
import { projectRouter } from "./routes/projects";
import { aiRouter } from "./routes/ai";
import { notificationRouter } from "./routes/notifications";
import { prisma } from "./lib/prisma";

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json({ limit: "10kb" }));

app.get("/api/health", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: "Service Unavailable",
    });
  }
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/escrow", escrowRouter);
app.use("/api/milestones", milestoneRouter);
app.use("/api/disputes", disputeRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/projects", projectRouter);
app.use("/api/ai", aiRouter);
app.use("/api/notifications", notificationRouter);

// Global Error Handler
app.use(errorHandler);
