import axiosClient from "@/apis/config/axiosClient";
import { Matrix } from "../type";

interface MatrixQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

const matrixService = {
  getAll: async (params?: MatrixQueryParams): Promise<{ matrices: Matrix[]; pagination: any }> => {
    const response = await axiosClient.get("/api/matrix", { params });
    return response.data;
  },

  getByUser: async (userId: string, params?: MatrixQueryParams): Promise<{ matrices: Matrix[]; pagination: any }> => {
    const response = await axiosClient.get(`/api/matrix/${userId}`, { params });
    return response.data;
  },

  getById: async (matrixId: string): Promise<Matrix> => {
    const response = await axiosClient.get(`/api/matrix/${matrixId}`);
    return response.data;
  },

  create: async (data: Partial<Matrix>): Promise<Matrix> => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const response = await axiosClient.post(`/api/matrix/${user.id}`, data);
    return response.data;
  },

  update: async (matrixId: string, data: Partial<Matrix>): Promise<Matrix> => {
    const response = await axiosClient.put(`/api/matrix/${matrixId}`, data);
    return response.data;
  },

  delete: async (matrixId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/api/matrix/${matrixId}`);
    return response.data;
  },

  checkAssignment: async (courseId: string, matrixId: string, userId: string): Promise<{ isValid: boolean; message?: string }> => {
    const response = await axiosClient.post(`/api/matrix/${matrixId}/check`, {
      courseId,
      userId,
    });
    return response.data;
  },
};

export default matrixService;