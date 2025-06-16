import axiosClient from "@/apis/config/axiosClient";
import { Tag } from "@/apis/type";

interface TagQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

const tagService = {
  createTag: async (tag: Partial<Tag>): Promise<Tag> => {
    try {
      const response = await axiosClient.post('/api/tags', tag);
      return response.data;
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  },

  getAllTags: async (): Promise<Tag[]> => {
    try {
      const response = await axiosClient.get('/api/tags');
      return response.data;
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },

  getTagsByCreator: async (creatorId: number, params?: TagQueryParams): Promise<{ tags: Tag[]; pagination: any }> => {
    try {
      const response = await axiosClient.get(`/api/tags/creator/${creatorId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching tags for creator ${creatorId}:`, error);
      throw error;
    }
  },

  getTagById: async (tagId: number): Promise<Tag> => {
    try {
      const response = await axiosClient.get(`/api/tags/${tagId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tag with ID ${tagId}:`, error);
      throw error;
    }
  },

  updateTag: async (tagId: number, tag: Partial<Tag>): Promise<Tag> => {
    try {
      const response = await axiosClient.put(`/api/tags/${tagId}`, tag);
      return response.data;
    } catch (error) {
      console.error(`Error updating tag with ID ${tagId}:`, error);
      throw error;
    }
  },

  deleteTag: async (tagId: number): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.delete(`/api/tags/${tagId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting tag with ID ${tagId}:`, error);
      throw error;
    }
  },

  addTagToQuestion: async (questionId: number, tagId: number): Promise<any> => {
    try {
      const response = await axiosClient.post(`/api/tags/question/${questionId}/tag/${tagId}`);
      return response.data;
    } catch (error) {
      console.error(`Error adding tag ${tagId} to question ${questionId}:`, error);
      throw error;
    }
  },

  getAll: async (params?: TagQueryParams): Promise<{ tags: Tag[]; pagination: any }> => {
    const response = await axiosClient.get("/api/tags", { params });
    return response.data;
  },

  getById: async (tagId: string): Promise<Tag> => {
    const response = await axiosClient.get(`/api/tags/${tagId}`);
    return response.data;
  },

  update: async (tagId: string, data: Partial<Tag>): Promise<Tag> => {
    const response = await axiosClient.put(`/api/tags/${tagId}`, data);
    return response.data;
  },

  delete: async (tagId: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/api/tags/${tagId}`);
    return response.data;
  },
};

export default tagService;