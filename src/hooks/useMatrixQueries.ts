import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import matrixService from "@/apis/service/matrixService";
import { Matrix } from "@/apis/type";

interface MatrixQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

export const useGetMatricesByUser = (userId: string, params?: MatrixQueryParams) => {
  return useQuery({
    queryKey: ["matrices", userId, params],
    queryFn: () => matrixService.getByUser(userId, params),
  });
};

export const useGetAllMatrices = (params?: MatrixQueryParams) => {
  return useQuery({
    queryKey: ["matrices", "all", params],
    queryFn: () => matrixService.getAll(params),
  });
};

export const useGetMatrixById = (matrixId: string) => {
  return useQuery({
    queryKey: ["matrix", matrixId],
    queryFn: () => matrixService.getById(matrixId),
  });
};

export const useCreateMatrix = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Matrix>) => matrixService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrices"] });
    },
  });
};

export const useUpdateMatrix = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matrixId, data }: { matrixId: string; data: Partial<Matrix> }) =>
      matrixService.update(matrixId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrices"] });
    },
  });
};

export const useDeleteMatrix = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matrixId: string) => matrixService.delete(matrixId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrices"] });
    },
  });
}; 