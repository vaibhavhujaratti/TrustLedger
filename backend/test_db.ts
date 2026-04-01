import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Database connection successful. Existing users:", users.length);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
