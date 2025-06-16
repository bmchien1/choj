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

  // New methods for assignment attempts
  startAttempt: async (assignmentId: string): Promise<any> => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const response = await axiosClient.post(`/api/assignments/${assignmentId}/start`, { userId: user.id });
    return response.data;
  },

  updateAttemptActive: async (attemptId: string): Promise<any> => {
    const response = await axiosClient.put(`/api/assignments/attempt/${attemptId}/active`);
    return response.data;
  },

  submitAttempt: async (attemptId: string): Promise<any> => {
    const response = await axiosClient.put(`/api/assignments/attempt/${attemptId}/submit`);
    return response.data;
  },

  getActiveAttempt: async (assignmentId: string): Promise<any> => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const response = await axiosClient.get(`/api/assignments/${assignmentId}/attempt`, { params: { userId: user.id } });
    return response.data;
  },

  updateTimeLeft: async (attemptId: string, timeLeft: number): Promise<any> => {
    const response = await axiosClient.put(`/api/assignments/attempt/${attemptId}/time`, { timeLeft });
    return response.data;
  },

  saveTemporaryAnswers: async (attemptId: string, answers: any): Promise<any> => {
    const response = await axiosClient.put(`/api/assignments/attempt/${attemptId}/answers`, { answers });
    return response.data;
  },

  getTemporaryAnswers: async (attemptId: string): Promise<any> => {
    const response = await axiosClient.get(`/api/assignments/attempt/${attemptId}/answers`);
    return response.data;
  },
};

export default assignmentService;