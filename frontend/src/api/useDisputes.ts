import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useDispute(disputeId: string) {
  return useQuery({
    queryKey: ["disputes", disputeId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/disputes/${disputeId}`);
      return data.data;
    },
    enabled: !!disputeId,
  });
}

export function useGenerateDisputeAiSummary(disputeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/disputes/${disputeId}/ai-summary`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes", disputeId] });
    },
  });
}

export function useResolveDispute(disputeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { freelancerPct: number; clientPct: number }) => {
      const { data } = await apiClient.post(`/disputes/${disputeId}/resolve`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes", disputeId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
