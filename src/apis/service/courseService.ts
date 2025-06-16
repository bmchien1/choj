import axiosClient from "@/apis/config/axiosClient.ts";
import { Course } from "../type";

interface CourseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  class?: string;
  subject?: string;
}

const courseService = {
  getAll: async (params?: CourseQueryParams): Promise<{ courses: Course[]; pagination: any }> => {
    const response = await axiosClient.get("/api/courses", { params });
    return response.data;
  },

  getById: async (courseId: string): Promise<Course> => {
    const response = await axiosClient.get(`/api/courses/${courseId}`);
    return response.data;
  },

  getByCreator: async (creatorId: string, params?: CourseQueryParams): Promise<{ courses: Course[]; pagination: any }> => {
    const response = await axiosClient.get(`/api/courses/creator/${creatorId}`, { params });
    return response.data;
  },

  create: async (data: Course): Promise<Course> => {
    const response = await axiosClient.post("/api/courses", data);
    return response.data;
  },

  update: async (courseId: string, data: Partial<Course>): Promise<Course> => {
    const response = await axiosClient.put(`/api/courses/${courseId}`, data);
    return response.data;
  },

  delete: async (courseId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/api/courses/${courseId}`);
    return response.data;
  },

  getCourseContent: async (courseId: string): Promise<Array<{ type: string; id: number; title: string; order: number }>> => {
    const response = await axiosClient.get(`/api/courses/${courseId}/content`);
    return response.data;
  },
};

export default courseService;