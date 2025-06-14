import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import lessonService from "@/apis/service/lessonService";
import { Lesson, LessonView } from "@/apis/type";
import toast from "react-hot-toast";

export const useGetLessonsByCourse = (courseId: string) => {
  return useQuery<Lesson[]>({
    queryKey: ["lessons", courseId],
    queryFn: () => lessonService.getByCourse(courseId),
    enabled: !!courseId,
  });
};

export const useGetLessonById = (lessonId: string) => {
  return useQuery<LessonView>({
    queryKey: ["lesson", lessonId],
    queryFn: () => lessonService.getById(lessonId),
    enabled: !!lessonId,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation<Lesson, Error, { courseId: string; data: Lesson }>({
    mutationFn: ({ courseId, data }) => lessonService.create(courseId, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courseContent", courseId] });
      toast.success("Lesson created successfully");
    },
    onError: () => {
      toast.error("Failed to create lesson");
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Lesson,
    Error,
    { lessonId: string; data: Partial<Lesson> }
  >({
    mutationFn: ({ lessonId, data }) => lessonService.update(lessonId, data),
    onSuccess: (updatedLesson, { lessonId }) => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["courseContent"] });
      toast.success("Lesson updated successfully");
    },
    onError: () => {
      toast.error("Failed to update lesson");
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: lessonService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["courseContent"] });
      toast.success("Lesson deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete lesson");
    },
  });
};

export const useUpdateLessonOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Lesson,
    Error,
    { lessonId: string; order: number; chapterId?: number }
  >({
    mutationFn: ({ lessonId, order, chapterId }) =>
      lessonService.updateOrder(lessonId, order, chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
