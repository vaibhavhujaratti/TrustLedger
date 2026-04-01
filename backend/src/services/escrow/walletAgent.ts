import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";

type LedgerEntryType = "DEPOSIT" | "MILESTONE_LOCK" | "RELEASE" | "REFUND" | "DISPUTE_HOLD" | "DISPUTE_RESOLVE";

type WalletEntryInfo = {
  walletId: string;
  entryType: LedgerEntryType;
  amount: number;
  direction: "CREDIT" | "DEBIT";
  actorId: string;
  milestoneId?: string | null;
  memo?: string;
};

export async function processEscrowEvent(
  walletId: string,
  event: LedgerEntryType,
  amount: number,
  actorId: string,
  milestoneId?: string | null,
  memo?: string
) {
  return prisma.$transaction(async (tx: typeof prisma) => {
    const wallet = await tx.escrowWallet.findUniqueOrThrow({
      where: { id: walletId },
    });

    const balance = wallet.totalDeposited.minus(wallet.totalReleased).minus(wallet.totalRefunded);

    // Guard against insufficient funds
    if (event === "RELEASE" && balance.lessThan(amount)) {
      throw new AppError("Insufficient escrow balance to release funds", 422);
    }
    if (event === "MILESTONE_LOCK" && balance.lessThan(amount)) {
      throw new AppError("Insufficient escrow balance to lock milestone", 422);
    }
    if (event === "REFUND" && balance.lessThan(amount)) {
      throw new AppError("Insufficient escrow balance for refund", 422);
    }

    // Append the immutable ledger entry
    const newEntry = await tx.walletLedger.create({
      data: {
        walletId,
        entryType: event,
        amount,
        direction: event === "DEPOSIT" ? "CREDIT" : "DEBIT",
        actorId,
        milestoneId,
        memo,
      },
    });

    // Update running totals immutably
    await tx.escrowWallet.update({
      where: { id: walletId },
      data:
        event === "DEPOSIT"
          ? { totalDeposited: { increment: amount } }
          : event === "RELEASE"
          ? { totalReleased: { increment: amount } }
          : event === "REFUND"
          ? { totalRefunded: { increment: amount } }
          : {}, // locks don't alter absolute running totals
    });

    return newEntry;
  });
}
