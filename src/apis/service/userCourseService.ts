import axiosClient from "@/apis/config/axiosClient.ts";
import { JoinCourseRequest } from "../type";

const userCourseService = {
  // Lấy danh sách khóa học của user
  getAll: async (id: number): Promise<any> => {
    const response= await axiosClient.get(`/api/user-in-course/${id}`);
	return response.data;
  },

  // Gửi yêu cầu tham gia khóa học
  join: async (data: JoinCourseRequest): Promise<any> => {
    const response = await axiosClient.post("/api/join", data);
    return response.data;
  },

  // Lấy danh sách yêu cầu tham gia khóa học của user
  getJoinCourseRequestsByUser: async (userId: number): Promise<any> => {
    const response = await axiosClient.get(`/api/join/user/${userId}`);
    return response.data;
  },

  // Lấy danh sách yêu cầu tham gia khóa học theo creator (dành cho ADMIN/TEACHER)
  getJoinCourseRequestsByCreator: async (creatorId: number): Promise<any> => {
    const response = await axiosClient.get(`/api/join/${creatorId}`);
    return response.data;
  },

  // Lấy tất cả yêu cầu tham gia khóa học (dành cho ADMIN/TEACHER)
  getAllJoinCourseRequests: async (): Promise<any> => {
    const response = await axiosClient.get("/api/join");
    return response.data;
  },
};

export default userCourseService;