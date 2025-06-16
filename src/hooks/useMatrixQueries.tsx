import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import matrixService from "@/apis/service/matrixService";
import { Matrix } from "@/apis/type";
import toast from "react-hot-toast";

interface MatrixQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  difficulty?: string;
  type?: string;
  tags?: number[];
}

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

export const useGetAllMatrices = (params?: MatrixQueryParams) => {
  return useQuery<{ matrices: Matrix[]; pagination: any }>({
    queryKey: ["matrices", params],
    queryFn: () => matrixService.getAll(params),
  });
};

export const useGetMatricesByUser = (userId: string, params?: MatrixQueryParams) => {
  return useQuery<{ matrices: Matrix[]; pagination: any }>({
    queryKey: ["matrices", "user", userId, params],
    queryFn: async () => {
      const response = await matrixService.getByUser(userId, params);
      console.log('API Response:', response);
      return {
        matrices: Array.isArray(response) ? response : [],
        pagination: { total: Array.isArray(response) ? response.length : 0 }
      };
    },
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
  return useMutation<Matrix, Error, Partial<Matrix>>({
    mutationFn: matrixService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrices"] });
      toast.success("Matrix created successfully");
    },
    onError: () => {
      toast.error("Failed to create matrix");
    },
  });
};

export const useUpdateMatrix = () => {
  const queryClient = useQueryClient();
  return useMutation<Matrix, Error, { matrixId: string; data: Partial<Matrix> }>({
    mutationFn: ({ matrixId, data }) => matrixService.update(matrixId, data),
    onSuccess: (updatedMatrix) => {
      queryClient.invalidateQueries({ queryKey: ["matrices"] });
      queryClient.invalidateQueries({ queryKey: ["matrix", updatedMatrix.id] });
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

export const useCheckMatrixAssignment = () => {
  return useMutation<{ isValid: boolean }, Error, { matrixId: string; courseId: string; userId: string }>({
    mutationFn: ({ matrixId, courseId, userId }) => matrixService.checkAssignment(matrixId, courseId, userId),
  });
};
