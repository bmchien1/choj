import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import tagService from "@/apis/service/tagService";
import { Tag } from "@/apis/type";
import toast from "react-hot-toast";

interface TagQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

export const useGetAllTags = (params?: TagQueryParams) => {
  return useQuery<{ tags: Tag[]; pagination: any }>({
    queryKey: ["tags", params],
    queryFn: () => tagService.getAll(params),
  });
};

export const useGetTagsByCreator = (creatorId: number, params?: TagQueryParams) => {
  return useQuery<{ tags: Tag[]; pagination: any }>({
    queryKey: ["tags", "creator", creatorId, params],
    queryFn: () => tagService.getTagsByCreator(creatorId, params),
    enabled: !!creatorId,
  });
};

export const useGetTagById = (tagId: string) => {
  return useQuery<Tag>({
    queryKey: ["tag", tagId],
    queryFn: () => tagService.getById(tagId),
    enabled: !!tagId,
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
  return useMutation<Tag, Error, { tagId: string; data: Partial<Tag> }>({
    mutationFn: ({ tagId, data }) => tagService.update(tagId, data),
    onSuccess: (updatedTag) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["tag", updatedTag.id] });
      toast.success("Tag updated successfully");
    },
    onError: () => {
      toast.error("Failed to update tag");
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: tagService.delete,
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
