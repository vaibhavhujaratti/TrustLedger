import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Project } from "../types/user";

export function useMyProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Project[] }>("/projects");
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Project }>(`/projects/${projectId}`);
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; description: string; totalBudget: number; deadline: string }) => {
      const { data } = await apiClient.post<{ data: Project }>("/projects", input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useLinkFreelancer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { projectId: string; email: string }) => {
      const { data } = await apiClient.post<{ data: Project }>(`/projects/${payload.projectId}/link`, { email: payload.email });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId] });
    },
  });
}

export function usePersistMilestones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { projectId: string; milestones: any[] }) => {
      const { data } = await apiClient.post<{ data: Project }>(`/projects/${payload.projectId}/milestones`, {
        milestones: payload.milestones,
      });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId] });
    },
  });
}

export function useUpsertContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { projectId: string; clauses: { title: string; body: string }[] }) => {
      const { data } = await apiClient.post(`/projects/${payload.projectId}/contract`, { clauses: payload.clauses });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId] });
    },
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { projectId: string; ipHash: string }) => {
      const { data } = await apiClient.post(`/projects/${payload.projectId}/sign`, { ipHash: payload.ipHash });
      return data.data as Project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId] });
    },
  });
}
