import http from "http";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "test-secret-key-for-testing-only") {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL ERROR: JWT_SECRET environment variable is not defined or is utilizing default.");
    process.exit(1);
  }
}

import { app } from "./app";
import { initSocketIO } from "./services/socket/socket";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
initSocketIO(server);

server.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`✅ Server running on port ${PORT}`);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
