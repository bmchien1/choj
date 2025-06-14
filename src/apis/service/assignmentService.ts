import axiosClient from "@/apis/config/axiosClient.ts";
import { Assignment, AssignmentCreate } from "../type";

const assignmentService = {
  getByCourse: async (courseId: string): Promise<Assignment[]> => {
    const response = await axiosClient.get(`/api/assignments/${courseId}`);
    return response.data;
  },

  getById: async (assignmentId: string): Promise<Assignment> => {
    const response = await axiosClient.get(`/api/assignments/single/${assignmentId}`);
    return response.data;
  },

  create: async (courseId: string, data: AssignmentCreate): Promise<Assignment> => {
    const response = await axiosClient.post(`/api/assignments/${courseId}`, {
      ...data,
      question_scores: data.question_scores,
      total_points: data.total_points,
    });
    return response.data;
  },

  update: async (assignmentId: string, data: Partial<Assignment>): Promise<Assignment> => {
    const response = await axiosClient.put(`/api/assignments/${assignmentId}`, data);
    return response.data;
  },

  delete: async (assignmentId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/api/assignments/${assignmentId}`);
    return response.data;
  },

  updateOrder: async (assignmentId: string, order: number, chapterId?: number): Promise<Assignment> => {
    const response = await axiosClient.put(`/api/assignments/${assignmentId}`, { order, chapterId });
    return response.data;
  },
};

export default assignmentService;