import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useDepositEscrow(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const { data } = await apiClient.post(`/escrow/${projectId}/deposit`, { amount });
      return data.data; // Includes new local balance
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}
