import axiosClient from "@/apis/config/axiosClient";
const mockRequests = [
  {
    id: 1,
    user: { email: "user1@example.com" },
    contest: { contestName: "Contest A" },
    status: 0, // Pending
  },
  {
    id: 2,
    user: { email: "user2@example.com" },
    contest: { contestName: "Contest B" },
    status: 1, // Approved
  },
  {
    id: 3,
    user: { email: "user3@example.com" },
    contest: { contestName: "Contest C" },
    status: 2, // Rejected
  },
];

const joinContestService = {
  getMyRequests: async (query: any): Promise<any> => {
    console.log("query", query);
    return await axiosClient.get("/api/join-contest-requests/me", { params: query });
  },
  // getAllRequests: async (query: any): Promise<any> => {
  //   return await axiosClient.get("/api/join-contest-requests", { params: query });
  // },
  // approveRequest: async (id: number): Promise<any> => {
  //   return await axiosClient.put(`/api/join-contest-requests/approve/${id}`);
  // },
  // rejectRequest: async (id: number): Promise<any> => {
  //   return await axiosClient.put(`/api/join-contest-requests/reject/${id}`);
  // },
  getAllRequests: async () => {
    // Simulate delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          contents: mockRequests,
          totalElements: mockRequests.length,
        });
      }, 500);
    });
  },
  approveRequest: async (id: number) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = mockRequests.find((req) => req.id === id);
        if (request) {
          request.status = 1; // Approved
          resolve({ success: true });
        } else {
          reject(new Error("Request not found"));
        }
      }, 500);
    });
  },
  rejectRequest: async (id: number) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = mockRequests.find((req) => req.id === id);
        if (request) {
          request.status = 2; // Rejected
          resolve({ success: true });
        } else {
          reject(new Error("Request not found"));
        }
      }, 500);
    });
  },
  create: async (contestId: number): Promise<any> => {
    return await axiosClient.post("/api/join-contest-requests", { contestId });
  },
  
};

export default joinContestService;
