import { CreateQuestionRequest } from "@/apis/type";
import axiosClient from "@/apis/config/axiosClient";

const questionService = {
  // Create a new question
  createQuestion: async (question: CreateQuestionRequest) => {
    try {
      console.log(question);
      const response = await axiosClient.post('/api/questions', question);
      return response.data;
    } catch (error) {
      console.error("Error creating question:", error);
      throw error;
    }
  },

  // Get all question tags
  getAllQuestionTags: async (query: { page: number; limit: number } = { page: 0, limit: 100 }) => {
    try {
      const response = await axiosClient.get('/api/question-tag', { params: query });
      return response.data;
    } catch (error) {
      console.error("Error fetching question tags:", error);
      throw error;
    }
  },

  // Get all questions
  getAll: async (query: Record<string, any> = {}) => {
    try {
      const response = await axiosClient.get('/api/questions', { params: query });
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  },

  // Get a single question by ID
  getOne: async (questionId: string) => {
    try {
      const response = await axiosClient.get(`/api/question/${questionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching question with ID ${questionId}:`, error);
      throw error;
    }
  },

  // Get all questions for admin view
	getAllAdmin: async (query: any = {}): Promise<any> => {
    return   await axiosClient.get('/api/questions', { params: query });
  },

  // Get a single admin question by ID
  getOneAdmin: async (questionId: string) => {
    try {
      const response = await axiosClient.get(`/api/question/admin/${questionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching admin question with ID ${questionId}:`, error);
      throw error;
    }
  },

  // Update a question
  updateQuestion: async (questionId: string, question: CreateQuestionRequest) => {
    try {
      const response = await axiosClient.put(`/api/question/${questionId}`, question);
      return response.data;
    } catch (error) {
      console.error(`Error updating question with ID ${questionId}:`, error);
      throw error;
    }
  },

  // Delete (soft delete) a question
  deleteQuestion: async (questionId: number) => {
    try {
      const response = await axiosClient.delete(`/api/question/soft/${questionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting question with ID ${questionId}:`, error);
      throw error;
    }
  },
};

export default questionService;
