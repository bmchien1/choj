import axiosClient from "@/apis/config/axiosClient";

const joinCourseService = {
  getMyRequests: async (query: any): Promise<any> => {
    console.log("query", query);
    return await axiosClient.get("/api/join-course-requests/me", { params: query });
  },
  getAllRequests: async (query: any): Promise<any> => {
    return await axiosClient.get("/api/join-course-requests", { params: query });
  },
  approveRequest: async (id: number): Promise<any> => {
    return await axiosClient.put(`/api/join-course-requests/approve/${id}`);
  },
  rejectRequest: async (id: number): Promise<any> => {
    return await axiosClient.put(`/api/join-course-requests/reject/${id}`);
  },
  create: async (courseId: number): Promise<any> => {
    return await axiosClient.post("/api/join-course-requests", { courseId });
  },
};

export default joinCourseService;
