import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import userLessonService from "@/apis/service/userLessonService";

export const useMarkLessonCompleted = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, lessonId, completed }: { userId: number, lessonId: number, completed: boolean }) =>
      userLessonService.markCompleted(userId, lessonId, completed),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["completed-lessons", userId] });
    }
  });
};

export const useCompletedLessons = (userId: number) => {
  return useQuery({
    queryKey: ["completed-lessons", userId],
    queryFn: () => userLessonService.getCompletedLessons(userId),
    enabled: !!userId,
  });
};

export const useIsLessonCompleted = (userId: number, lessonId: number) => {
  return useQuery({
    queryKey: ["is-lesson-completed", userId, lessonId],
    queryFn: () => userLessonService.isLessonCompleted(userId, lessonId),
    enabled: !!userId && !!lessonId,
  });
}; 