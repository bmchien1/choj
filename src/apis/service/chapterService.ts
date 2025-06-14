import axiosClient from "@/apis/config/axiosClient.ts";
import { Chapter } from "../type";

const chapterService = {
  getByCourse: async (courseId: string): Promise<Chapter[]> => {
    const response = await axiosClient.get(`/api/chapters/${courseId}`);
    return response.data;
  },

  getById: async (chapterId: string): Promise<Chapter> => {
    const response = await axiosClient.get(`/api/chapters/single/${chapterId}`);
    return response.data;
  },

  create: async (courseId: string, data: Chapter): Promise<Chapter> => {
    const response = await axiosClient.post(`/api/chapters/${courseId}`, data);
    return response.data;
  },

  update: async (chapterId: string, data: Partial<Chapter>): Promise<Chapter> => {
    const response = await axiosClient.put(`/api/chapters/${chapterId}`, data);
    return response.data;
  },

  delete: async (chapterId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/api/chapters/${chapterId}`);
    return response.data;
  },

  updateOrder: async (chapterId: string, order: number): Promise<Chapter> => {
    const response = await axiosClient.put(`/api/chapters/${chapterId}`, { order });
    return response.data;
  },
};

export default chapterService; 