import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

export type MilestoneSuggestion = {
  title: string;
  description: string;
  budgetPercent: number;
  estimatedDays: number;
  verificationCriteria: string;
};

export function useAiMilestones() {
  return useMutation({
    mutationFn: async (payload: { title: string; description: string; budget: number; deadline?: string }) => {
      const { data } = await apiClient.post("/ai/milestones", payload);
      return data.data as MilestoneSuggestion[];
    },
  });
}

export function useAiContract() {
  return useMutation({
    mutationFn: async (payload: { title: string; description: string; milestones: MilestoneSuggestion[] }) => {
      const { data } = await apiClient.post("/ai/contracts", payload);
      return data.data as { clauses: { title: string; body: string }[] };
    },
  });
}

export function useAiDisputeSummary() {
  return useMutation({
    mutationFn: async (payload: { chatLog: string }) => {
      const { data } = await apiClient.post("/ai/dispute-summary", payload);
      return data.data as any;
    },
  });
}

