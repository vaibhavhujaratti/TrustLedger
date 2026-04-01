import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useRaiseDispute(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { milestoneId: string; reason: string }) => {
      const { data } = await apiClient.post("/disputes", {
        projectId,
        milestoneId: payload.milestoneId,
        reason: payload.reason,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}
