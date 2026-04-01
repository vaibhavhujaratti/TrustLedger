/**
 * Prisma Client Singleton
 *
 * Ensures only one PrismaClient instance exists across the application.
 * In development, the client is cached on `globalThis` to survive HMR restarts
 * without exhausting database connections.
 *
 * Usage: import { prisma } from "@/lib/prisma";
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
