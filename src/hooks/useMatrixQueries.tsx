import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import matrixService from "@/apis/service/matrixService";
import { Matrix } from "@/apis/type";
import toast from "react-hot-toast";

interface MatrixCreate {
  name: string;
  description?: string;
  total_points?: number;
  criteria: {
    questionType: string;
    difficulty_level: string;
    tagIds: number[];
    percentage: number;
  }[];
}

export const useGetMatricesByUser = (userId: string) => {
  return useQuery<Matrix[]>({
    queryKey: ["matrices", userId],
    queryFn: () => matrixService.getByUser(userId),
    enabled: !!userId,
  });
};

export const useGetMatrixById = (matrixId: string) => {
  return useQuery<Matrix>({
    queryKey: ["matrix", matrixId],
    queryFn: () => matrixService.getById(matrixId),
    enabled: !!matrixId,
  });
};

export const useCreateMatrix = () => {
  const queryClient = useQueryClient();
  return useMutation<Matrix, Error, { userId: string; data: MatrixCreate }>({
    mutationFn: ({ userId, data }) => matrixService.create(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["matrices", userId] });
      toast.success("Matrix created successfully");
    },
    onError: () => {
      toast.error("Failed to create matrix");
    },
  });
};

export const useUpdateMatrix = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Matrix,
    Error,
    { matrixId: string; data: Partial<MatrixCreate> }
  >({
    mutationFn: ({ matrixId, data }) => matrixService.update(matrixId, data),
    onSuccess: (updatedMatrix, { matrixId }) => {
      queryClient.invalidateQueries({ queryKey: ["matrices"] });
      queryClient.invalidateQueries({ queryKey: ["matrix", matrixId] });
      toast.success("Matrix updated successfully");
    },
    onError: () => {
      toast.error("Failed to update matrix");
    },
  });
};

export const useDeleteMatrix = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: matrixService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrices"] });
      toast.success("Matrix deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete matrix");
    },
  });
};
