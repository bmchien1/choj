import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import assignmentService from "@/apis/service/assignmentService";
import { Assignment, AssignmentCreate, Question } from "@/apis/type";
import toast from "react-hot-toast";
import axiosClient from "@/apis/config/axiosClient.ts";

interface MatrixAssignmentCheck {
  isValid: boolean;
  message: string;
  selectedQuestions?: { [criterionIndex: number]: Question[] };
}

export const useGetAssignmentsByCourse = (courseId: string) => {
  return useQuery<Assignment[]>({
    queryKey: ["assignments", courseId],
    queryFn: () => assignmentService.getByCourse(courseId),
    enabled: !!courseId,
  });
};

export const useGetAssignmentById = (assignmentId: string) => {
  return useQuery<Assignment>({
    queryKey: ["assignment", assignmentId],
    queryFn: () => assignmentService.getById(assignmentId),
    enabled: !!assignmentId,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Assignment,
    Error,
    { courseId: string; data: AssignmentCreate }
  >({
    mutationFn: ({ courseId, data }) =>
      assignmentService.create(courseId, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["assignments", courseId] });
      queryClient.invalidateQueries({
        queryKey: ["courseContent", courseId],
      });
      toast.success("Assignment created successfully");
    },
    onError: () => {
      toast.error("Failed to create assignment");
    },
  });
};

export const useCreateAssignmentFromMatrix = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Assignment,
    Error,
    {
      courseId: string;
      matrixId: string;
      userId: string;
      data: Omit<
        AssignmentCreate,
        "questionIds" | "question_scores" | "total_points"
      >;
    }
  >({
    mutationFn: ({ courseId, matrixId, userId, data }) =>
      axiosClient
        .post(`/api/assignments/matrix/${courseId}/${matrixId}/${userId}`, data)
        .then((res) => res.data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["assignments", courseId] });
      queryClient.invalidateQueries({
        queryKey: ["courseContent", courseId],
      });
      toast.success("Assignment created successfully");
    },
    onError: () => {
      toast.error("Failed to create assignment");
    },
  });
};

export const useCheckMatrixAssignment = () => {
  return useMutation<
    MatrixAssignmentCheck,
    Error,
    { courseId: string; matrixId: string; userId: string }
  >({
    mutationFn: ({ courseId, matrixId, userId }) =>
      axiosClient
        .get(`/api/assignments/matrix/check/${courseId}/${matrixId}/${userId}`)
        .then((res) => res.data),
    onSuccess: (result) => {
      if (result.isValid) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: () => {
      toast.error("Failed to check matrix");
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Assignment,
    Error,
    { assignmentId: string; data: Partial<Assignment> }
  >({
    mutationFn: ({ assignmentId, data }) =>
      assignmentService.update(assignmentId, data),
    onSuccess: (updatedAssignment, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["courseContent"] });
      toast.success("Assignment updated successfully");
    },
    onError: () => {
      toast.error("Failed to update assignment");
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: assignmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["courseContent"] });
      toast.success("Assignment deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete assignment");
    },
  });
};

export const useUpdateAssignmentOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Assignment,
    Error,
    { assignmentId: string; order: number; chapterId?: number }
  >({
    mutationFn: ({ assignmentId, order, chapterId }) =>
      assignmentService.updateOrder(assignmentId, order, chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
