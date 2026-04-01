import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useSubmitMilestone(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { milestoneId: string; url: string }) => {
      const { data } = await apiClient.post(`/milestones/${payload.milestoneId}/submit`, { url: payload.url });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export function useReviewMilestone(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (milestoneId: string) => {
      const { data } = await apiClient.post(`/milestones/${milestoneId}/review`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export function useApproveMilestone(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (milestoneId: string) => {
      const { data } = await apiClient.post(`/milestones/${milestoneId}/release`);
      return data.data;
    },
    onSuccess: () => {
      // Reload project to reflect escrow reductions and state transition simultaneously
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}
