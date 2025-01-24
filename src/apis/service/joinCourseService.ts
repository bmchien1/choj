import axiosClient from "@/apis/config/axiosClient";

const joinCourseService = {
  getJoinRequestsByUser: async (id: number): Promise<any> => {
    // console.log("query", query);
    return await axiosClient.get(`/api/join/user/${id}`);
  },
  getRequestsByCreator: async (id: number): Promise<any> => {
    return await axiosClient.get(`/api/join/${id}`);
  },
  approveRequest: async (id: number,action:string): Promise<any> => {
    return await axiosClient.put(`/api/join/${id}`,{action});
  },
  create: async (userId:number,courseId: number): Promise<any> => {
    return await axiosClient.post("/api/join", { userId,courseId });
  },
  getAllJoinRequests: async (): Promise<any> => {
    // console.log("query", query);
    return await axiosClient.get("/api/join");
  },
  getUserInCourseByUser: async (id: number): Promise<any> => {
    // console.log("query", query);
    return await axiosClient.get(`/api/user-in-course/${id}`);
  },
  
};

export default joinCourseService;
