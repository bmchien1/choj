import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import courseService from "@/apis/service/courseService";
import { Course } from "@/apis/type";
import toast from "react-hot-toast";

interface CourseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  class?: string;
  subject?: string;
}

export const useGetAllCourses = (params?: CourseQueryParams) => {
  return useQuery<{ courses: Course[]; pagination: any }>({
    queryKey: ["courses", params],
    queryFn: () => courseService.getAll(params),
  });
};

export const useGetCourseById = (courseId: string) => {
  return useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getById(courseId),
    enabled: !!courseId,
  });
};

export const useGetCoursesByCreator = (creatorId: string, params?: CourseQueryParams) => {
  return useQuery<{ courses: Course[]; pagination: any }>({
    queryKey: ["courses", "creator", creatorId, params],
    queryFn: () => courseService.getByCreator(creatorId, params),
    enabled: !!creatorId,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<Course, Error, Course>({
    mutationFn: courseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => {
      toast.error("Failed to create course");
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Course,
    Error,
    { courseId: string; data: Partial<Course> }
  >({
    mutationFn: ({ courseId, data }) => courseService.update(courseId, data),
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", updatedCourse.id] });
    },
    onError: () => {
      toast.error("Failed to update course");
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: courseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: () => {
      toast.error("Failed to delete course");
    },
  });
};

export const useGetCourseContent = (courseId: string) => {
  return useQuery<
    Array<{ type: string; id: number; title: string; order: number }>
  >({
    queryKey: ["courseContent", courseId],
    queryFn: () => courseService.getCourseContent(courseId),
    enabled: !!courseId,
  });
};
