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

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/escrow", escrowRouter);
app.use("/api/milestones", milestoneRouter);
app.use("/api/disputes", disputeRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/projects", projectRouter);
app.use("/api/ai", aiRouter);

// Global Error Handler
app.use(errorHandler);
