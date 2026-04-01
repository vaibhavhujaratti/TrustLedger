import { Prisma, LedgerEntryType, WalletLedger } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";

/**
 * Processes an escrow event and updates the wallet ledger atomically.
 * Creates an immutable ledger entry and updates running totals within a transaction.
 * @param walletId - The escrow wallet to operate on
 * @param event - The type of ledger entry (DEPOSIT, RELEASE, MILESTONE_LOCK, REFUND, DISPUTE_RESOLVE)
 * @param amount - Positive amount for the transaction
 * @param actorId - User who triggered this event
 * @param milestoneId - Optional milestone ID for milestone-specific entries
 * @param memo - Human-readable description
 * @param impact - Override the computed impact type
 * @returns The created WalletLedger entry
 * @throws {AppError} 422 if insufficient balance for the operation
 * @throws {AppError} 500 if DISPUTE_RESOLVE missing required impact
 */
export async function processEscrowEvent(
  walletId: string,
  event: LedgerEntryType,
  amount: number,
  actorId: string,
  milestoneId?: string | null,
  memo?: string,
  impact?: "DEPOSIT" | "RELEASE" | "REFUND" | null
): Promise<WalletLedger> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const wallet = await tx.escrowWallet.findUniqueOrThrow({
      where: { id: walletId },
    });

    const balance = wallet.totalDeposited.minus(wallet.totalReleased).minus(wallet.totalRefunded);

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

    await tx.escrowWallet.update({
      where: { id: walletId },
      data:
        effectiveImpact === "DEPOSIT"
          ? { totalDeposited: { increment: amount } }
          : effectiveImpact === "RELEASE"
          ? { totalReleased: { increment: amount } }
          : effectiveImpact === "REFUND"
          ? { totalRefunded: { increment: amount } }
          : {},
    });

    return newEntry;
  });
}
