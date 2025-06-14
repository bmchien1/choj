import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import chapterService from "@/apis/service/chapterService";
import { Chapter } from "@/apis/type";
import toast from "react-hot-toast";

export const useGetChaptersByCourse = (courseId: string) => {
  return useQuery<Chapter[]>({
    queryKey: ["chapters", courseId],
    queryFn: () => chapterService.getByCourse(courseId),
    enabled: !!courseId,
  });
};

export const useGetChapterById = (chapterId: string) => {
  return useQuery<Chapter>({
    queryKey: ["chapter", chapterId],
    queryFn: () => chapterService.getById(chapterId),
    enabled: !!chapterId,
  });
};

export const useCreateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation<Chapter, Error, { courseId: string; data: Chapter }>({
    mutationFn: ({ courseId, data }) => chapterService.create(courseId, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", courseId] });
      toast.success("Chapter created successfully");
    },
    onError: () => {
      toast.error("Failed to create chapter");
    },
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Chapter,
    Error,
    { chapterId: string; data: Partial<Chapter> }
  >({
    mutationFn: ({ chapterId, data }) => chapterService.update(chapterId, data),
    onSuccess: (_updatedChapter, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter", chapterId] });
      toast.success("Chapter updated successfully");
    },
    onError: () => {
      toast.error("Failed to update chapter");
    },
  });
};

export const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: chapterService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("Chapter deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete chapter");
    },
  });
}; 