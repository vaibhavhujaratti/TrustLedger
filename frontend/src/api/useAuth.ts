import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";
import { useAuthStore } from "../stores/authStore";
import type { User } from "../types/user";

export function useLogin() {
  const loginAction = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const { data } = await apiClient.post<{ data: { user: User; token: string } }>("/auth/login", credentials);
      return data.data;
    },
    onSuccess: (data) => {
      loginAction(data.user, data.token);
    },
  });
}

export function useRegister() {
  const loginAction = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { data } = await apiClient.post<{ data: { user: User; token: string } }>("/auth/register", payload);
      return data.data;
    },
    onSuccess: (data) => {
      loginAction(data.user, data.token);
    },
  });
}
