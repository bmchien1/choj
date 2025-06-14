import axiosClient from "@/apis/config/axiosClient";
import { Tag } from "@/apis/type";

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

  getTagsByCreator: async (creatorId: number): Promise<Tag[]> => {
    try {
      const response = await axiosClient.get(`/api/tags/creator/${creatorId}`);
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
};

export default tagService;