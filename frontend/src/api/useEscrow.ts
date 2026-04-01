import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useDepositEscrow(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data } = await apiClient.post(`/escrow/${projectId}/deposit`, { amount });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export type LedgerEntryType = "DEPOSIT" | "RELEASE" | "MILESTONE_LOCK" | "REFUND" | "DISPUTE_RESOLVE" | "DISPUTE_HOLD";

export interface LedgerEntry {
  id: string;
  entryType: LedgerEntryType;
  amount: string;
  direction: "CREDIT" | "DEBIT";
  memo: string | null;
  createdAt: string;
  actor: { displayName: string };
}

export function useLedger(projectId: string) {
  return useQuery({
    queryKey: ["escrow", projectId, "ledger"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: LedgerEntry[] }>(`/escrow/${projectId}/ledger`);
      return data.data;
    },
    enabled: !!projectId,
  });
}
