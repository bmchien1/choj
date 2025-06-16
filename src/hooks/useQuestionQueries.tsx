import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Question, QuestionTable } from "@/apis/type";
import toast from "react-hot-toast";
import questionService from "@/apis/service/questionService";

interface PaginatedQuestions {
  questions: QuestionTable[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface QueryParams {
  page: number;
  limit: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  difficulty?: string;
  type?: string;
  tags?: number[];
}

export const useGetAllQuestions = (params: QueryParams) => {
  return useQuery<PaginatedQuestions>({
    queryKey: ["questions", params],
    queryFn: () => questionService.getAll(params),
  });
};

export const useGetQuestionsByCreator = (
  creatorId: number,
  params: QueryParams
) => {
  return useQuery<PaginatedQuestions>({
    queryKey: ["questions", creatorId, params],
    queryFn: async () => {
      const response = await questionService.getByCreator(creatorId, params);
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
      return {
        questions: response.questions.map((q: Question) => ({
        id: q.id!,
        questionName: q.questionName,
        questionType: q.questionType,
        question: q.question,
        difficulty_level: q.difficulty_level,
        creatorName: user.email || '',
        tags: q.tags || []
        })),
        pagination: response.pagination
      };
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
