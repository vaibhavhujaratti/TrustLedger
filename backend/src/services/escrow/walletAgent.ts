import { Prisma, LedgerEntryType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";

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
  memo?: string,
  impact?: "DEPOSIT" | "RELEASE" | "REFUND" | null
) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const wallet = await tx.escrowWallet.findUniqueOrThrow({
      where: { id: walletId },
    });

    const balance = wallet.totalDeposited.minus(wallet.totalReleased).minus(wallet.totalRefunded);

    // Guard against insufficient funds
    const effectiveImpact =
      impact ??
      (event === "DEPOSIT"
        ? "DEPOSIT"
        : event === "RELEASE"
          ? "RELEASE"
          : event === "REFUND"
            ? "REFUND"
            : null);

    if ((event === "RELEASE" || effectiveImpact === "RELEASE") && balance.lessThan(amount)) {
      throw new AppError("Insufficient escrow balance to release funds", 422);
    }
    if (event === "MILESTONE_LOCK" && balance.lessThan(amount)) {
      throw new AppError("Insufficient escrow balance to lock milestone", 422);
    }
    if ((event === "REFUND" || effectiveImpact === "REFUND") && balance.lessThan(amount)) {
      throw new AppError("Insufficient escrow balance for refund", 422);
    }
    if (event === "DISPUTE_RESOLVE" && !effectiveImpact) {
      throw new AppError("Dispute resolve impact missing", 500);
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
        effectiveImpact === "DEPOSIT"
          ? { totalDeposited: { increment: amount } }
          : effectiveImpact === "RELEASE"
          ? { totalReleased: { increment: amount } }
          : effectiveImpact === "REFUND"
          ? { totalRefunded: { increment: amount } }
          : {}, // locks don't alter absolute running totals
    });

    return newEntry;
  });
}
