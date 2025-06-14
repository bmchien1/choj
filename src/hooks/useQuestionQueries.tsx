import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Question, QuestionTable } from "@/apis/type";
import toast from "react-hot-toast";
import questionService from "@/apis/service/questionService";

interface PaginatedQuestions {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useGetAllQuestions = (page: number = 1, limit: number = 10) => {
  return useQuery<PaginatedQuestions>({
    queryKey: ["questions", page, limit],
    queryFn: () => questionService.getAll({ page, limit }),
  });
};

export const useGetQuestionsByCreator = (
  creatorId: number,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery<QuestionTable[]>({
    queryKey: ["questions", creatorId, page, limit],
    queryFn: async () => {
      const response = await questionService.getByCreator(creatorId, { page, limit });
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
      return response.questions.map((q: Question) => ({
        id: q.id!,
        questionName: q.questionName,
        questionType: q.questionType,
        question: q.question,
        difficulty_level: q.difficulty_level,
        creatorName: user.email || '',
        tags: q.tags || []
      }));
    },
    enabled: !!creatorId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<Question, Error, Question>({
    mutationFn: questionService.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question created successfully");
    },
    onError: () => {
      toast.error("Failed to create question");
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Question,
    Error,
    { questionId: string; data: Partial<Question> }
  >({
    mutationFn: ({ questionId, data }) =>
      questionService.updateQuestion(questionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question updated successfully");
    },
    onError: () => {
      toast.error("Failed to update question");
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: questionService.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete question");
    },
  });
};
