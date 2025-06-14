import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import userCourseService from "@/apis/service/userCourseService";
import { JoinCourseRequest } from "@/apis/type";

// Hook để tham gia khóa học
export const useJoinCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, JoinCourseRequest>({
    mutationFn: userCourseService.join,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinCourseRequests"] });
      toast.success("Join course request submitted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit join request");
    },
  });
};

// Hook để lấy danh sách yêu cầu tham gia khóa học của user
export const useGetJoinCourseRequestsByUser = (userId: number) => {
  return useQuery<any[], Error>({
    queryKey: ["joinCourseRequests", userId],
    queryFn: () => userCourseService.getJoinCourseRequestsByUser(userId),
    enabled: !!userId, // Chỉ chạy khi userId hợp lệ
  });
};

// Hook để lấy danh sách yêu cầu tham gia khóa học theo creator
export const useGetJoinCourseRequestsByCreator = (creatorId: number) => {
  return useQuery<any[], Error>({
    queryKey: ["joinCourseRequests", creatorId],
    queryFn: () => userCourseService.getJoinCourseRequestsByCreator(creatorId),
    enabled: !!creatorId, // Chỉ chạy khi creatorId hợp lệ
  });
};

// Hook để lấy tất cả yêu cầu tham gia khóa học (ADMIN/TEACHER)
export const useGetAllJoinCourseRequests = () => {
  return useQuery<any[], Error>({
    queryKey: ["joinCourseRequests"],
    queryFn: userCourseService.getAllJoinCourseRequests,
  });
};

// Hook để lấy danh sách khóa học của user
export const useGetUserCourses = (userId: number) => {
  return useQuery<any[], Error>({
    queryKey: ["userCourses", userId],
    queryFn: () => userCourseService.getAll(userId),
    enabled: !!userId, // Chỉ chạy khi userId hợp lệ
  });
};
export { useQueryClient, useMutation };

