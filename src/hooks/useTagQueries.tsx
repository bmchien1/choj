import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tagService from "@/apis/service/tagService";
import { Tag } from "@/apis/type";
import toast from "react-hot-toast";

export const useGetAllTags = () => {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: tagService.getAllTags,
  });
};

export const useGetTagsByCreator = (creatorId: number) => {
  return useQuery<Tag[]>({
    queryKey: ["tags", creatorId],
    queryFn: () => tagService.getTagsByCreator(creatorId),
    enabled: !!creatorId,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation<Tag, Error, Partial<Tag>>({
    mutationFn: tagService.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag created successfully");
    },
    onError: () => {
      toast.error("Failed to create tag");
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation<Tag, Error, { tagId: number; data: Partial<Tag> }>({
    mutationFn: ({ tagId, data }) => tagService.updateTag(tagId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag updated successfully");
    },
    onError: () => {
      toast.error("Failed to update tag");
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: tagService.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete tag");
    },
  });
};

export const useAddTagToQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { questionId: number; tagId: number }>({
    mutationFn: ({ questionId, tagId }) =>
      tagService.addTagToQuestion(questionId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Tag added to question successfully");
    },
    onError: () => {
      toast.error("Failed to add tag to question");
    },
  });
};
