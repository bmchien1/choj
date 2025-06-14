import axiosClient from "@/apis/config/axiosClient.ts";
import { Matrix } from "../type";

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

const matrixService = {
  getByUser: async (userId: string): Promise<Matrix[]> => {
    const response = await axiosClient.get(`/api/matrix/${userId}`);
    return response.data;
  },

  getById: async (matrixId: string): Promise<Matrix> => {
    const response = await axiosClient.get(`/api/matrix/single/${matrixId}`);
    return response.data;
  },

  create: async (userId: string, data: MatrixCreate): Promise<Matrix> => {
    const response = await axiosClient.post(`/api/matrix/${userId}`, data);
    return response.data;
  },

  update: async (matrixId: string, data: Partial<MatrixCreate>): Promise<Matrix> => {
    const response = await axiosClient.put(`/api/matrix/${matrixId}`, data);
    return response.data;
  },

  delete: async (matrixId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/api/matrix/${matrixId}`);
    return response.data;
  },
};

export default matrixService;