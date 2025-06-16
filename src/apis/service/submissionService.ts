import axiosClient from "@/apis/config/axiosClient.ts";
import { Submission, SubmissionCreate, BuildRequest, BuildResponse } from "@/apis/type";


const submissionService = {
  getAll: async (query: any = {}): Promise<any> => {
    return await axiosClient.get("/api/submissions/me", { params: query });
  },

  getAllAdmin: async (): Promise<Submission[]> => {
    return await axiosClient.get("/api/submissions").then(res => res.data);
  },

  getByCourse: async (courseId: number): Promise<Submission[]> => {
    return await axiosClient.get(`/api/submissions/course/${courseId}`).then(res => res.data);
  },

  getByContest: async (contestId: number): Promise<Submission[]> => {
    console.log(contestId);
    return await axiosClient.get(`/api/submissions/contest/${contestId}`).then(res => res.data);
  },

  getByUser: async (userId: number): Promise<Submission[]> => {
    return await axiosClient.get(`/api/submissions/user/${userId}`).then(res => res.data);
  },

  create: async (data: SubmissionCreate): Promise<any> => {
    try {
      console.log('Creating submission with data:', data);
      const response = await axiosClient.post("/api/submissions", data);
      console.log('Submission service response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Submission service error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || error.message || "Failed to create submission");
    }
  },

  getByHash: async (hash: string): Promise<any> => {
    return await axiosClient.get(`/api/submissions/get-by-hash/${hash}`);
  },

  getByHashAdmin: async (hash: string): Promise<any> => {
    return await axiosClient.get(`/api/submissions/admin/get-by-hash/${hash}`);
  },

  build: async (data: BuildRequest): Promise<BuildResponse> => {
    return await axiosClient
      .post("/api/submissions/build", data)
      .then((res) => res.data);
  },

  getByAssignment: async (assignmentId: number): Promise<Submission[]> => {
    return await axiosClient.get(`/api/submissions/assignment/${assignmentId}`).then(res => res.data);
  },

  getByAssignmentAndUser: async (assignmentId: number, userId: number): Promise<Submission[]> => {
    return await axiosClient.get(`/api/submissions/assignment/${assignmentId}/user/${userId}`).then(res => res.data);
  },

};

export default submissionService;