import axiosClient from "@/apis/config/axiosClient";

const joinContestService = {
  getMyRequests: async (query: any): Promise<any> => {
    console.log("query", query);
    return await axiosClient.get("/api/join-contest-requests/me", { params: query });
  },
  getAllRequests: async (query: any): Promise<any> => {
    return await axiosClient.get("/api/join-contest-requests", { params: query });
  },
  approveRequest: async (id: number): Promise<any> => {
    return await axiosClient.put(`/api/join-contest-requests/approve/${id}`);
  },
  rejectRequest: async (id: number): Promise<any> => {
    return await axiosClient.put(`/api/join-contest-requests/reject/${id}`);
  },
  create: async (contestId: number): Promise<any> => {
    return await axiosClient.post("/api/join-contest-requests", { contestId });
  },
};

export default joinContestService;
