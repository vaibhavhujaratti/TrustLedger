import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      // Returns a static PDF bundle and stores invoice reference natively
      const { data } = await apiClient.post(`/invoices/${projectId}`);
      return data.data as { pdfPayload: string; invoice: any };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useInvoice(projectId: string) {
  return useQuery({
    queryKey: ["invoices", projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/invoices/${projectId}`);
      return data.data;
    },
    enabled: !!projectId,
  });
}
