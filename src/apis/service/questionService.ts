import { Question } from "@/apis/type";
import axiosClient from "@/apis/config/axiosClient";

const questionService = {
  createQuestion: async (question: Question): Promise<Question> => {
    try {
      const response = await axiosClient.post("/api/questions", question);
      return response.data;
    } catch (error) {
      console.error("Error creating question:", error);
      throw error;
    }
  },

  getAllQuestionTags: async (query: {
    page: number;
    limit: number;
  } = { page: 0, limit: 100 }) => {
    try {
      const response = await axiosClient.get("/api/question-tag", {
        params: query,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching question tags:", error);
      throw error;
    }
  },

  getAll: async ({ page, limit }: { page: number; limit: number }) => {
    try {
      const response = await axiosClient.get("/api/questions", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  },

  getByCreator: async (
    creatorId: number,
    { page, limit }: { page: number; limit: number }
  ) => {
    try {
      const response = await axiosClient.get(`/api/questions/${creatorId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching questions for creator ${creatorId}:`, error);
      throw error;
    }
  },

  updateQuestion: async (
    questionId: string,
    question: Partial<Question>
  ): Promise<Question> => {
    try {
      const response = await axiosClient.put(
        `/api/questions/${questionId}`,
        question
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating question with ID ${questionId}:`, error);
      throw error;
    }
  },

  deleteQuestion: async (questionId: number): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.delete(`/api/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting question with ID ${questionId}:`, error);
      throw error;
    }
  },
};

export default questionService;